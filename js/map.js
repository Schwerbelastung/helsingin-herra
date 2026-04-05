// Helsinki Tycoon - Map Rendering & Interaction
const MapRenderer = (() => {
    let canvas, ctx;
    let camera = { x: 0, y: 0, zoom: 1 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let cameraStart = { x: 0, y: 0 };
    let hoveredDistrict = null;
    let hoveredProperty = null;
    let hoveredLandmark = null;
    let currentSeason = 'winter';

    // Season color palettes
    const seasonPalettes = {
        winter: {
            water: '#1a4a5a',
            waterLight: '#2a5a6a',
            waterDark: '#0f3545',
            land: '#c8ccd8',
            landAlt: '#b8bcc8',
            park: '#6a8a7a',
            road: '#8a8a9a',
            roadMajor: '#a0a0b0',
            coastEdge: '#8899aa',
            sand: '#9a9aaa',
            snow: true,
        },
        spring: {
            water: '#2a6878',
            waterLight: '#3a7888',
            waterDark: '#1a5060',
            land: '#8aaa7a',
            landAlt: '#7a9a6a',
            park: '#4a8a3a',
            road: '#7a7a7a',
            roadMajor: '#909090',
            coastEdge: '#5a7a5a',
            sand: '#b8a878',
            snow: false,
        },
        summer: {
            water: '#2a7a8a',
            waterLight: '#3a8a9a',
            waterDark: '#1a6070',
            land: '#6a9a5a',
            landAlt: '#5a8a4a',
            park: '#3a7a2a',
            road: '#7a7a6a',
            roadMajor: '#909080',
            coastEdge: '#4a7a4a',
            sand: '#c8b878',
            snow: false,
        },
        autumn: {
            water: '#1f5565',
            waterLight: '#2a6575',
            waterDark: '#154050',
            land: '#9a8a5a',
            landAlt: '#8a7a4a',
            park: '#7a6a3a',
            road: '#7a7a7a',
            roadMajor: '#909090',
            coastEdge: '#7a7a5a',
            sand: '#a89868',
            snow: false,
        },
    };

    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        resize();
        setupEvents();
        // Center camera on Helsinki peninsula
        camera.x = -HelsinkiDistricts.MAP_WIDTH / 2 + cssWidth / 2;
        camera.y = -HelsinkiDistricts.MAP_HEIGHT / 2 + cssHeight / 2;
        camera.zoom = Math.min(
            cssWidth / HelsinkiDistricts.MAP_WIDTH,
            cssHeight / HelsinkiDistricts.MAP_HEIGHT
        ) * 0.85;
    }

    // Logical (CSS) dimensions — use these for all coordinate math
    let cssWidth = 0, cssHeight = 0;

    function resize() {
        // Use the canvas element's CSS-computed size (set by flex layout)
        // Do NOT set canvas.style.width/height — let CSS (flex: 1) control display size
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        cssWidth = rect.width;
        cssHeight = rect.height;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
    }

    function setupEvents() {
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('click', onClick);
        window.addEventListener('resize', () => {
            resize();
            render();
            // Re-check after layout settles (fullscreen transitions may fire early)
            setTimeout(() => { resize(); render(); }, 100);
        });
    }

    function onMouseDown(e) {
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
        cameraStart = { x: camera.x, y: camera.y };
    }

    function onMouseMove(e) {
        if (isDragging) {
            camera.x = cameraStart.x + (e.clientX - dragStart.x);
            camera.y = cameraStart.y + (e.clientY - dragStart.y);
            render();
        } else {
            const rect = canvas.getBoundingClientRect();
            const mapPos = screenToMap(e.clientX - rect.left, e.clientY - rect.top);
            updateHover(mapPos);
        }
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onWheel(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const oldZoom = camera.zoom;
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        camera.zoom = Math.max(0.3, Math.min(4, camera.zoom * zoomFactor));

        camera.x = mouseX - (mouseX - camera.x) * (camera.zoom / oldZoom);
        camera.y = mouseY - (mouseY - camera.y) * (camera.zoom / oldZoom);
        render();
    }

    function onClick(e) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return;

        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        // Check advisor Hide/Show buttons (screen-space, not map-space)
        if (advisorHideBtnBounds) {
            const b = advisorHideBtnBounds;
            if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) {
                if (typeof Game !== 'undefined' && Game.isAutopilot && Game.isAutopilot()) {
                    // During autopilot, hide = stop autopilot with snarky remark
                    // stopAutopilot sets the snarky quote via setAdvisorQuote;
                    // then trigger hide but use the departure timer so the quote stays readable
                    Game.stopAutopilot();
                    advisorHidden = true;
                    localStorage.setItem('ht_advisorHidden', 'true');
                    // Keep the stop quote that was just set as the departure quote
                    advisorDepartureQuote = advisorActionOverride || advisorQuote;
                    advisorDepartureTimer = 3000;
                    return;
                }
                hideAdvisor();
                return;
            }
        }
        if (advisorShowBtnBounds) {
            const b = advisorShowBtnBounds;
            if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) {
                showAdvisor();
                return;
            }
        }

        const mapPos = screenToMap(cx, cy);

        // Check properties first
        if (typeof GameState !== 'undefined' && GameState.properties) {
            for (const prop of GameState.properties) {
                const pdx = mapPos[0] - prop.x;
                const pdy = mapPos[1] - prop.y;
                if (Math.sqrt(pdx * pdx + pdy * pdy) < 12) {
                    if (typeof UI !== 'undefined') UI.showPropertyPanel(prop);
                    return;
                }
            }
        }

        // Check landmarks
        for (const lm of HelsinkiDistricts.landmarks) {
            const ldx = mapPos[0] - lm.pos[0];
            const ldy = mapPos[1] - lm.pos[1];
            if (Math.sqrt(ldx * ldx + ldy * ldy) < 12) {
                if (typeof UI !== 'undefined') UI.showLandmarkPanel(lm);
                return;
            }
        }

        // Check map clickables (ferries, moose, fountain, etc.)
        for (const mc of MAP_CLICKABLES) {
            const mdx = mapPos[0] - mc.pos[0];
            const mdy = mapPos[1] - mc.pos[1];
            if (Math.sqrt(mdx * mdx + mdy * mdy) < 16) {
                if (typeof UI !== 'undefined') UI.showLandmarkPanel(mc);
                return;
            }
        }

        // Check districts
        for (const district of HelsinkiDistricts.districts) {
            if (pointInPolygon(mapPos, district.polygon)) {
                if (typeof UI !== 'undefined' && UI.isDistrictBuyMode && UI.isDistrictBuyMode()) {
                    if (typeof Game !== 'undefined') Game.cheatBuyDistrict(district.id);
                } else if (typeof UI !== 'undefined') {
                    UI.showDistrictInfo(district);
                }
                return;
            }
        }

        if (typeof UI !== 'undefined') {
            UI.hidePropertyPanel();
            UI.hideLandmarkPanel();
        }
    }

    function screenToMap(sx, sy) {
        return [
            (sx - camera.x) / camera.zoom,
            (sy - camera.y) / camera.zoom,
        ];
    }

    function mapToScreen(mx, my) {
        return [
            mx * camera.zoom + camera.x,
            my * camera.zoom + camera.y,
        ];
    }

    function updateHover(mapPos) {
        let changed = false;

        // Check properties first
        let newHoveredProp = null;
        if (typeof GameState !== 'undefined' && GameState.properties) {
            for (const prop of GameState.properties) {
                const dx = mapPos[0] - prop.x;
                const dy = mapPos[1] - prop.y;
                if (Math.sqrt(dx * dx + dy * dy) < 12) {
                    newHoveredProp = prop;
                    break;
                }
            }
        }
        if (newHoveredProp !== hoveredProperty) {
            hoveredProperty = newHoveredProp;
            changed = true;
        }

        // Check landmarks
        let newHoveredLandmark = null;
        if (!hoveredProperty) {
            for (const lm of HelsinkiDistricts.landmarks) {
                const dx = mapPos[0] - lm.pos[0];
                const dy = mapPos[1] - lm.pos[1];
                if (Math.sqrt(dx * dx + dy * dy) < 10) {
                    newHoveredLandmark = lm;
                    break;
                }
            }
            // Also check map clickables
            if (!newHoveredLandmark) {
                for (const mc of MAP_CLICKABLES) {
                    const dx = mapPos[0] - mc.pos[0];
                    const dy = mapPos[1] - mc.pos[1];
                    if (Math.sqrt(dx * dx + dy * dy) < 14) {
                        newHoveredLandmark = mc;
                        break;
                    }
                }
            }
        }
        if (newHoveredLandmark !== hoveredLandmark) {
            hoveredLandmark = newHoveredLandmark;
            changed = true;
        }

        // Check districts
        let newHoveredDistrict = null;
        if (!hoveredProperty && !hoveredLandmark) {
            for (const district of HelsinkiDistricts.districts) {
                if (pointInPolygon(mapPos, district.polygon)) {
                    newHoveredDistrict = district;
                    break;
                }
            }
        }
        if (newHoveredDistrict !== hoveredDistrict) {
            hoveredDistrict = newHoveredDistrict;
            changed = true;
        }

        // Update cursor
        canvas.style.cursor = (hoveredProperty || hoveredLandmark || hoveredDistrict) ? 'pointer' : 'grab';

        if (changed) render();
    }

    function pointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            const intersect = ((yi > point[1]) !== (yj > point[1]))
                && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Season transition state
    let transitionProgress = 1; // 0 = old season, 1 = new season (fully transitioned)
    let transitionFrom = null;
    let transitionStartTime = 0;
    const TRANSITION_DURATION = 1200; // ms
    let transitionAnimFrame = null;
    let seasonBannerAlpha = 0;
    let seasonBannerText = '';

    // Autopilot action banner
    let autopilotBannerText = '';
    let autopilotBannerTimer = 0;
    const AUTOPILOT_BANNER_DURATION = 3000; // ms

    const SEASON_NAMES = {
        winter: 'WINTER',
        spring: 'SPRING',
        summer: 'SUMMER',
        autumn: 'AUTUMN',
    };

    const SEASON_ICONS = {
        winter: '❄',
        spring: '🌱',
        summer: '☀',
        autumn: '🍂',
    };

    function setSeason(season) {
        const oldSeason = currentSeason;
        currentSeason = season;
        if (oldSeason && oldSeason !== season) {
            // Start transition animation
            transitionFrom = oldSeason;
            transitionProgress = 0;
            transitionStartTime = performance.now();
            seasonBannerAlpha = 1;
            seasonBannerText = SEASON_NAMES[season];
            if (!transitionAnimFrame) {
                transitionAnimFrame = requestAnimationFrame(animateTransition);
            }
            // Re-roll polar bears when winter arrives
            if (season === 'winter') {
                rollPolarBears();
            }
        }
    }

    function animateTransition(now) {
        const elapsed = now - transitionStartTime;
        transitionProgress = Math.min(1, elapsed / TRANSITION_DURATION);
        seasonBannerAlpha = transitionProgress < 0.7 ? 1 : 1 - ((transitionProgress - 0.7) / 0.3);

        render();

        if (transitionProgress < 1) {
            transitionAnimFrame = requestAnimationFrame(animateTransition);
        } else {
            transitionFrom = null;
            transitionAnimFrame = null;
            seasonBannerAlpha = 0;
        }
    }

    function lerpColor(hex1, hex2, t) {
        const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
        const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function getBlendedPalette() {
        const target = seasonPalettes[currentSeason];
        if (!transitionFrom || transitionProgress >= 1) return target;
        const from = seasonPalettes[transitionFrom];
        const t = transitionProgress;
        const blended = {};
        for (const key in target) {
            if (key === 'snow') {
                blended[key] = t > 0.5 ? target[key] : from[key];
            } else {
                blended[key] = lerpColor(from[key], target[key], t);
            }
        }
        return blended;
    }

    // === RENDERING ===

    function render() {
        if (!ctx) return;
        const palette = getBlendedPalette();
        const dpr = window.devicePixelRatio || 1;

        // Scale context to match high-DPI buffer
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear with deep water color
        ctx.fillStyle = palette.waterDark;
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(camera.zoom, camera.zoom);

        drawWater(palette);
        drawLand(palette);
        drawInternalWater(palette);
        drawFerries(palette);
        drawWaterDecorations(palette);
        drawParks(palette);
        drawRoads(palette);
        drawDistrictOverlays(palette);
        drawLandDecorations(palette);
        drawLandmarks(palette);
        drawProperties(palette);
        drawAlienInvasion(palette);
        drawDistrictLabels(palette);
        drawHoverTooltips(palette);

        ctx.restore();

        drawAdvisor(palette);

        // Season transition banner
        if (seasonBannerAlpha > 0) {
            drawSeasonBanner();
        }
        if (autopilotBannerTimer > 0) {
            drawAutopilotBanner();
        }
    }

    function drawSeasonBanner() {
        const alpha = seasonBannerAlpha * 0.85;
        const bw = 220;
        const bh = 36;
        const bx = (cssWidth - bw) / 2;
        const by = 60;

        // Banner background
        ctx.fillStyle = `rgba(10, 10, 26, ${alpha * 0.8})`;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = `rgba(255, 204, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Season text
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 204, 0, ${alpha})`;
        const icon = SEASON_ICONS[currentSeason] || '';
        ctx.fillText(`${icon} ${seasonBannerText} ${icon}`, cssWidth / 2, by + bh / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function setAutopilotBanner(text) {
        autopilotBannerText = text;
        autopilotBannerTimer = AUTOPILOT_BANNER_DURATION;
    }

    function drawAutopilotBanner() {
        if (autopilotBannerTimer <= 0) return;
        // Tick timer (~60fps)
        autopilotBannerTimer -= 16;
        const alpha = autopilotBannerTimer < 500 ? autopilotBannerTimer / 500 : 1;
        if (alpha <= 0) return;

        const text = autopilotBannerText;
        ctx.font = '9px "Press Start 2P", monospace';
        const textWidth = ctx.measureText(text).width;
        const bw = Math.max(240, textWidth + 32);
        const bh = 28;
        const bx = (cssWidth - bw) / 2;
        const by = seasonBannerAlpha > 0 ? 102 : 60; // below season banner if showing

        ctx.fillStyle = `rgba(10, 26, 10, ${alpha * 0.85})`;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = `rgba(100, 255, 100, ${alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(100, 255, 100, ${alpha})`;
        ctx.fillText(text, cssWidth / 2, by + bh / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function drawWater(palette) {
        // Water gradient — lighter near shore, darker further out
        ctx.fillStyle = palette.water;
        ctx.fillRect(0, 0, HelsinkiDistricts.MAP_WIDTH, HelsinkiDistricts.MAP_HEIGHT);

        // Subtle wave pattern
        ctx.strokeStyle = palette.waterLight;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.25;
        for (let y = 0; y < HelsinkiDistricts.MAP_HEIGHT; y += 15) {
            ctx.beginPath();
            for (let x = 0; x < HelsinkiDistricts.MAP_WIDTH; x += 4) {
                const wy = y + Math.sin(x * 0.04 + y * 0.08) * 2.5;
                if (x === 0) ctx.moveTo(x, wy);
                else ctx.lineTo(x, wy);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function drawLand(palette) {
        // Main landmass with subtle shadow/coast edge
        // Draw coast shadow first (slightly offset)
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.coastline);
        ctx.restore();

        // Main land fill
        drawFilledPolygon(HelsinkiDistricts.coastline, palette.land, palette.coastEdge, 1);

        // Lauttasaari island with shadow
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.lauttasaariIsland);
        ctx.restore();
        drawFilledPolygon(HelsinkiDistricts.lauttasaariIsland, palette.land, palette.coastEdge, 1);

        // Jätkäsaari island
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.jatkasaariIsland);
        ctx.restore();
        drawFilledPolygon(HelsinkiDistricts.jatkasaariIsland, palette.land, palette.coastEdge, 1);

        // Kaskisaari island
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.kaskisaariIsland);
        ctx.restore();
        drawFilledPolygon(HelsinkiDistricts.kaskisaariIsland, palette.land, palette.coastEdge, 1);

        // Lehtisaari island
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.lehtisaariIsland);
        ctx.restore();
        drawFilledPolygon(HelsinkiDistricts.lehtisaariIsland, palette.land, palette.coastEdge, 1);

        // Kuusisaari island
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.kuusisaariIsland);
        ctx.restore();
        drawFilledPolygon(HelsinkiDistricts.kuusisaariIsland, palette.land, palette.coastEdge, 1);

        // Kulosaari island
        ctx.fillStyle = palette.coastEdge;
        ctx.save();
        ctx.translate(1.5, 1.5);
        fillPolygon(HelsinkiDistricts.kulosaariIsland);
        ctx.restore();
        drawFilledPolygon(HelsinkiDistricts.kulosaariIsland, palette.land, palette.coastEdge, 1);

        // Small decorative islands
        if (HelsinkiDistricts.islands) {
            for (const island of HelsinkiDistricts.islands) {
                const islandColor = island.forest ? palette.park : palette.landAlt;
                // Tiny shadow
                ctx.fillStyle = palette.coastEdge;
                ctx.save();
                ctx.translate(1, 1);
                fillPolygon(island.polygon);
                ctx.restore();
                drawFilledPolygon(island.polygon, islandColor, palette.coastEdge, 0.5);
            }
        }

        // Lauttasaari southern forest tip
        drawFilledPolygon(HelsinkiDistricts.lauttasaariForest, palette.park, palette.coastEdge, 0.5);
    }

    function drawInternalWater(palette) {
        // Draw internal water bodies ON TOP of land to create bays/harbours
        for (const key in HelsinkiDistricts.waterBodies) {
            const body = HelsinkiDistricts.waterBodies[key];
            if (!body || body.length < 3) continue;

            // Fill with water
            ctx.fillStyle = palette.water;
            fillPolygon(body);

            // Add subtle wave lines inside water bodies
            ctx.strokeStyle = palette.waterLight;
            ctx.lineWidth = 0.3;
            ctx.globalAlpha = 0.2;
            strokePolygon(body);
            ctx.globalAlpha = 1;

            // Coast edge
            ctx.strokeStyle = palette.coastEdge;
            ctx.lineWidth = 0.8;
            strokePolygon(body);
        }
    }

    function drawDistrictOverlays(palette) {
        // Get monopoly colors (player=gold, rivals=their colors)
        const monopolyColors = {
            'player': '#ffcc00',
            'risto': '#ff4444',
            'pamela': '#4444ff',
            'lars': '#44ff44',
            'peter': '#ff8844',
        };

        for (const district of HelsinkiDistricts.districts) {
            const isHovered = district === hoveredDistrict;

            // Check if a player owns all properties in this district (monopoly)
            const propsInDistrict = typeof GameState !== 'undefined' && GameState.properties
                ? GameState.properties.filter(p => p.district === district.id)
                : [];
            const monopolyOwner = propsInDistrict.length > 0 && propsInDistrict.every(p => p.owner)
                ? (propsInDistrict[0].owner === propsInDistrict[0].owner && propsInDistrict.every(p => p.owner === propsInDistrict[0].owner) ? propsInDistrict[0].owner : null)
                : null;

            // District tint — stronger for monopolies
            ctx.globalAlpha = monopolyOwner ? 0.25 : 0.08;
            ctx.fillStyle = monopolyOwner ? (monopolyColors[monopolyOwner] || district.color) : district.color;
            fillPolygon(district.polygon);
            ctx.globalAlpha = 1;

            if (isHovered) {
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = '#ffffff';
                fillPolygon(district.polygon);
                ctx.globalAlpha = 1;
            }

            // District border — stronger for monopolies
            ctx.strokeStyle = isHovered ? '#ffcc00' : (monopolyOwner ? (monopolyColors[monopolyOwner] || 'rgba(255,255,255,0.3)') : 'rgba(255,255,255,0.12)');
            ctx.lineWidth = isHovered ? 2 : (monopolyOwner ? 1.5 : 0.5);
            strokePolygon(district.polygon);
        }
    }

    function drawParks(palette) {
        for (const park of HelsinkiDistricts.parks) {
            drawFilledPolygon(park.polygon, palette.park, 'rgba(0,0,0,0.15)', 0.5);
        }
    }

    function drawRoads(palette) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw roads — subtle, thin lines
        for (const road of HelsinkiDistricts.roads) {
            const isMajor = road.name === 'Mannerheimintie' || road.name === 'Hämeentie';
            const isBridge = road.name.includes('silta') || road.name.includes('bridge');
            ctx.strokeStyle = isBridge ? palette.roadMajor : (isMajor ? palette.roadMajor : palette.road);
            ctx.lineWidth = isBridge ? 2 : (isMajor ? 1.5 : 0.8);
            ctx.globalAlpha = isBridge ? 0.5 : (isMajor ? 0.3 : 0.2);
            ctx.beginPath();
            for (let i = 0; i < road.points.length; i++) {
                if (i === 0) ctx.moveTo(road.points[i][0], road.points[i][1]);
                else ctx.lineTo(road.points[i][0], road.points[i][1]);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
    }

    function drawLandmarks(palette) {
        // Check if landmarks should be faded
        const shouldFade = typeof UI !== 'undefined' && UI.shouldFadeLandmarks();
        const originalAlpha = ctx.globalAlpha;
        if (shouldFade) {
            ctx.globalAlpha = 0.2; // 20% opacity when faded
        }

        for (const lm of HelsinkiDistricts.landmarks) {
            const [x, y] = lm.pos;
            const isHovered = lm === hoveredLandmark;

            // Hover glow
            if (isHovered) {
                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(x, y - 2, 10, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Custom sprites for specific landmarks
            if (lm.name === 'Linnanmäki') {
                drawScaledSprite(x, y, 1.5, () => drawRollercoasterSprite(0, 0, palette));
            } else if (lm.name.includes('Beach')) {
                drawBeachSprite(x, y, palette);
            } else if (lm.name === 'Allas Sea Pool') {
                drawSeaPoolSprite(x, y, palette);
            } else if (lm.name === 'Olympic Stadium') {
                drawScaledSprite(x, y, 1.25, () => drawStadiumSprite(0, 0, palette));
            } else if (lm.name === 'Sibelius Monument') {
                drawSibeliusSprite(x, y, palette);
            } else if (lm.name.includes('DiscGolf')) {
                drawScaledSprite(x, y, 1.25, () => drawDiscGolfSprite(0, 0, palette));
            } else if (lm.name.includes('Observatory')) {
                drawObservatorySprite(x, y, palette);
            } else if (lm.name.includes('Open-Air Museum')) {
                drawOpenAirMuseumSprite(x, y, palette);
            } else if (lm.name === 'Kiasma') {
                drawKiasmaSprite(x, y, palette);
            } else if (lm.name === 'Helsinki Wheel') {
                drawHelsinkiWheel(x, y, palette);
            } else if (lm.name === 'Finlandia Hall') {
                drawFinlandiaHallSprite(x, y, palette);
            } else if (lm.name === 'Oodi Library') {
                drawOodiLibrarySprite(x, y, palette);
            } else {
                // Default shapes
                const isChurch = lm.name.includes('Cathedral') || lm.name.includes('Church');
                const isMonument = lm.name.includes('Monument');

                if (isChurch) {
                    ctx.fillStyle = '#ddc080';
                    ctx.fillRect(x - 4, y - 4, 8, 7);
                    ctx.fillStyle = '#ccb060';
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - 4);
                    ctx.lineTo(x, y - 10);
                    ctx.lineTo(x + 4, y - 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ffcc00';
                    ctx.fillRect(x - 1, y - 11, 2, 2);
                } else if (isMonument) {
                    ctx.fillStyle = '#bba870';
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#998850';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else {
                    ctx.fillStyle = '#ddc080';
                    ctx.fillRect(x - 4, y - 5, 8, 7);
                    ctx.fillStyle = '#ccb060';
                    ctx.fillRect(x - 5, y - 6, 10, 2);
                    ctx.fillStyle = '#ffcc00';
                    ctx.fillRect(x - 1, y - 8, 2, 2);
                }

                // Snow on default landmarks in winter
                if (palette.snow) {
                    ctx.fillStyle = '#e8e8f0';
                    if (isChurch) {
                        ctx.beginPath();
                        ctx.moveTo(x - 3, y - 5);
                        ctx.lineTo(x, y - 10);
                        ctx.lineTo(x + 3, y - 5);
                        ctx.closePath();
                        ctx.fill();
                    } else if (!isMonument) {
                        ctx.fillRect(x - 5, y - 7, 10, 2);
                    }
                }
            }
        }

        // Restore original alpha
        if (shouldFade) {
            ctx.globalAlpha = originalAlpha;
        }
    }

    // === CUSTOM LANDMARK SPRITES ===

    function drawScaledSprite(x, y, scale, drawFn) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        drawFn();
        ctx.restore();
    }

    function drawRollercoasterSprite(x, y, palette) {
        // Roller coaster track — arched rails
        ctx.strokeStyle = '#aa4444';
        ctx.lineWidth = 1.5;
        // First hill
        ctx.beginPath();
        ctx.moveTo(x - 12, y + 2);
        ctx.quadraticCurveTo(x - 6, y - 14, x, y - 4);
        ctx.stroke();
        // Second hill (smaller)
        ctx.beginPath();
        ctx.moveTo(x, y - 4);
        ctx.quadraticCurveTo(x + 5, y - 10, x + 10, y - 2);
        ctx.stroke();
        // Support beams
        ctx.strokeStyle = '#884444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 2); ctx.lineTo(x - 6, y - 10);
        ctx.moveTo(x, y + 2); ctx.lineTo(x, y - 4);
        ctx.moveTo(x + 5, y + 2); ctx.lineTo(x + 5, y - 7);
        ctx.stroke();

        // Animated cart — moves along the track in summer, static in winter
        const isSummer = currentSeason === 'summer' || currentSeason === 'spring';
        if (isSummer) {
            // t oscillates 0→1→0 over ~3 seconds
            const t = (Math.sin(Date.now() / 1500) + 1) / 2;
            // Cart travels along both hills: interpolate position
            // First hill: t=0..0.5, Second hill: t=0.5..1
            let cartX, cartY;
            if (t < 0.5) {
                // First hill (quadratic bezier from (-12,+2) via (-6,-14) to (0,-4))
                const u = t * 2;
                cartX = x + (1 - u) * (1 - u) * (-12) + 2 * (1 - u) * u * (-6) + u * u * 0;
                cartY = y + (1 - u) * (1 - u) * 2 + 2 * (1 - u) * u * (-14) + u * u * (-4);
            } else {
                // Second hill (quadratic bezier from (0,-4) via (5,-10) to (10,-2))
                const u = (t - 0.5) * 2;
                cartX = x + (1 - u) * (1 - u) * 0 + 2 * (1 - u) * u * 5 + u * u * 10;
                cartY = y + (1 - u) * (1 - u) * (-4) + 2 * (1 - u) * u * (-10) + u * u * (-2);
            }
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(cartX - 2, cartY - 3, 4, 3);
            ctx.fillStyle = '#333';
            ctx.fillRect(cartX - 2, cartY, 1, 1);
            ctx.fillRect(cartX + 1, cartY, 1, 1);
        } else {
            // Static cart parked at base
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(x - 8, y - 1, 4, 3);
            ctx.fillStyle = '#333';
            ctx.fillRect(x - 8, y + 2, 1, 1);
            ctx.fillRect(x - 5, y + 2, 1, 1);
        }

        // Ground platform
        ctx.fillStyle = '#665544';
        ctx.fillRect(x - 13, y + 2, 24, 2);
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 13, y + 1, 24, 1);
        }
    }

    function drawBeachSprite(x, y, palette) {
        // Sandy beach area
        ctx.fillStyle = palette.snow ? '#d8d0c0' : '#e8d8a0';
        ctx.beginPath();
        ctx.ellipse(x, y + 1, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Beach umbrella pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 0.5, y - 8, 1, 9);
        // Umbrella top
        ctx.fillStyle = '#ff6644';
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 7);
        ctx.quadraticCurveTo(x, y - 12, x + 6, y - 7);
        ctx.lineTo(x, y - 8);
        ctx.closePath();
        ctx.fill();
        // Umbrella stripes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 7.5);
        ctx.quadraticCurveTo(x - 1.5, y - 10, x, y - 7.8);
        ctx.lineTo(x - 1, y - 8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 7.8);
        ctx.quadraticCurveTo(x + 3.5, y - 10, x + 5, y - 7.3);
        ctx.lineTo(x + 3, y - 7.8);
        ctx.closePath();
        ctx.fill();
        // Waves
        if (!palette.snow) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - 9, y + 4);
            ctx.quadraticCurveTo(x - 6, y + 3, x - 3, y + 4);
            ctx.quadraticCurveTo(x, y + 5, x + 3, y + 4);
            ctx.stroke();
        }
    }

    function drawSeaPoolSprite(x, y, palette) {
        // Floating pool — rectangle on water
        ctx.fillStyle = palette.snow ? '#4488aa' : '#44aacc';
        ctx.fillRect(x - 6, y - 3, 12, 6);
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 6, y - 3, 12, 6);
        // Pool water
        ctx.fillStyle = palette.snow ? '#2266aa' : '#2299dd';
        ctx.fillRect(x - 4, y - 1, 8, 3);
        // Small sauna building
        ctx.fillStyle = '#aa8855';
        ctx.fillRect(x + 4, y - 5, 4, 4);
        // Smoke from sauna
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(x + 6, y - 7, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 7, y - 9, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawStadiumSprite(x, y, palette) {
        // Olympic stadium — oval with tower
        ctx.fillStyle = '#ccbbaa';
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#998877';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Inner field
        ctx.fillStyle = palette.snow ? '#bbccbb' : '#66aa55';
        ctx.beginPath();
        ctx.ellipse(x, y, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Stadium tower
        ctx.fillStyle = '#ccbbaa';
        ctx.fillRect(x + 5, y - 12, 3, 14);
        // Tower top
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(x + 4, y - 13, 5, 2);
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x + 4, y - 14, 5, 1);
        }
    }

    function drawSibeliusSprite(x, y, palette) {
        // Pipe organ-style vertical pipes
        const pipes = [-5, -3, -1, 1, 3, 5];
        const heights = [8, 11, 13, 12, 10, 7];
        for (let i = 0; i < pipes.length; i++) {
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(x + pipes[i], y - heights[i], 1.5, heights[i]);
            // Pipe tops
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(x + pipes[i] - 0.25, y - heights[i] - 1, 2, 1.5);
        }
        // Base
        ctx.fillStyle = '#888888';
        ctx.fillRect(x - 6, y, 13, 2);
        // Snow on pipe tops
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            for (let i = 0; i < pipes.length; i++) {
                ctx.fillRect(x + pipes[i] - 0.25, y - heights[i] - 1.5, 2, 1);
            }
        }
    }

    function drawDiscGolfSprite(x, y, palette) {
        // Disc golf basket (target)
        ctx.fillStyle = '#888888';
        ctx.fillRect(x + 8, y - 8, 1, 10); // pole
        // Basket chains (cone shape)
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(x + 8.5, y - 8);
            ctx.lineTo(x + 5.5 + i * 1.5, y - 3);
            ctx.stroke();
        }
        // Basket rim
        ctx.fillStyle = '#777777';
        ctx.fillRect(x + 5, y - 3, 8, 1);
        // Basket bottom
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 6, y - 2, 6, 1.5);
        // Top cap
        ctx.fillStyle = '#999999';
        ctx.beginPath();
        ctx.arc(x + 8.5, y - 8.5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Person throwing frisbee
        // Legs
        ctx.fillStyle = '#334466';
        ctx.fillRect(x - 4, y - 1, 1.5, 4);
        ctx.fillRect(x - 1.5, y - 1, 1.5, 4);
        // Body
        ctx.fillStyle = '#cc4444';
        ctx.fillRect(x - 4, y - 7, 5, 6);
        // Head
        ctx.fillStyle = '#ddbb88';
        ctx.beginPath();
        ctx.arc(x - 1.5, y - 9, 2, 0, Math.PI * 2);
        ctx.fill();
        // Throwing arm (extended toward basket)
        ctx.strokeStyle = '#ddbb88';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 4, y - 6);
        ctx.stroke();
        // Flying frisbee
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.ellipse(x + 5, y - 6.5, 2, 0.6, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x + 5, y - 3.5, 8, 0.7);
        }
    }

    function drawObservatorySprite(x, y, palette) {
        // Stone base / walls
        ctx.fillStyle = '#aa9970';
        ctx.fillRect(x - 5, y - 2, 10, 5);
        // Round dome roof
        ctx.fillStyle = palette.snow ? '#aaaaaa' : '#7a7a6a';
        ctx.beginPath();
        ctx.arc(x, y - 2, 5.5, Math.PI, 0);
        ctx.fill();
        // Dome opening slit (dark gap where telescope pokes out)
        ctx.fillStyle = '#222233';
        ctx.beginPath();
        ctx.moveTo(x + 0.5, y - 7.5);
        ctx.lineTo(x + 3, y - 5);
        ctx.lineTo(x + 2, y - 4.5);
        ctx.lineTo(x - 0.5, y - 7);
        ctx.closePath();
        ctx.fill();
        // Telescope tube — angled up-right out of the dome
        ctx.fillStyle = '#555566';
        ctx.save();
        ctx.translate(x + 1, y - 6);
        ctx.rotate(-0.6); // angled to upper-right
        ctx.fillRect(0, -0.8, 8, 1.6);
        // Lens cap
        ctx.fillStyle = '#4444aa';
        ctx.fillRect(7.5, -1.2, 1, 2.4);
        ctx.restore();
        // Door
        ctx.fillStyle = '#665533';
        ctx.fillRect(x - 1.5, y, 3, 3);
        // Snow on dome
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.arc(x, y - 2.5, 5.7, Math.PI + 0.3, -0.3);
            ctx.fill();
        }
    }

    function drawOpenAirMuseumSprite(x, y, palette) {
        // Traditional red Finnish wooden cottage
        // Walls
        ctx.fillStyle = '#993322';
        ctx.fillRect(x - 6, y - 4, 12, 7);
        // Log texture lines
        ctx.strokeStyle = '#772211';
        ctx.lineWidth = 0.4;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 2.5 + i * 2);
            ctx.lineTo(x + 6, y - 2.5 + i * 2);
            ctx.stroke();
        }
        // Roof (steep wooden)
        ctx.fillStyle = '#554433';
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 4);
        ctx.lineTo(x, y - 10);
        ctx.lineTo(x + 7, y - 4);
        ctx.closePath();
        ctx.fill();
        // Window (white frames, typical Finnish style)
        ctx.fillStyle = '#ddeeff';
        ctx.fillRect(x - 4, y - 2, 3, 3);
        ctx.fillRect(x + 1, y - 2, 3, 3);
        // Window cross frames
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4, y - 0.8, 3, 0.4);
        ctx.fillRect(x - 2.8, y - 2, 0.4, 3);
        ctx.fillRect(x + 1, y - 0.8, 3, 0.4);
        ctx.fillRect(x + 2.2, y - 2, 0.4, 3);
        // Door
        ctx.fillStyle = '#664422';
        ctx.fillRect(x - 1, y - 1, 2, 4);
        // Chimney
        ctx.fillStyle = '#776655';
        ctx.fillRect(x + 3, y - 9, 2, 4);
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.moveTo(x - 7, y - 4.5);
            ctx.lineTo(x, y - 10.5);
            ctx.lineTo(x + 7, y - 4.5);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(x + 3, y - 9.5, 2, 0.7);
        }
    }

    // === ISLAND DECORATION SPRITES ===

    function drawSuomenlinnaDeco(cx, cy, palette) {
        // Castle walls with crenellations
        const wallColor = '#aa9977';
        const darkWall = '#887755';
        const snowColor = '#e8e8f0';

        // Left wall section
        ctx.fillStyle = wallColor;
        ctx.fillRect(cx - 18, cy - 6, 10, 8);
        // Crenellations (battlements)
        ctx.fillStyle = darkWall;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(cx - 18 + i * 3, cy - 8, 2, 2);
        }
        // Gate arch
        ctx.fillStyle = '#443322';
        ctx.fillRect(cx - 15, cy - 2, 4, 4);
        ctx.fillStyle = darkWall;
        ctx.beginPath();
        ctx.arc(cx - 13, cy - 2, 2, Math.PI, 0);
        ctx.fill();

        // Right wall section
        ctx.fillStyle = wallColor;
        ctx.fillRect(cx + 6, cy - 4, 12, 6);
        // Crenellations
        ctx.fillStyle = darkWall;
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(cx + 6 + i * 3, cy - 6, 2, 2);
        }

        // Tower
        ctx.fillStyle = wallColor;
        ctx.fillRect(cx - 2, cy - 12, 6, 14);
        ctx.fillStyle = darkWall;
        // Tower top crenellations
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(cx - 2 + i * 2.5, cy - 14, 2, 2);
        }
        // Tower window
        ctx.fillStyle = '#443322';
        ctx.fillRect(cx, cy - 9, 2, 2);

        // Cannon (left)
        ctx.fillStyle = '#444444';
        ctx.fillRect(cx - 22, cy - 3, 5, 2);
        // Cannon wheels
        ctx.fillStyle = '#553322';
        ctx.beginPath();
        ctx.arc(cx - 20, cy + 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 18, cy + 1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Cannon (right)
        ctx.fillStyle = '#444444';
        ctx.fillRect(cx + 16, cy - 1, 5, 2);
        ctx.fillStyle = '#553322';
        ctx.beginPath();
        ctx.arc(cx + 18, cy + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 20, cy + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Finnish flag on tower
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 1, cy - 18, 5, 3);
        ctx.fillStyle = '#003580';
        ctx.fillRect(cx + 1, cy - 17, 5, 1); // horizontal cross
        ctx.fillRect(cx + 3, cy - 18, 1, 3); // vertical cross
        // Flag pole
        ctx.fillStyle = '#888888';
        ctx.fillRect(cx + 0.5, cy - 19, 1, 7);

        // Snow on walls
        if (palette.snow) {
            ctx.fillStyle = snowColor;
            ctx.fillRect(cx - 18, cy - 9, 10, 1);
            ctx.fillRect(cx + 6, cy - 7, 12, 1);
            ctx.fillRect(cx - 2, cy - 15, 6, 1);
        }
    }

    function drawBlueberryDeco(cx, cy) {
        // Cute blueberry with a small leaf
        // Berry body
        ctx.fillStyle = '#4444bb';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        // Berry highlight
        ctx.fillStyle = '#6666dd';
        ctx.beginPath();
        ctx.arc(cx - 1, cy - 1.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Berry crown (calyx — the star-shaped bit on top)
        ctx.fillStyle = '#334488';
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy - 3.5);
        ctx.lineTo(cx, cy - 5);
        ctx.lineTo(cx + 2, cy - 3.5);
        ctx.fill();
        // Leaf
        ctx.fillStyle = '#44aa44';
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy - 5, 3, 1.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Leaf vein
        ctx.strokeStyle = '#338833';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + 1, cy - 5);
        ctx.lineTo(cx + 5, cy - 5);
        ctx.stroke();
        // Stem
        ctx.strokeStyle = '#338833';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 1, cy - 5.5);
        ctx.stroke();
    }

    // === FERRY DECORATION SPRITES ===

    // Viking Line ferry — large red hull, white superstructure
    function drawVikingLineFerry(x, y, palette) {
        const p = 1;
        // Hull (red)
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.moveTo(x - 16 * p, y + 2 * p);
        ctx.lineTo(x - 14 * p, y + 5 * p);
        ctx.lineTo(x + 14 * p, y + 5 * p);
        ctx.lineTo(x + 18 * p, y + 2 * p);
        ctx.lineTo(x + 18 * p, y);
        ctx.lineTo(x - 16 * p, y);
        ctx.closePath();
        ctx.fill();
        // Hull waterline (dark red)
        ctx.fillStyle = '#881111';
        ctx.fillRect(x - 15 * p, y + 3 * p, 31 * p, 2 * p);
        // Main deck (white)
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x - 14 * p, y - 4 * p, 28 * p, 4 * p);
        // Upper deck (white)
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(x - 10 * p, y - 7 * p, 20 * p, 3 * p);
        // Bridge (white, narrow)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4 * p, y - 10 * p, 8 * p, 3 * p);
        // Bridge windows
        ctx.fillStyle = '#4488cc';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 5 * p + i * 2.5 * p, y - 9 * p, 1.5 * p, 1.5 * p);
        }
        // Deck windows
        ctx.fillStyle = '#4488cc';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(x - 12 * p + i * 3.2 * p, y - 3 * p, 2 * p, 1.5 * p);
        }
        // Funnel (red with orange diamond)
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(x - 4 * p, y - 13 * p, 5 * p, 5 * p);
        ctx.fillStyle = '#222222';
        ctx.fillRect(x - 4 * p, y - 13 * p, 5 * p, 1 * p); // black top
        // Orange diamond on funnel
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(x - 1.5 * p, y - 12 * p);
        ctx.lineTo(x, y - 10 * p);
        ctx.lineTo(x + 1.5 * p, y - 12 * p);
        ctx.lineTo(x, y - 14 * p + 3 * p);
        ctx.closePath();
        ctx.fill();
        // Snow on decks
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 14 * p, y - 4.5 * p, 28 * p, 0.5 * p);
            ctx.fillRect(x - 10 * p, y - 7.5 * p, 20 * p, 0.5 * p);
        }
        // Wake lines (subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 17 * p, y + 6 * p);
        ctx.lineTo(x - 22 * p, y + 8 * p);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 17 * p, y + 4 * p);
        ctx.lineTo(x - 24 * p, y + 7 * p);
        ctx.stroke();
    }

    // Silja Line ferry — white hull, blue stripes
    function drawSiljaLineFerry(x, y, palette) {
        const p = 1;
        // Hull (white)
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.moveTo(x - 16 * p, y + 2 * p);
        ctx.lineTo(x - 14 * p, y + 5 * p);
        ctx.lineTo(x + 14 * p, y + 5 * p);
        ctx.lineTo(x + 18 * p, y + 2 * p);
        ctx.lineTo(x + 18 * p, y);
        ctx.lineTo(x - 16 * p, y);
        ctx.closePath();
        ctx.fill();
        // Blue stripe along hull
        ctx.fillStyle = '#2255aa';
        ctx.fillRect(x - 15 * p, y + 1 * p, 31 * p, 1.5 * p);
        // Hull bottom (dark blue)
        ctx.fillStyle = '#1a3366';
        ctx.fillRect(x - 14 * p, y + 3 * p, 29 * p, 2 * p);
        // Main deck (white)
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x - 13 * p, y - 4 * p, 26 * p, 4 * p);
        // Upper deck
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(x - 9 * p, y - 7 * p, 18 * p, 3 * p);
        // Bridge
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5 * p, y - 10 * p, 7 * p, 3 * p);
        // Bridge windows
        ctx.fillStyle = '#4488cc';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 6 * p + i * 2 * p, y - 9 * p, 1.5 * p, 1.5 * p);
        }
        // Deck windows
        ctx.fillStyle = '#6699cc';
        for (let i = 0; i < 7; i++) {
            ctx.fillRect(x - 11 * p + i * 3.2 * p, y - 3 * p, 2 * p, 1.5 * p);
        }
        // Blue stripe on upper deck
        ctx.fillStyle = '#2255aa';
        ctx.fillRect(x - 9 * p, y - 5 * p, 18 * p, 1 * p);
        // Funnel (white with blue 'R')
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 3 * p, y - 13 * p, 5 * p, 5 * p);
        ctx.fillStyle = '#222222';
        ctx.fillRect(x - 3 * p, y - 13 * p, 5 * p, 0.8 * p);
        // Blue 'R' on funnel (simplified as blue bar)
        ctx.fillStyle = '#2255aa';
        ctx.fillRect(x - 1.5 * p, y - 12 * p, 2 * p, 3 * p);
        // Snow on decks
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 13 * p, y - 4.5 * p, 26 * p, 0.5 * p);
            ctx.fillRect(x - 9 * p, y - 7.5 * p, 18 * p, 0.5 * p);
        }
        // Wake lines
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 17 * p, y + 6 * p);
        ctx.lineTo(x - 22 * p, y + 8 * p);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 17 * p, y + 4 * p);
        ctx.lineTo(x - 24 * p, y + 7 * p);
        ctx.stroke();
    }

    // Suomenlinna ferry — small commuter vessel
    function drawSuomenlinnaFerry(x, y, palette) {
        const p = 1;
        // Hull (dark)
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(x - 8 * p, y + 1 * p);
        ctx.lineTo(x - 7 * p, y + 3 * p);
        ctx.lineTo(x + 7 * p, y + 3 * p);
        ctx.lineTo(x + 9 * p, y + 1 * p);
        ctx.lineTo(x + 9 * p, y);
        ctx.lineTo(x - 8 * p, y);
        ctx.closePath();
        ctx.fill();
        // Hull waterline
        ctx.fillStyle = '#222222';
        ctx.fillRect(x - 7 * p, y + 2 * p, 14 * p, 1 * p);
        // Yellow stripe (Sunlines)
        ctx.fillStyle = '#ddaa00';
        ctx.fillRect(x - 7 * p, y - 0.5 * p, 14 * p, 1 * p);
        // Cabin (white)
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x - 5 * p, y - 4 * p, 10 * p, 3.5 * p);
        // Cabin windows
        ctx.fillStyle = '#4488cc';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x - 4 * p + i * 2.5 * p, y - 3 * p, 1.5 * p, 1.5 * p);
        }
        // Wheelhouse
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(x + 1 * p, y - 6 * p, 4 * p, 2 * p);
        // Wheelhouse window
        ctx.fillStyle = '#4488cc';
        ctx.fillRect(x + 1.5 * p, y - 5.5 * p, 3 * p, 1 * p);
        // Finnish flag at stern
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 6 * p, y - 7 * p, 3 * p, 2 * p);
        ctx.fillStyle = '#003580';
        ctx.fillRect(x - 6 * p, y - 6.2 * p, 3 * p, 0.6 * p);
        ctx.fillRect(x - 5 * p, y - 7 * p, 0.6 * p, 2 * p);
        // Flag pole
        ctx.fillStyle = '#888888';
        ctx.fillRect(x - 6.5 * p, y - 8 * p, 0.5 * p, 4 * p);
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 5 * p, y - 4.5 * p, 10 * p, 0.5 * p);
        }
        // Wake
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(x - 9 * p, y + 4 * p);
        ctx.lineTo(x - 12 * p, y + 5 * p);
        ctx.stroke();
    }

    // Ferry positions (in water, off coastlines)
    const ferryPositions = {
        vikingLine: HelsinkiDistricts.geoToMap([[60.163, 24.965]])[0],   // SW Katajanokka coast
        siljaLine: HelsinkiDistricts.geoToMap([[60.160, 24.958]])[0],    // NE Kaivopuisto
        suomenlinnaFerry: HelsinkiDistricts.geoToMap([[60.153, 24.975]])[0], // Between mainland and Suomenlinna
    };

    function drawFerries(palette) {
        drawVikingLineFerry(ferryPositions.vikingLine[0], ferryPositions.vikingLine[1], palette);
        drawSiljaLineFerry(ferryPositions.siljaLine[0], ferryPositions.siljaLine[1], palette);
        drawSuomenlinnaFerry(ferryPositions.suomenlinnaFerry[0], ferryPositions.suomenlinnaFerry[1], palette);
    }

    // === WATER DECORATION SPRITES ===

    function drawSailboat(x, y, palette, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle || 0);
        // Hull
        ctx.fillStyle = '#553322';
        ctx.beginPath();
        ctx.moveTo(-5, 1);
        ctx.lineTo(-4, 3);
        ctx.lineTo(4, 3);
        ctx.lineTo(6, 1);
        ctx.lineTo(6, 0);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        // Mast
        ctx.fillStyle = '#665544';
        ctx.fillRect(-0.5, -10, 1, 10);
        // Sail (white triangle)
        ctx.fillStyle = palette.snow ? '#e8e8f0' : '#f5f5f0';
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(0, -1);
        ctx.lineTo(5, -2);
        ctx.closePath();
        ctx.fill();
        // Small rear sail
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(0, -1);
        ctx.lineTo(-3, -2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawRowboat(x, y) {
        // Small rowing boat / kayak
        ctx.fillStyle = '#664422';
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 2, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Seat
        ctx.fillStyle = '#554433';
        ctx.fillRect(x - 1.5, y - 0.5, 3, 1);
        // Oars
        ctx.strokeStyle = '#887766';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 1, y);
        ctx.lineTo(x - 5, y - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 1, y);
        ctx.lineTo(x + 5, y - 3);
        ctx.stroke();
    }

    function drawBuoy(x, y) {
        // Small navigation buoy
        ctx.fillStyle = '#dd3333';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(x - 0.5, y - 0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        // Post
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(x - 0.4, y - 4, 0.8, 2);
        // Top marker
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(x - 1.5, y - 4);
        ctx.lineTo(x, y - 6);
        ctx.lineTo(x + 1.5, y - 4);
        ctx.closePath();
        ctx.fill();
    }

    function drawSeagull(x, y) {
        // Simple V-shaped seagull
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - 3, y + 1);
        ctx.quadraticCurveTo(x - 1, y - 2, x, y);
        ctx.quadraticCurveTo(x + 1, y - 2, x + 3, y + 1);
        ctx.stroke();
    }

    function drawStar(cx, cy, outerR, innerR, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI / points) - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }

    function drawWaveCluster(x, y) {
        // Small wave marks — two or three curved lines
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.quadraticCurveTo(x - 2, y - 1.5, x, y);
        ctx.quadraticCurveTo(x + 2, y + 1.5, x + 4, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 3, y + 2.5);
        ctx.quadraticCurveTo(x - 1, y + 1, x + 1, y + 2.5);
        ctx.quadraticCurveTo(x + 3, y + 4, x + 5, y + 2.5);
        ctx.stroke();
    }

    // Water decoration positions
    const wavePositions = [
        // Eastern waters
        HelsinkiDistricts.geoToMap([[60.165, 24.995]])[0],
        HelsinkiDistricts.geoToMap([[60.155, 24.975]])[0],
        HelsinkiDistricts.geoToMap([[60.172, 24.985]])[0],
        HelsinkiDistricts.geoToMap([[60.145, 24.960]])[0],
        HelsinkiDistricts.geoToMap([[60.160, 24.960]])[0],
        HelsinkiDistricts.geoToMap([[60.178, 24.995]])[0],
        HelsinkiDistricts.geoToMap([[60.143, 24.985]])[0],
        HelsinkiDistricts.geoToMap([[60.150, 24.993]])[0],
        HelsinkiDistricts.geoToMap([[60.168, 24.998]])[0],
        HelsinkiDistricts.geoToMap([[60.140, 24.970]])[0],
        // Southern waters
        HelsinkiDistricts.geoToMap([[60.142, 24.940]])[0],
        HelsinkiDistricts.geoToMap([[60.139, 24.955]])[0],
        HelsinkiDistricts.geoToMap([[60.144, 24.920]])[0],
        HelsinkiDistricts.geoToMap([[60.141, 24.930]])[0],
        // Western waters (Lauttasaari strait and beyond)
        HelsinkiDistricts.geoToMap([[60.155, 24.870]])[0],
        HelsinkiDistricts.geoToMap([[60.170, 24.865]])[0],
        HelsinkiDistricts.geoToMap([[60.162, 24.862]])[0],
        HelsinkiDistricts.geoToMap([[60.148, 24.878]])[0],
        HelsinkiDistricts.geoToMap([[60.145, 24.868]])[0],
        HelsinkiDistricts.geoToMap([[60.175, 24.868]])[0],
        HelsinkiDistricts.geoToMap([[60.180, 24.862]])[0],
        HelsinkiDistricts.geoToMap([[60.165, 24.858]])[0],
        HelsinkiDistricts.geoToMap([[60.155, 24.860]])[0],
        HelsinkiDistricts.geoToMap([[60.142, 24.885]])[0],
        // Lauttasaari strait
        HelsinkiDistricts.geoToMap([[60.163, 24.898]])[0],
        HelsinkiDistricts.geoToMap([[60.158, 24.900]])[0],
        // Misc scattered
        HelsinkiDistricts.geoToMap([[60.190, 24.998]])[0],
        HelsinkiDistricts.geoToMap([[60.148, 24.935]])[0],
        HelsinkiDistricts.geoToMap([[60.195, 24.870]])[0],
        HelsinkiDistricts.geoToMap([[60.138, 24.950]])[0],
    ];

    const waterDecoPositions = {
        sailboats: [
            // Eastern waters
            { pos: HelsinkiDistricts.geoToMap([[60.170, 24.995]])[0], angle: 0.2 },
            { pos: HelsinkiDistricts.geoToMap([[60.160, 24.990]])[0], angle: -0.15 },
            { pos: HelsinkiDistricts.geoToMap([[60.175, 24.988]])[0], angle: 0.35 },
            { pos: HelsinkiDistricts.geoToMap([[60.155, 24.968]])[0], angle: -0.1 },
            // Western waters
            { pos: HelsinkiDistricts.geoToMap([[60.168, 24.862]])[0], angle: 0.25 },
            { pos: HelsinkiDistricts.geoToMap([[60.178, 24.866]])[0], angle: -0.2 },
            // Northwestern corner
            { pos: HelsinkiDistricts.geoToMap([[60.196, 24.868]])[0], angle: 0.15 },
            { pos: HelsinkiDistricts.geoToMap([[60.193, 24.863]])[0], angle: -0.25 },
            { pos: HelsinkiDistricts.geoToMap([[60.190, 24.870]])[0], angle: 0.3 },
            // Trio south of Lauttasaari
            { pos: HelsinkiDistricts.geoToMap([[60.148, 24.878]])[0], angle: 0.1 },
            { pos: HelsinkiDistricts.geoToMap([[60.147, 24.882]])[0], angle: 0.25 },
            { pos: HelsinkiDistricts.geoToMap([[60.149, 24.875]])[0], angle: -0.05 },
        ],
        rowboat: HelsinkiDistricts.geoToMap([[60.184, 24.908]])[0], // near Töölö coast / Seurasaari
        buoys: [
            HelsinkiDistricts.geoToMap([[60.166, 24.957]])[0], // south harbour entrance
            HelsinkiDistricts.geoToMap([[60.170, 24.980]])[0], // east of Katajanokka
            HelsinkiDistricts.geoToMap([[60.148, 24.935]])[0], // off Eira/Ullanlinna coast
        ],
        seagulls: [
            HelsinkiDistricts.geoToMap([[60.168, 24.992]])[0],
            HelsinkiDistricts.geoToMap([[60.158, 24.985]])[0],
            HelsinkiDistricts.geoToMap([[60.150, 24.945]])[0],
            HelsinkiDistricts.geoToMap([[60.173, 24.996]])[0],
            HelsinkiDistricts.geoToMap([[60.145, 24.970]])[0],
            HelsinkiDistricts.geoToMap([[60.162, 24.870]])[0], // west of Lauttasaari
        ],
    };

    // Töölönlahti water features
    const toolonlahtiPositions = {
        fountain: HelsinkiDistricts.geoToMap([[60.180, 24.937]])[0],      // center of Töölönlahti
        paddleBoat: HelsinkiDistricts.geoToMap([[60.177, 24.939]])[0],    // south part of Töölönlahti
    };

    function drawWaterDecorations(palette) {
        // Wave clusters
        for (const w of wavePositions) {
            drawWaveCluster(w[0], w[1]);
        }
        // Sailboats
        for (const sb of waterDecoPositions.sailboats) {
            drawSailboat(sb.pos[0], sb.pos[1], palette, sb.angle);
        }
        // Rowboat
        drawRowboat(waterDecoPositions.rowboat[0], waterDecoPositions.rowboat[1]);
        // Buoys
        for (const b of waterDecoPositions.buoys) {
            drawBuoy(b[0], b[1]);
        }
        // Seagulls (animated drift/circle)
        for (const sg of seagullStates) {
            const sx = sg.currentX !== undefined ? sg.currentX : sg.baseX;
            const sy = sg.currentY !== undefined ? sg.currentY : sg.baseY;
            drawSeagull(sx, sy);
        }
        // Töölönlahti fountain
        drawFountain(toolonlahtiPositions.fountain[0], toolonlahtiPositions.fountain[1], palette);
        // Paddle boat on Töölönlahti (not in winter — water frozen!)
        if (!palette.snow) {
            drawPaddleBoat(toolonlahtiPositions.paddleBoat[0], toolonlahtiPositions.paddleBoat[1]);
        }
    }

    // === LAND DECORATION SPRITES ===

    function drawTram(x, y, palette) {
        // Helsinki green tram (side view, heading right)
        // Wheels
        ctx.fillStyle = '#333333';
        ctx.beginPath(); ctx.arc(x - 5, y + 3, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 5, y + 3, 1.2, 0, Math.PI * 2); ctx.fill();
        // Body (Helsinki green)
        ctx.fillStyle = '#336633';
        ctx.fillRect(x - 7, y - 3, 14, 6);
        // Lighter top
        ctx.fillStyle = '#449944';
        ctx.fillRect(x - 7, y - 5, 14, 2);
        // Roof
        ctx.fillStyle = '#ddddcc';
        ctx.fillRect(x - 7, y - 6, 14, 1);
        // Windows
        ctx.fillStyle = '#88ccff';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x - 5.5 + i * 3.2, y - 4, 2.2, 2.5);
        }
        // Door
        ctx.fillStyle = '#224422';
        ctx.fillRect(x + 4, y - 3, 2, 5);
        // Pantograph (power collector)
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x - 1, y - 9);
        ctx.lineTo(x + 1, y - 11);
        ctx.stroke();
        // Snow on roof
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 7, y - 7, 14, 1);
        }
    }

    function drawMannerheimStatue(x, y, palette) {
        // Equestrian statue — rider on horse
        // Pedestal
        ctx.fillStyle = '#888877';
        ctx.fillRect(x - 5, y, 10, 4);
        ctx.fillStyle = '#777766';
        ctx.fillRect(x - 6, y + 4, 12, 2);
        // Horse body
        ctx.fillStyle = '#556655';
        ctx.beginPath();
        ctx.ellipse(x, y - 3, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Horse legs
        ctx.fillRect(x - 4, y - 1, 1.2, 3);
        ctx.fillRect(x - 2, y - 1, 1.2, 3);
        ctx.fillRect(x + 1.5, y - 1, 1.2, 3);
        ctx.fillRect(x + 3.5, y - 1, 1.2, 3);
        // Horse head/neck
        ctx.fillStyle = '#556655';
        ctx.beginPath();
        ctx.moveTo(x + 4, y - 4);
        ctx.lineTo(x + 7, y - 7);
        ctx.lineTo(x + 6, y - 8);
        ctx.lineTo(x + 4, y - 6);
        ctx.closePath();
        ctx.fill();
        // Rider
        ctx.fillStyle = '#444455';
        ctx.fillRect(x - 0.5, y - 8, 3, 4);
        // Rider head
        ctx.beginPath();
        ctx.arc(x + 1, y - 9, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 6, y + 3.5, 12, 0.8);
        }
    }

    function drawKiasmaSprite(x, y, palette) {
        // Kiasma — curved modern art museum
        // Main body (metallic curved shape)
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 3);
        ctx.lineTo(x - 6, y - 4);
        ctx.quadraticCurveTo(x - 2, y - 10, x + 4, y - 8);
        ctx.lineTo(x + 7, y - 5);
        ctx.lineTo(x + 7, y + 3);
        ctx.closePath();
        ctx.fill();
        // Curved roof highlight
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 4);
        ctx.quadraticCurveTo(x - 2, y - 10, x + 4, y - 8);
        ctx.lineTo(x + 7, y - 5);
        ctx.stroke();
        // Glass facade
        ctx.fillStyle = '#88aabb';
        ctx.fillRect(x - 5, y - 2, 5, 5);
        // Glass panels
        ctx.strokeStyle = '#99bbcc';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(x - 5, y - 2, 2.5, 2.5);
        ctx.strokeRect(x - 2.5, y - 2, 2.5, 2.5);
        ctx.strokeRect(x - 5, y + 0.5, 2.5, 2.5);
        ctx.strokeRect(x - 2.5, y + 0.5, 2.5, 2.5);
        // Entrance
        ctx.fillStyle = '#334455';
        ctx.fillRect(x + 1, y + 0.5, 3, 2.5);
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 4.5);
            ctx.quadraticCurveTo(x - 2, y - 10.5, x + 4, y - 8.5);
            ctx.lineTo(x + 7, y - 5.5);
            ctx.lineTo(x + 7, y - 5);
            ctx.quadraticCurveTo(x + 2, y - 8, x - 2, y - 9.5);
            ctx.quadraticCurveTo(x - 5, y - 5, x - 6, y - 4);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawFinlandiaHallSprite(x, y, palette) {
        // Finlandia Hall — Alvar Aalto's white modernist concert hall
        // Stepped asymmetric roofline, white marble, rows of windows

        // Main building body (wide, low)
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x - 10, y - 4, 20, 8);

        // Stepped roofline — taller center-right section
        ctx.fillStyle = '#eeebe8';
        ctx.fillRect(x - 2, y - 9, 8, 5);     // tall tower section
        ctx.fillRect(x - 6, y - 7, 4, 3);      // mid-left step
        ctx.fillRect(x + 6, y - 6, 4, 2);      // right step

        // Angular roof peak on tower
        ctx.fillStyle = '#f0ede8';
        ctx.beginPath();
        ctx.moveTo(x - 2, y - 9);
        ctx.lineTo(x + 1, y - 12);
        ctx.lineTo(x + 6, y - 9);
        ctx.closePath();
        ctx.fill();

        // Metallic blue-gray angled facade on right side
        ctx.fillStyle = '#8da8b8';
        ctx.beginPath();
        ctx.moveTo(x + 6, y - 9);
        ctx.lineTo(x + 10, y - 6);
        ctx.lineTo(x + 10, y - 4);
        ctx.lineTo(x + 6, y - 4);
        ctx.closePath();
        ctx.fill();

        // Window rows on main body
        ctx.fillStyle = '#9ab0c0';
        for (let wx = -8; wx <= 7; wx += 3) {
            ctx.fillRect(x + wx, y - 2, 2, 1.5);
        }
        // Window rows on tower
        for (let wx = -1; wx <= 4; wx += 3) {
            ctx.fillRect(x + wx, y - 7, 2, 1.5);
        }

        // Entrance (dark, center-left)
        ctx.fillStyle = '#445566';
        ctx.fillRect(x - 4, y + 1, 3, 3);

        // Ground line / base plinth
        ctx.fillStyle = '#ccc8c4';
        ctx.fillRect(x - 10, y + 4, 20, 1);

        // Snow on rooftops
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 6, y - 8, 4, 1);
            ctx.fillRect(x - 2, y - 10, 8, 1);
            ctx.fillRect(x + 6, y - 7, 4, 1);
            // Snow on angular peak
            ctx.beginPath();
            ctx.moveTo(x - 1, y - 9.5);
            ctx.lineTo(x + 1, y - 12.5);
            ctx.lineTo(x + 5, y - 9.5);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawOodiLibrarySprite(x, y, palette) {
        // Oodi — Helsinki Central Library with distinctive curved/swooping roof
        // Roof rises at both ends, dips in the middle; warm wood/copper tones

        // Base / ground floor (concrete gray)
        ctx.fillStyle = '#c0bdb8';
        ctx.fillRect(x - 11, y + 1, 22, 4);

        // Glass middle section (visible under the roof dip)
        ctx.fillStyle = '#88aabb';
        ctx.fillRect(x - 9, y - 3, 18, 5);
        // Glass panel lines
        ctx.strokeStyle = '#99bbcc';
        ctx.lineWidth = 0.4;
        for (let gx = -9; gx <= 9; gx += 3) {
            ctx.beginPath();
            ctx.moveTo(x + gx, y - 3);
            ctx.lineTo(x + gx, y + 2);
            ctx.stroke();
        }

        // Swooping roof — warm copper/brown, curves up at both ends
        ctx.fillStyle = '#b08040';
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 8);        // left end (rises up)
        ctx.quadraticCurveTo(x - 6, y - 3, x, y - 4);   // dips toward center
        ctx.quadraticCurveTo(x + 6, y - 5, x + 12, y - 10); // rises right
        ctx.lineTo(x + 12, y - 7);        // roof thickness right
        ctx.quadraticCurveTo(x + 6, y - 2, x, y - 1);
        ctx.quadraticCurveTo(x - 6, y - 0, x - 12, y - 5);  // roof underside
        ctx.closePath();
        ctx.fill();

        // Roof highlight — lighter copper strip along top edge
        ctx.strokeStyle = '#c89850';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 8);
        ctx.quadraticCurveTo(x - 6, y - 3, x, y - 4);
        ctx.quadraticCurveTo(x + 6, y - 5, x + 12, y - 10);
        ctx.stroke();

        // Darker wood accent band along roof edge
        ctx.strokeStyle = '#8a6030';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 5);
        ctx.quadraticCurveTo(x - 6, y - 0, x, y - 1);
        ctx.quadraticCurveTo(x + 6, y - 2, x + 12, y - 7);
        ctx.stroke();

        // Entrance area (dark, center-left)
        ctx.fillStyle = '#445566';
        ctx.fillRect(x - 3, y + 2, 4, 3);

        // Snow on the curved roof
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.moveTo(x - 12, y - 8.5);
            ctx.quadraticCurveTo(x - 6, y - 3.5, x, y - 4.5);
            ctx.quadraticCurveTo(x + 6, y - 5.5, x + 12, y - 10.5);
            ctx.lineTo(x + 12, y - 10);
            ctx.quadraticCurveTo(x + 6, y - 5, x, y - 4);
            ctx.quadraticCurveTo(x - 6, y - 3, x - 12, y - 8);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawHelsinkiWheel(x, y, palette) {
        const r = 10;
        // Support structure
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 4);
        ctx.lineTo(x, y - r + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 4);
        ctx.lineTo(x, y - r + 2);
        ctx.stroke();
        // Base
        ctx.fillStyle = '#555555';
        ctx.fillRect(x - 6, y + 3, 12, 2);
        // Wheel rim
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y - r + 2, r - 1, 0, Math.PI * 2);
        ctx.stroke();
        // Spokes
        ctx.lineWidth = 0.4;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x, y - r + 2);
            ctx.lineTo(x + Math.cos(angle) * (r - 1), y - r + 2 + Math.sin(angle) * (r - 1));
            ctx.stroke();
        }
        // Gondolas (colored capsules at spoke ends)
        const gondolaColors = ['#cc3333', '#3366cc', '#33aa33', '#ddaa00', '#cc33cc', '#33aaaa', '#ff6600', '#9944cc'];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const gx = x + Math.cos(angle) * (r - 1);
            const gy = y - r + 2 + Math.sin(angle) * (r - 1);
            ctx.fillStyle = gondolaColors[i];
            ctx.fillRect(gx - 1.2, gy - 0.8, 2.4, 2);
        }
        // Hub
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(x, y - r + 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawChristmasTree(x, y) {
        // Only drawn in winter — called conditionally
        // Trunk
        ctx.fillStyle = '#553311';
        ctx.fillRect(x - 1, y, 2, 3);
        // Tree layers (dark green)
        ctx.fillStyle = '#225522';
        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x - 5, y - 6);
        ctx.lineTo(x + 5, y - 6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x - 6, y - 2);
        ctx.lineTo(x + 6, y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x - 7, y + 1);
        ctx.lineTo(x + 7, y + 1);
        ctx.closePath();
        ctx.fill();
        // Star on top
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(x, y - 16);
        ctx.lineTo(x - 1.5, y - 13.5);
        ctx.lineTo(x + 1.5, y - 13.5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 12.5);
        ctx.lineTo(x - 1.5, y - 15);
        ctx.lineTo(x + 1.5, y - 15);
        ctx.closePath();
        ctx.fill();
        // Ornaments (colorful dots)
        const ornaments = [
            [-3, -4, '#ff3333'], [2, -3, '#3366ff'], [0, -8, '#ffaa00'],
            [-4, -1, '#ff66cc'], [4, -1, '#33cc33'], [-1, -5, '#ff6600'],
            [3, -7, '#cc33ff'], [-2, -9, '#33cccc'],
        ];
        for (const [ox, oy, c] of ornaments) {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(x + ox, y + oy, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        // Snow on branches
        ctx.fillStyle = '#e8e8f0';
        ctx.fillRect(x - 5, y - 6.5, 3, 0.8);
        ctx.fillRect(x + 2, y - 6.5, 3, 0.8);
        ctx.fillRect(x - 6, y - 2.5, 4, 0.8);
        ctx.fillRect(x + 3, y - 2.5, 3, 0.8);
    }

    function drawSaunaSmoke(x, y) {
        // Small sauna building + smoke puffs
        // Building
        ctx.fillStyle = '#664433';
        ctx.fillRect(x - 4, y - 2, 8, 5);
        // Roof
        ctx.fillStyle = '#553322';
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 2);
        ctx.lineTo(x, y - 6);
        ctx.lineTo(x + 5, y - 2);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = '#443322';
        ctx.fillRect(x - 1, y, 2, 3);
        // Chimney
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 2, y - 7, 2, 3);
        // Smoke puffs (animated-looking, static but staggered)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#cccccc';
        ctx.beginPath(); ctx.arc(x + 3, y - 9, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(x + 4, y - 11, 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.arc(x + 3.5, y - 13.5, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.15;
        ctx.beginPath(); ctx.arc(x + 4.5, y - 16, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    }

    function drawSaunaSprite(x, y, palette) {
        // Sauna building — slightly bigger than the decoration version
        // Building
        ctx.fillStyle = '#664433';
        ctx.fillRect(x - 5, y - 3, 10, 6);
        // Roof
        ctx.fillStyle = '#553322';
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 3);
        ctx.lineTo(x, y - 8);
        ctx.lineTo(x + 6, y - 3);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = '#443322';
        ctx.fillRect(x - 1.5, y - 0.5, 3, 3.5);
        // Window
        ctx.fillStyle = '#ddaa44';
        ctx.fillRect(x + 2, y - 1.5, 2.5, 2);
        // Chimney
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 2.5, y - 9, 2.5, 3.5);
        // Smoke puffs
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#cccccc';
        ctx.beginPath(); ctx.arc(x + 3.5, y - 11, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(x + 4.5, y - 13.5, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.arc(x + 4, y - 16, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 3.5);
            ctx.lineTo(x, y - 8.5);
            ctx.lineTo(x + 6, y - 3.5);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(x + 2.5, y - 9.5, 2.5, 0.7);
        }
    }

    function drawFoodTruckSprite(x, y, palette) {
        // Food truck — side view facing right
        // Wheels
        ctx.fillStyle = '#222222';
        ctx.beginPath(); ctx.arc(x - 4, y + 2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 4, y + 2, 1.5, 0, Math.PI * 2); ctx.fill();
        // Hubcaps
        ctx.fillStyle = '#555555';
        ctx.beginPath(); ctx.arc(x - 4, y + 2, 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 4, y + 2, 0.6, 0, Math.PI * 2); ctx.fill();
        // Truck body
        ctx.fillStyle = '#cc4433';
        ctx.fillRect(x - 6, y - 5, 12, 7);
        // Rounded top
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 5);
        ctx.quadraticCurveTo(x - 6, y - 8, x - 3, y - 8);
        ctx.lineTo(x + 3, y - 8);
        ctx.quadraticCurveTo(x + 6, y - 8, x + 6, y - 5);
        ctx.fill();
        // Serving window (open hatch)
        ctx.fillStyle = '#ffdd88';
        ctx.fillRect(x - 4, y - 4, 6, 3);
        // Window frame
        ctx.strokeStyle = '#aa3322';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x - 4, y - 4, 6, 3);
        // Awning over window
        ctx.fillStyle = '#ff6644';
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 4);
        ctx.lineTo(x - 5, y - 5.5);
        ctx.lineTo(x + 3, y - 5.5);
        ctx.lineTo(x + 3, y - 4);
        ctx.fill();
        // Stripe on awning
        ctx.fillStyle = '#ffcc44';
        ctx.fillRect(x - 5, y - 5, 8, 0.5);
        // Cab (front right)
        ctx.fillStyle = '#bb3322';
        ctx.fillRect(x + 3, y - 4, 3, 5);
        // Windshield
        ctx.fillStyle = '#88bbdd';
        ctx.fillRect(x + 4, y - 3.5, 2, 2.5);
        // Bumper
        ctx.fillStyle = '#888888';
        ctx.fillRect(x + 5.5, y, 1, 1.5);
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 5.5);
            ctx.quadraticCurveTo(x - 6, y - 8.5, x - 3, y - 8.5);
            ctx.lineTo(x + 3, y - 8.5);
            ctx.quadraticCurveTo(x + 6, y - 8.5, x + 6, y - 5.5);
            ctx.fill();
        }
    }

    function drawMarketTent(x, y, color) {
        // Small market stall with striped awning
        // Counter
        ctx.fillStyle = '#aa8855';
        ctx.fillRect(x - 4, y, 8, 3);
        // Awning
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x, y - 4);
        ctx.lineTo(x + 5, y);
        ctx.closePath();
        ctx.fill();
        // Awning stripes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 2.5, y);
        ctx.lineTo(x - 0.5, y - 3);
        ctx.lineTo(x + 0.5, y - 3);
        ctx.lineTo(x + 2.5, y);
        ctx.closePath();
        ctx.fill();
        // Goods on counter (colored dots)
        ctx.fillStyle = '#ff6633';
        ctx.beginPath(); ctx.arc(x - 2, y + 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#33aa33';
        ctx.beginPath(); ctx.arc(x, y + 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath(); ctx.arc(x + 2, y + 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
    }

    function drawBush(x, y, palette) {
        // Darker green than park background for contrast
        const baseGreen = palette.park || '#3a7a2a';
        // Darken the park color for bush
        const r = parseInt(baseGreen.slice(1, 3), 16);
        const g = parseInt(baseGreen.slice(3, 5), 16);
        const b = parseInt(baseGreen.slice(5, 7), 16);
        const dark = '#' + Math.max(0, r - 40).toString(16).padStart(2, '0')
                        + Math.max(0, g - 30).toString(16).padStart(2, '0')
                        + Math.max(0, b - 30).toString(16).padStart(2, '0');
        const mid = '#' + Math.max(0, r - 25).toString(16).padStart(2, '0')
                       + Math.max(0, g - 15).toString(16).padStart(2, '0')
                       + Math.max(0, b - 15).toString(16).padStart(2, '0');
        // Main bush shape — bigger, rounder
        ctx.fillStyle = dark;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 3, y + 1, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x - 3, y + 1, 3.2, 0, Math.PI * 2); ctx.fill();
        // Lighter highlight on top
        ctx.fillStyle = mid;
        ctx.beginPath(); ctx.arc(x, y - 1.5, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 2.5, y - 0.5, 2, 0, Math.PI * 2); ctx.fill();
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath(); ctx.arc(x, y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 2, y - 1, 1.8, 0, Math.PI * 2); ctx.fill();
        }
    }

    function drawMoose(x, y, palette) {
        // Pixel art moose facing right
        // Body
        ctx.fillStyle = '#5a3a1a';
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.fillStyle = '#4a2a0a';
        ctx.fillRect(x - 3.5, y + 2, 1.5, 4);
        ctx.fillRect(x - 1.5, y + 2, 1.5, 4);
        ctx.fillRect(x + 1, y + 2, 1.5, 4);
        ctx.fillRect(x + 3, y + 2, 1.5, 4);
        // Neck and head
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(x + 4, y - 4, 2.5, 5);
        // Head
        ctx.fillStyle = '#6a4a2a';
        ctx.beginPath();
        ctx.ellipse(x + 7, y - 5, 3, 2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Antlers
        ctx.strokeStyle = '#7a5a3a';
        ctx.lineWidth = 0.8;
        // Left antler
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 6);
        ctx.lineTo(x + 3, y - 10);
        ctx.lineTo(x + 1, y - 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 3, y - 10);
        ctx.lineTo(x + 4, y - 12);
        ctx.stroke();
        // Right antler
        ctx.beginPath();
        ctx.moveTo(x + 7, y - 7);
        ctx.lineTo(x + 9, y - 11);
        ctx.lineTo(x + 11, y - 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 9, y - 11);
        ctx.lineTo(x + 9, y - 13);
        ctx.stroke();
        // Eye
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(x + 8, y - 5.5, 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Nose/muzzle
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath();
        ctx.ellipse(x + 9.5, y - 4.5, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        // Snow on back
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.ellipse(x, y - 3, 4, 1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawPolarBear(x, y) {
        // Bigger, more bear-like polar bear
        const s = 1.6; // scale factor
        // Body — large, rounded, bulky
        ctx.fillStyle = '#f0ece8';
        ctx.beginPath();
        ctx.ellipse(x, y, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rear haunch
        ctx.beginPath();
        ctx.ellipse(x - 4 * s, y + 0.5 * s, 3.5 * s, 3.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Shoulder hump (bears have a distinctive shoulder hump)
        ctx.beginPath();
        ctx.ellipse(x + 2 * s, y - 2 * s, 3 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Front legs (thick, sturdy)
        ctx.fillStyle = '#e8e4df';
        ctx.fillRect(x + 1 * s, y + 2.5 * s, 2.5 * s, 4 * s);
        ctx.fillRect(x + 4 * s, y + 2 * s, 2.5 * s, 4.5 * s);
        // Back legs
        ctx.fillRect(x - 5 * s, y + 2 * s, 2.5 * s, 4 * s);
        ctx.fillRect(x - 2.5 * s, y + 2.5 * s, 2.5 * s, 4 * s);
        // Paws (big, round)
        ctx.fillStyle = '#ddd8d2';
        ctx.beginPath(); ctx.ellipse(x + 2.2 * s, y + 6.5 * s, 1.8 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 5.2 * s, y + 6.5 * s, 1.8 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x - 3.8 * s, y + 6 * s, 1.8 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x - 1.3 * s, y + 6.5 * s, 1.8 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();
        // Neck
        ctx.fillStyle = '#f0ece8';
        ctx.fillRect(x + 4 * s, y - 3 * s, 3 * s, 4 * s);
        // Head — elongated, bear-shaped (longer snout than round)
        ctx.beginPath();
        ctx.ellipse(x + 7.5 * s, y - 4 * s, 3.5 * s, 2.8 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Snout (protruding, elongated)
        ctx.fillStyle = '#e8e4df';
        ctx.beginPath();
        ctx.ellipse(x + 10.5 * s, y - 3.5 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Small round ears
        ctx.fillStyle = '#e0dcd6';
        ctx.beginPath(); ctx.arc(x + 6 * s, y - 6.5 * s, 1.3 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 8.5 * s, y - 6.5 * s, 1.3 * s, 0, Math.PI * 2); ctx.fill();
        // Inner ear
        ctx.fillStyle = '#d8ccc0';
        ctx.beginPath(); ctx.arc(x + 6 * s, y - 6.5 * s, 0.7 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 8.5 * s, y - 6.5 * s, 0.7 * s, 0, Math.PI * 2); ctx.fill();
        // Eyes (small, dark, beady)
        ctx.fillStyle = '#111111';
        ctx.beginPath(); ctx.arc(x + 8.5 * s, y - 4.5 * s, 0.5 * s, 0, Math.PI * 2); ctx.fill();
        // Nose (black, prominent)
        ctx.fillStyle = '#111111';
        ctx.beginPath(); ctx.arc(x + 12 * s, y - 3.5 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();
        // Mouth line
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 12 * s, y - 2.8 * s);
        ctx.lineTo(x + 11 * s, y - 2.3 * s);
        ctx.stroke();
        // Short stubby tail
        ctx.fillStyle = '#f0ece8';
        ctx.beginPath();
        ctx.arc(x - 6.5 * s, y - 1 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawLighthouse(x, y, palette) {
        // Lighthouse tower
        // Base
        ctx.fillStyle = '#888877';
        ctx.fillRect(x - 3, y + 2, 6, 3);
        // Tower (white with red stripe)
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x - 2, y - 10, 4, 12);
        // Red stripes
        ctx.fillStyle = '#cc3333';
        ctx.fillRect(x - 2, y - 7, 4, 2);
        ctx.fillRect(x - 2, y - 2, 4, 2);
        // Lantern room
        ctx.fillStyle = '#333333';
        ctx.fillRect(x - 2.5, y - 12, 5, 2);
        // Glass
        ctx.fillStyle = '#ffee88';
        ctx.fillRect(x - 1.5, y - 11.5, 3, 1);
        // Dome
        ctx.fillStyle = '#cc3333';
        ctx.beginPath();
        ctx.moveTo(x - 2, y - 12);
        ctx.lineTo(x, y - 14);
        ctx.lineTo(x + 2, y - 12);
        ctx.closePath();
        ctx.fill();
        // Light glow
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#ffee88';
        ctx.beginPath();
        ctx.arc(x, y - 11, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Snow
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - 3, y + 1.5, 6, 0.8);
            ctx.fillRect(x - 2.5, y - 12.5, 5, 0.8);
        }
    }

    function drawPig(x, y) {
        // Body — pink oval approximated with rects
        ctx.fillStyle = '#ffaabb';
        ctx.fillRect(x - 7, y - 3, 14, 7);
        ctx.fillRect(x - 5, y - 5, 10, 3);   // top rounding
        ctx.fillRect(x - 5, y + 4, 10, 2);   // bottom rounding
        // Head (pig faces right — toward Helsinki, naturally)
        ctx.fillStyle = '#ffaabb';
        ctx.fillRect(x + 5, y - 5, 7, 7);
        // Ears
        ctx.fillStyle = '#ff88aa';
        ctx.fillRect(x + 6, y - 8, 2, 4);
        ctx.fillRect(x + 9, y - 8, 2, 4);
        // Snout
        ctx.fillStyle = '#ff88aa';
        ctx.fillRect(x + 10, y - 3, 4, 4);
        // Nostrils
        ctx.fillStyle = '#cc5577';
        ctx.fillRect(x + 11, y - 2, 1, 1);
        ctx.fillRect(x + 13, y - 2, 1, 1);
        // Eye
        ctx.fillStyle = '#220011';
        ctx.fillRect(x + 7, y - 4, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 7, y - 4, 1, 1);
        // Legs
        ctx.fillStyle = '#ff99bb';
        ctx.fillRect(x - 4, y + 4, 3, 4);
        ctx.fillRect(x,     y + 4, 3, 4);
        ctx.fillRect(x + 4, y + 4, 3, 4);
        ctx.fillRect(x + 8, y + 4, 3, 4);
        // Curly tail
        ctx.fillStyle = '#ff88aa';
        ctx.fillRect(x - 9, y - 1, 3, 2);
        ctx.fillRect(x - 10, y - 3, 2, 3);
    }

    // === ZOO / KORKEASAARI SPRITES ===

    function drawKorkeasaariDeco(cx, cy, palette) {
        const gy = cy - 8; // gate shifted north
        const ay = cy + 6; // animals shifted south
        // Zoo entrance gate
        ctx.fillStyle = '#887766';
        ctx.fillRect(cx - 10, gy - 4, 3, 7);
        ctx.fillRect(cx + 7, gy - 4, 3, 7);
        // Gate arch
        ctx.strokeStyle = '#887766';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, gy - 4, 8.5, Math.PI, 0);
        ctx.stroke();
        // "ZOO" text on arch
        ctx.fillStyle = '#ddcc88';
        ctx.font = '3px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ZOO', cx, gy - 9);

        // Lion (left side)
        ctx.fillStyle = '#cc9933';
        ctx.beginPath();
        ctx.ellipse(cx - 14, ay + 4, 3, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Mane
        ctx.fillStyle = '#aa7722';
        ctx.beginPath();
        ctx.arc(cx - 12, ay + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.fillStyle = '#cc9933';
        ctx.beginPath();
        ctx.arc(cx - 11.5, ay + 3.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(cx - 11, ay + 3, 0.3, 0, Math.PI * 2); ctx.fill();
        // Legs
        ctx.fillStyle = '#bb8822';
        ctx.fillRect(cx - 16, ay + 5, 1, 2.5);
        ctx.fillRect(cx - 14.5, ay + 5, 1, 2.5);
        ctx.fillRect(cx - 12.5, ay + 5, 1, 2.5);

        // Bear (right side) — brown bear
        ctx.fillStyle = '#6a4422';
        ctx.beginPath();
        ctx.ellipse(cx + 14, ay + 3, 3.5, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(cx + 17, ay + 1.5, 2, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#5a3312';
        ctx.beginPath(); ctx.arc(cx + 16, ay, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 18, ay, 0.8, 0, Math.PI * 2); ctx.fill();
        // Snout
        ctx.fillStyle = '#8a6644';
        ctx.beginPath(); ctx.ellipse(cx + 18.5, ay + 2, 1.2, 0.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(cx + 19.2, ay + 1.8, 0.4, 0, Math.PI * 2); ctx.fill();
        // Legs
        ctx.fillStyle = '#5a3312';
        ctx.fillRect(cx + 11.5, ay + 4.5, 1.3, 3);
        ctx.fillRect(cx + 13.5, ay + 4.5, 1.3, 3);
        ctx.fillRect(cx + 15.5, ay + 4.5, 1.3, 3);

        // Penguin (front center)
        ctx.fillStyle = '#222233';
        ctx.beginPath();
        ctx.ellipse(cx + 2, ay + 5, 1.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // White belly
        ctx.fillStyle = '#eeeeee';
        ctx.beginPath();
        ctx.ellipse(cx + 2, ay + 5.5, 0.9, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(cx + 3.2, ay + 3.8);
        ctx.lineTo(cx + 4, ay + 4.2);
        ctx.lineTo(cx + 3.2, ay + 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(cx + 2.8, ay + 3.5, 0.3, 0, Math.PI * 2); ctx.fill();

        // Tree (between gate and animals)
        ctx.fillStyle = '#335522';
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 2);
        ctx.lineTo(cx - 7, cy + 3);
        ctx.lineTo(cx - 1, cy + 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#553311';
        ctx.fillRect(cx - 4.5, cy + 3, 1.5, 2);

        // Snow on gate
        if (palette.snow) {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(cx - 10, gy - 4.5, 20, 0.7);
        }
    }

    // === TÖÖLÖNLAHTI WATER FEATURES ===

    function drawFountain(x, y, palette) {
        // Water fountain in Töölönlahti — animated in non-winter, frozen in winter
        // Base pool (circle in water)
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
        // Center column
        ctx.fillStyle = '#999988';
        ctx.fillRect(x - 1, y - 2, 2, 4);

        if (palette.snow) {
            // Frozen — just show ice cap on the column
            ctx.fillStyle = '#c8d8e8';
            ctx.beginPath();
            ctx.arc(x, y - 2, 2, Math.PI, 0);
            ctx.fill();
            return;
        }

        // Animated time factor
        const t = animTime * 0.003;
        const jetHeight = 8 + Math.sin(t) * 2; // main jet oscillates 6-10
        const sideSpread = 4 + Math.sin(t * 1.3) * 1.5;

        // Water jets (upward spray)
        ctx.strokeStyle = 'rgba(200,230,255,0.5)';
        ctx.lineWidth = 0.6;
        // Main jet
        ctx.beginPath();
        ctx.moveTo(x, y - 2);
        ctx.lineTo(x, y - 2 - jetHeight);
        ctx.stroke();
        // Side jets arcing outward
        ctx.beginPath();
        ctx.moveTo(x, y - 2 - jetHeight + 2);
        ctx.quadraticCurveTo(x - sideSpread, y - 2 - jetHeight, x - sideSpread - 1, y - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y - 2 - jetHeight + 2);
        ctx.quadraticCurveTo(x + sideSpread, y - 2 - jetHeight, x + sideSpread + 1, y - 4);
        ctx.stroke();
        // Animated splash droplets
        ctx.fillStyle = 'rgba(200,230,255,0.4)';
        const dropCount = 5;
        for (let i = 0; i < dropCount; i++) {
            const phase = t * 2 + i * 1.25;
            const dx = Math.sin(phase) * (sideSpread + 1);
            const dy = Math.abs(Math.cos(phase * 0.7)) * 3 + 2;
            const r = 0.4 + Math.abs(Math.sin(phase * 1.5)) * 0.5;
            ctx.beginPath();
            ctx.arc(x + dx, y - dy, r, 0, Math.PI * 2);
            ctx.fill();
        }
        // Top droplet
        ctx.beginPath();
        ctx.arc(x + Math.sin(t * 1.7) * 0.8, y - 2 - jetHeight - 0.5, 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPaddleBoat(x, y) {
        // Small pedal boat / paddle boat
        // Hull (bright color — typically these are colorful)
        ctx.fillStyle = '#dd6633';
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x - 4, y + 2);
        ctx.lineTo(x + 4, y + 2);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x + 6, y - 0.5);
        ctx.lineTo(x - 5, y - 0.5);
        ctx.closePath();
        ctx.fill();
        // Seats
        ctx.fillStyle = '#cc5522';
        ctx.fillRect(x - 2, y - 2, 2, 2);
        ctx.fillRect(x + 1, y - 2, 2, 2);
        // Seat backs
        ctx.fillRect(x - 2, y - 3.5, 2, 1);
        ctx.fillRect(x + 1, y - 3.5, 2, 1);
        // Canopy frame
        ctx.strokeStyle = '#bb5522';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 2);
        ctx.lineTo(x - 2, y - 5);
        ctx.lineTo(x + 3, y - 5);
        ctx.lineTo(x + 4, y - 2);
        ctx.stroke();
        // Canopy top
        ctx.fillStyle = '#ee7744';
        ctx.fillRect(x - 2.5, y - 6, 6, 1.5);
        // Paddle wheel (visible at back)
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(x - 4.5, y + 1, 1.5, 0, Math.PI * 2);
        ctx.stroke();
        // Spokes
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x - 4.5, y + 1);
            ctx.lineTo(x - 4.5 + Math.cos(a) * 1.5, y + 1 + Math.sin(a) * 1.5);
            ctx.stroke();
        }
    }

    // Polar bear possible spawn positions — each has 5% chance, winter only
    const ALL_POLAR_BEAR_SPOTS = [
        HelsinkiDistricts.geoToMap([[60.197, 24.910]])[0],   // Northern green area
        HelsinkiDistricts.geoToMap([[60.155, 24.874]])[0],   // SW Lauttasaari
        HelsinkiDistricts.geoToMap([[60.149, 24.986]])[0],   // Suomenlinna
        HelsinkiDistricts.geoToMap([[60.181, 24.900]])[0],   // Seurasaari
        HelsinkiDistricts.geoToMap([[60.187, 24.988]])[0],   // Mustikkamaa
        HelsinkiDistricts.geoToMap([[60.193, 24.990]])[0],   // Kulosaari
        HelsinkiDistricts.geoToMap([[60.152, 24.920]])[0],   // Hernesaari
        HelsinkiDistricts.geoToMap([[60.175, 24.890]])[0],   // Kaskisaari
        HelsinkiDistricts.geoToMap([[60.182, 24.990]])[0],   // Korkeasaari
    ];
    // All bears spawn together with 5% chance per winter — it's an event!
    let polarBearsActive = false;
    function rollPolarBears() {
        polarBearsActive = Math.random() < 0.035;
        if (polarBearsActive) {
            Sound.playPolarBears();
            // Log for newspaper
            if (typeof Game !== 'undefined' && Game.logYearlyEvent) {
                Game.logYearlyEvent('special_event', 'POLAR BEARS IN HELSINKI!');
            }
            // Unlock achievement
            if (typeof Achievements !== 'undefined') {
                Achievements.onEasterEgg('polar_bears');
            }
        }
    }
    function forcePolarBears() {
        polarBearsActive = true;
        Sound.playPolarBears();
        render();
    }

    // Land decoration positions
    const landDecoPositions = {
        tram: HelsinkiDistricts.geoToMap([[60.172, 24.934]])[0],          // on Mannerheimintie near Kiasma
        christmasTree: HelsinkiDistricts.geoToMap([[60.1693, 24.9515]])[0], // Senate Square
        marketTents: [                                                     // Market Square (Kauppatori)
            HelsinkiDistricts.geoToMap([[60.168, 24.950]])[0],
            HelsinkiDistricts.geoToMap([[60.168, 24.952]])[0],
            HelsinkiDistricts.geoToMap([[60.1675, 24.951]])[0],
        ],
        bushes: [
            // Esplanadi edges
            HelsinkiDistricts.geoToMap([[60.1688, 24.937]])[0],
            HelsinkiDistricts.geoToMap([[60.1688, 24.942]])[0],
            HelsinkiDistricts.geoToMap([[60.1688, 24.947]])[0],
            HelsinkiDistricts.geoToMap([[60.1693, 24.939]])[0],
            HelsinkiDistricts.geoToMap([[60.1693, 24.944]])[0],
            HelsinkiDistricts.geoToMap([[60.1693, 24.949]])[0],
            // Kaivopuisto park edges
            HelsinkiDistricts.geoToMap([[60.156, 24.948]])[0],
            HelsinkiDistricts.geoToMap([[60.157, 24.954]])[0],
            HelsinkiDistricts.geoToMap([[60.154, 24.952]])[0],
            // Sinebrychoff park
            HelsinkiDistricts.geoToMap([[60.164, 24.919]])[0],
            HelsinkiDistricts.geoToMap([[60.164, 24.922]])[0],
        ],
        moose: HelsinkiDistricts.geoToMap([[60.198, 24.940]])[0],         // Northern green area near Pasila
        lighthouse: HelsinkiDistricts.geoToMap([[60.151, 24.969]])[0],    // Lighthouse Island W of Suomenlinna
        pig: HelsinkiDistricts.geoToMap([[60.202, 24.993]])[0],           // Siansaari — top-right corner
    };

    // Clickable map decorations — non-landmark items with humorous blurb popups
    const MAP_CLICKABLES = [
        {
            name: 'Viking Line',
            pos: HelsinkiDistricts.geoToMap([[60.163, 24.965]])[0],
            blurb: [
                'The MS Viking Grace looms over South Harbour like a floating apartment block with ambitions. Built to carry 2,500 passengers, 500 cars, and an essentially unlimited quantity of Estonian spirits, Viking Line has been connecting Helsinki to Stockholm and Tallinn since 1963. The red hull is their thing. Nobody else is allowed a red hull. This has never been legally enforced, but Viking Line gives a very pointed look.',
                'The onboard experience is best described as a Finnish wedding at sea. There is a buffet. There is a casino. There is a disco that begins at 10pm sharp regardless of whether anyone is there. The duty-free shop is the true spiritual centre of the vessel. Finns have been known to calculate entire trip costs based purely on what they save on Koskenkorva. This is considered rational.',
            ],
        },
        {
            name: 'Silja Line',
            pos: HelsinkiDistricts.geoToMap([[60.160, 24.958]])[0],
            blurb: [
                'The white and blue behemoth of Silja Line has departed from Olympia Terminal since time immemorial — or at least since 1957, which in maritime terms is approximately the same thing. The flagship Silja Serenade is so large it has its own promenade deck, a shopping mall suspended over the Baltic, and a casino that never acknowledges the time of day. Travel writers have called it "a cruise ship that accidentally became a Baltic commuter route."',
                'Silja Line and Viking Line share South Harbour in a relationship best described as cold professional respect. They are parked roughly 200 metres from each other. The crews do not wave. The captains have been known to have coffee at the same harbour café at the same time, in complete silence, reading different newspapers. This is considered normal.',
            ],
        },
        {
            name: 'Suomenlinna',
            pos: HelsinkiDistricts.geoToMap([[60.148, 24.984]])[0],
            blurb: [
                'Suomenlinna — the Fortress of Finland — is an 18th-century sea fortress built on six islands by the Swedes in 1748, controlled by the Russians from 1808, returned to Finland in 1917, and listed as a UNESCO World Heritage Site in 1991. It is staffed by approximately 800 permanent residents who chose to live on a fortress island and appear entirely at peace with this decision. They have a kindergarten, a church, a brewery, and absolutely no road access.',
                'Getting to Suomenlinna requires a 15-minute ferry ride, which is either charming or an inconvenience depending entirely on whether you are a tourist or a resident who forgot milk. The Swedish invasion event tends to be especially dramatic here — locals report it "did not feel particularly different," given that the Swedes built the place. The ferry runs every 20 minutes. There is no excuse for being late, and yet.',
            ],
        },
        {
            name: 'Harakka',
            pos: HelsinkiDistricts.geoToMap([[60.146, 24.949]])[0],
            blurb: [
                'Harakka — Magpie Island — is Helsinki\'s best-kept secret: a nature reserve sitting just 400 metres from the mainland, in full view of the Kaivopuisto café terrace, and reachable by a small ferry that runs in summer. The island is home to a thriving colony of cormorants, a dozen other bird species, and since 1990, a Helsinki City Art Museum studio where artists work in residence every summer. The birds tolerate this arrangement. The artists find the birds inspiring.',
                'The ferry is small. The schedule is optimistic. Helsinki residents are strangely proud of this. "It\'s right there," they say, pointing at the island from the park. "You can practically swim." Whether this qualifies as adventure or inconvenience depends entirely on your relationship with timetables and cormorant noise. The cormorants are not subtle.',
            ],
        },
        {
            name: 'A Moose',
            pos: HelsinkiDistricts.geoToMap([[60.198, 24.940]])[0],
            blurb: [
                'This moose has been observed in the green area north of Pasila for as long as anyone can remember. Nobody is certain how it arrived. The area is urban enough that a moose has absolutely no business being there, and yet. Helsinki\'s relationship with moose is complicated: they are simultaneously a beloved national symbol, a significant traffic hazard, and the subject of the most aggressive warning signs in the Finnish road network.',
                'Hirvi — the Finnish word for moose — also means horror or terrible thing. This is not a coincidence. A full-grown bull moose weighs 500 kilograms and can cover ground at 55 kilometres per hour. During the Moose Rush Hour event, this particular individual appears to be the ringleader. He has never confirmed this. He has also never denied it. This is consistent with moose communication generally.',
            ],
        },
        {
            name: 'Korkeasaari Zoo',
            pos: HelsinkiDistricts.geoToMap([[60.182, 24.990]])[0],
            blurb: [
                'Founded in 1889, Korkeasaari is one of the oldest zoos in the world and sits on its own island, accessible by ferry or, in winter, very carefully over the ice. The zoo houses snow leopards, Amur tigers, pygmy hippos, and approximately 200 other species — all of whom have presumably noted that their island enclosure is surrounded by the Baltic Sea and weighed the logistics of escape unfavourably.',
                'The zoo\'s unofficial mascot is a Siberian tiger who, according to keeper reports, has a strong personality and opinions about visiting hours. Admission is €18 for adults. The gift shop sells stuffed animals of species that are also alive 40 metres away in the same complex. Whether this is reassuring or unsettling is left as an exercise for the visitor.',
            ],
        },
        {
            name: 'Mustikkamaa',
            pos: HelsinkiDistricts.geoToMap([[60.187, 24.988]])[0],
            blurb: [
                'Mustikka means blueberry in Finnish, and Mustikkamaa — Blueberry Land — takes its name seriously. This island park has been a Helsinki recreational spot since the 1800s, beloved for its beaches, camping areas, and the sheer density of wild blueberries covering the forest floor every August. Picking them is legal, traditional, and considered by many Finns to be a meditative practice requiring no explanation.',
                'Finns have a powerful relationship with berries: they pick them in quantities suggesting preparation for a siege, freeze them by the bucket, and add them to everything from soup to schnapps. The blueberry is not merely a fruit in Finland. It is a philosophy. The enormous blueberry sculpture here exists because someone decided that a place called Blueberry Land needed a blueberry visible from space. This was not obviously a bad decision.',
            ],
        },
        {
            name: 'Töölönlahti Fountain',
            pos: HelsinkiDistricts.geoToMap([[60.180, 24.937]])[0],
            blurb: [
                'The fountain at Töölönlahti bay is one of Helsinki\'s most quietly beloved landmarks — a modest jet of water in the middle of a body of water that is already wet, which raises philosophical questions that Finnish pragmatism declines to address. The bay itself is a central park, a jogging route, an outdoor concert venue, and the only body of water in Helsinki that freezes reliably enough for ice skating every January.',
                'In summer the fountain runs continuously, watched by joggers, swan-pedalo operators, and people eating lunch on the grass in the desperate Finnish manner of someone who cannot be certain the sun will return. In winter the fountain stops. The ice forms. People appear with their skates within hours. The swans have relocated. Nobody knows where they go. This is considered one of Helsinki\'s minor mysteries.',
            ],
        },
        {
            name: 'The Lighthouse',
            pos: HelsinkiDistricts.geoToMap([[60.151, 24.969]])[0],
            blurb: [
                'The lighthouse on this tiny island west of Suomenlinna has been blinking methodically into the Helsinki night since the 19th century, warning ships away from the rocks with the quiet dedication of someone who has been doing the same job for 150 years and has simply run out of opinions about it. It was automated in 1969. The last lightkeeper walked to the boat and did not look back.',
                'The lighthouse blinks every four seconds. You can watch it from South Harbour at night. Every four seconds. Tick. Tick. Tick. Maritime historians find this deeply reassuring. Insomniacs find it something else entirely. The lighthouse does not distinguish between audiences. It just blinks. It was built to blink. It will keep blinking.',
            ],
        },
        {
            name: 'Possu',
            pos: HelsinkiDistricts.geoToMap([[60.202, 24.993]])[0],
            blurb: [
                'Possusaari has exactly one resident: a pink Possu (pig) of unknown origin, unclear purpose, and remarkable composure given the circumstances. Nobody knows how it got here. Possu has declined to comment. It spends its days at the water\'s edge, facing southwest toward Helsinki with an expression that the handful of kayakers who have paddled out to verify its existence describe as "philosophical."',
                'Close observers have noted that Possu experiences episodes of intense, inexplicable yearning — particularly on Friday evenings. Researchers now believe this is related to an overwhelming desire to attend a LAN party, a theory supported by Possu\'s apparent attempts to drag a small flat rock to the highest point of the island for better line of sight. There are no servers. There is no power. The ping would be catastrophic. Possu stares southwest. Possu persists.',
            ],
        },
    ];

    function drawLandDecorations(palette) {
        // Tram
        drawTram(landDecoPositions.tram[0], landDecoPositions.tram[1], palette);


        // Christmas tree on Senate Square — winter only
        if (palette.snow) {
            drawChristmasTree(landDecoPositions.christmasTree[0], landDecoPositions.christmasTree[1]);
        }

        // Sauna with smoke

        // Market Square tents
        const tentColors = ['#cc3333', '#3366aa', '#cc8800'];
        for (let i = 0; i < landDecoPositions.marketTents.length; i++) {
            const t = landDecoPositions.marketTents[i];
            drawMarketTent(t[0], t[1], tentColors[i]);
        }

        // Bushes near park edges
        for (const b of landDecoPositions.bushes) {
            drawBush(b[0], b[1], palette);
        }

        // Moose in the north
        drawMoose(landDecoPositions.moose[0], landDecoPositions.moose[1], palette);

        // Polar bears — winter-only easter egg! All spawn at once (5% chance per winter)
        if (palette.snow && polarBearsActive) {
            for (const pb of ALL_POLAR_BEAR_SPOTS) {
                drawPolarBear(pb[0], pb[1]);
            }
        }

        // Lighthouse on lighthouse island
        drawLighthouse(landDecoPositions.lighthouse[0], landDecoPositions.lighthouse[1], palette);

        // The pig
        drawPig(landDecoPositions.pig[0], landDecoPositions.pig[1]);
    }

    // === PIXEL ART BUILDING SPRITES ===
    // Each sprite is drawn relative to (x, y) = bottom-center of the building
    // p = pixel size (1 map-unit per pixel)

    function drawRetailSprite(x, y, color, level) {
        const p = 1;
        const h = 6 + Math.min(level, 3); // taller with upgrades
        // Main building
        ctx.fillStyle = color;
        ctx.fillRect(x - 4*p, y - h*p, 8*p, h*p);
        // Darker base
        ctx.fillStyle = shadeColor(color, -30);
        ctx.fillRect(x - 4*p, y - 2*p, 8*p, 2*p);
        // Awning (striped)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5*p, y - h*p, 10*p, 2*p);
        ctx.fillStyle = shadeColor(color, 20);
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x - 5*p + i*2*p, y - h*p, 1*p, 2*p);
        }
        // Door
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(x - 1*p, y - 3*p, 2*p, 3*p);
        // Window
        ctx.fillStyle = '#ffee88';
        ctx.fillRect(x - 3*p, y - (h-1)*p, 2*p, 2*p);
        ctx.fillRect(x + 1*p, y - (h-1)*p, 2*p, 2*p);
    }

    function drawRestaurantSprite(x, y, color, level) {
        const p = 1;
        const h = 7 + Math.min(level, 3);
        // Main building
        ctx.fillStyle = color;
        ctx.fillRect(x - 4*p, y - h*p, 8*p, h*p);
        // Darker side wall (3D effect)
        ctx.fillStyle = shadeColor(color, -25);
        ctx.fillRect(x + 2*p, y - h*p, 2*p, h*p);
        // Chimney
        ctx.fillStyle = '#664444';
        ctx.fillRect(x + 2*p, y - (h+3)*p, 2*p, 3*p);
        // Smoke puffs (animated)
        const t = (Date.now() / 600) % 4;
        ctx.fillStyle = 'rgba(180,180,180,0.5)';
        ctx.fillRect(x + 2*p, y - (h+4+Math.floor(t))*p, 2*p, 1*p);
        ctx.fillRect(x + 1*p, y - (h+5+Math.floor(t))*p, 2*p, 1*p);
        // Door
        ctx.fillStyle = '#5a2a2a';
        ctx.fillRect(x - 1*p, y - 3*p, 2*p, 3*p);
        // Windows (warm glow)
        ctx.fillStyle = '#ffcc44';
        ctx.fillRect(x - 3*p, y - (h-1)*p, 2*p, 2*p);
        ctx.fillRect(x + 1*p, y - (h-2)*p, 2*p, 2*p);
    }

    function drawResidentialSprite(x, y, color, level) {
        const p = 1;
        const floors = 2 + Math.min(level, 3);
        const h = floors * 3 + 2;
        // Main building
        ctx.fillStyle = color;
        ctx.fillRect(x - 4*p, y - h*p, 8*p, h*p);
        // Peaked roof
        ctx.fillStyle = '#884422';
        ctx.beginPath();
        ctx.moveTo(x - 5*p, y - h*p);
        ctx.lineTo(x, y - (h+4)*p);
        ctx.lineTo(x + 5*p, y - h*p);
        ctx.closePath();
        ctx.fill();
        // Windows (rows per floor)
        ctx.fillStyle = '#aaddff';
        for (let f = 0; f < floors; f++) {
            const wy = y - (3 + f*3)*p;
            ctx.fillRect(x - 3*p, wy, 2*p, 2*p);
            ctx.fillRect(x + 1*p, wy, 2*p, 2*p);
        }
        // Door
        ctx.fillStyle = '#442211';
        ctx.fillRect(x - 1*p, y - 3*p, 2*p, 3*p);
    }

    function drawOfficeSprite(x, y, color, level) {
        const p = 1;
        const floors = 3 + Math.min(level, 4);
        const h = floors * 3 + 1;
        // Main building (tall & narrow)
        ctx.fillStyle = color;
        ctx.fillRect(x - 3*p, y - h*p, 6*p, h*p);
        // Glass curtain wall effect — alternating window rows
        for (let f = 0; f < floors; f++) {
            const wy = y - (2 + f*3)*p;
            ctx.fillStyle = '#88ccff';
            ctx.fillRect(x - 2*p, wy, 1*p, 2*p);
            ctx.fillRect(x - 0*p, wy, 1*p, 2*p);
            ctx.fillRect(x + 2*p, wy, 1*p, 2*p);
            // Window frame
            ctx.fillStyle = shadeColor(color, -20);
            ctx.fillRect(x - 2*p, wy - 1*p, 4*p, 1*p);
        }
        // Flat roof top
        ctx.fillStyle = shadeColor(color, -15);
        ctx.fillRect(x - 3*p, y - h*p, 6*p, 1*p);
        // Antenna
        ctx.fillStyle = '#888888';
        ctx.fillRect(x, y - (h+3)*p, 1*p, 3*p);
    }

    function drawHotelSprite(x, y, color, level) {
        const p = 1;
        const floors = 3 + Math.min(level, 3);
        const h = floors * 3 + 2;
        // Main building (wide)
        ctx.fillStyle = color;
        ctx.fillRect(x - 5*p, y - h*p, 10*p, h*p);
        // Entrance canopy
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(x - 3*p, y - 3*p, 6*p, 1*p);
        // Grand entrance
        ctx.fillStyle = '#442200';
        ctx.fillRect(x - 2*p, y - 3*p, 4*p, 3*p);
        // Windows (3 columns)
        ctx.fillStyle = '#ffee88';
        for (let f = 0; f < floors; f++) {
            const wy = y - (5 + f*3)*p;
            ctx.fillRect(x - 4*p, wy, 2*p, 2*p);
            ctx.fillRect(x - 1*p, wy, 2*p, 2*p);
            ctx.fillRect(x + 2*p, wy, 2*p, 2*p);
        }
        // Flag on top
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y - (h+4)*p, 1*p, 4*p);
        ctx.fillStyle = '#0044cc';
        ctx.fillRect(x + 1*p, y - (h+4)*p, 3*p, 2*p);
    }

    function drawLandmarkSprite(x, y, color, level) {
        const p = 1;
        // Unique star-topped monument
        ctx.fillStyle = color;
        ctx.fillRect(x - 3*p, y - 8*p, 6*p, 8*p);
        // Columns
        ctx.fillStyle = shadeColor(color, 20);
        ctx.fillRect(x - 4*p, y - 7*p, 1*p, 5*p);
        ctx.fillRect(x + 3*p, y - 7*p, 1*p, 5*p);
        // Pediment (triangle top)
        ctx.fillStyle = shadeColor(color, 10);
        ctx.beginPath();
        ctx.moveTo(x - 5*p, y - 8*p);
        ctx.lineTo(x, y - 12*p);
        ctx.lineTo(x + 5*p, y - 8*p);
        ctx.closePath();
        ctx.fill();
        // Star
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(x - 1*p, y - 13*p, 2*p, 2*p);
    }

    function shadeColor(hex, amount) {
        let r = parseInt(hex.slice(1,3), 16) + amount;
        let g = parseInt(hex.slice(3,5), 16) + amount;
        let b = parseInt(hex.slice(5,7), 16) + amount;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
    }

    const typeColors = {
        retail: '#ff8844',
        restaurant: '#ff4488',
        residential: '#4488ff',
        office: '#44bbff',
        hotel: '#ffcc00',
        landmark: '#ff44ff',
        sauna: '#ff6644',
    };

    const spriteDrawers = {
        retail: drawRetailSprite,
        restaurant: drawRestaurantSprite,
        residential: drawResidentialSprite,
        office: drawOfficeSprite,
        hotel: drawHotelSprite,
        landmark: drawLandmarkSprite,
    };

    function drawProperties(palette) {
        if (typeof GameState === 'undefined' || !GameState.properties) return;

        const filtering = typeof UI !== 'undefined' && UI.isFilterActive();

        for (const prop of GameState.properties) {
            const sx = prop.x;
            const sy = prop.y;
            const isHovered = prop === hoveredProperty;
            const matches = !filtering || UI.propertyMatchesFilter(prop);

            if (!matches) {
                ctx.globalAlpha = 0.15;
            }

            // Owner indicator — colored ground pad
            let borderColor = '#888888';
            if (prop.owner === 'player') borderColor = '#44ff44';
            else if (prop.owner) borderColor = '#ff4444';

            // Ground pad (ownership indicator)
            ctx.fillStyle = borderColor;
            ctx.fillRect(sx - 6, sy, 12, 2);

            // Draw the pixel art sprite
            const color = prop.color || typeColors[prop.type] || '#888888';
            if (prop.name === 'Löyly') {
                drawSaunaSprite(sx, sy, palette);
            } else if (prop.name.includes('Food Truck')) {
                drawFoodTruckSprite(sx, sy, palette);
            } else {
                const drawer = spriteDrawers[prop.type];
                if (drawer) {
                    drawer(sx, sy, color, prop.upgradeLevel);
                } else {
                    // Fallback square
                    ctx.fillStyle = color;
                    ctx.fillRect(sx - 4, sy - 8, 8, 8);
                }
            }

            // Snow on rooftops in winter
            if (palette.snow && matches) {
                ctx.fillStyle = '#e8e8f0';
                const h = prop.type === 'office' ? 12 : prop.type === 'hotel' ? 14 : 10;
                ctx.fillRect(sx - 4, sy - h - 1, 8, 2);
            }

            // Shining star for max-upgraded properties (5/5)
            if (prop.upgradeLevel >= 5 && prop.owner === 'player' && matches) {
                const starX = sx + 5;
                const starY = sy - (prop.type === 'hotel' ? 18 : prop.type === 'office' ? 16 : 14);
                const pulse = 0.6 + Math.sin(animTime * 0.004 + prop.x * 0.1) * 0.4;
                ctx.globalAlpha = pulse;
                ctx.fillStyle = '#ffdd00';
                drawStar(starX, starY, 3, 1.2, 4);
                ctx.fillStyle = '#ffffff';
                drawStar(starX, starY, 1.5, 0.6, 4);
                ctx.globalAlpha = matches ? 1 : 0.15;
            }

            // Hover highlight
            if (matches && isHovered) {
                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 1.5;
                const spriteH = prop.type === 'office' ? 16 : prop.type === 'hotel' ? 18 : 14;
                ctx.strokeRect(sx - 7, sy - spriteH, 14, spriteH + 3);
            }

            if (!matches) {
                ctx.globalAlpha = 1;
            }
        }
    }

    // === ALIEN INVASION VISUALS ===

    let alienAnimFrame = 0;
    let alienAnimInterval = null;

    function startAlienAnimation() {
        if (alienAnimInterval) return;
        alienAnimInterval = setInterval(() => {
            alienAnimFrame++;
            render();
        }, 200);
    }

    function stopAlienAnimation() {
        if (alienAnimInterval) {
            clearInterval(alienAnimInterval);
            alienAnimInterval = null;
            alienAnimFrame = 0;
        }
    }

    function drawAlienInvasion(palette) {
        if (typeof GameState === 'undefined') return;
        const alienEvent = GameState.activeEvents.find(e => e.id === 'alien_invasion');
        if (!alienEvent) {
            if (alienAnimInterval) stopAlienAnimation();
            return;
        }

        startAlienAnimation();
        const t = alienAnimFrame;

        // Determine affected area center
        let cx, cy;
        if (alienEvent.affectedDistricts && alienEvent.affectedDistricts.length > 0) {
            const district = HelsinkiDistricts.districts.find(d => d.id === alienEvent.affectedDistricts[0]);
            if (district) {
                [cx, cy] = district.center;
            }
        }
        if (!cx) {
            // Fallback: center of map
            cx = HelsinkiDistricts.MAP_WIDTH / 2;
            cy = HelsinkiDistricts.MAP_HEIGHT / 2;
        }

        // Eerie green atmospheric tint over affected area
        ctx.globalAlpha = 0.06 + Math.sin(t * 0.3) * 0.02;
        ctx.fillStyle = '#00ff44';
        ctx.fillRect(0, 0, HelsinkiDistricts.MAP_WIDTH, HelsinkiDistricts.MAP_HEIGHT);
        ctx.globalAlpha = 1;

        // Draw 3 UFOs in formation around the district center
        const ufoPositions = [
            [cx, cy - 30],
            [cx - 40 + Math.sin(t * 0.2) * 8, cy - 15 + Math.cos(t * 0.15) * 5],
            [cx + 40 + Math.cos(t * 0.25) * 8, cy - 20 + Math.sin(t * 0.18) * 5],
        ];

        for (let i = 0; i < ufoPositions.length; i++) {
            const [ux, uy] = ufoPositions[i];
            // Tractor beam (green cone of light)
            const beamFlicker = 0.12 + Math.sin(t * 0.4 + i * 2) * 0.05;
            ctx.globalAlpha = beamFlicker;
            ctx.fillStyle = '#44ff88';
            ctx.beginPath();
            ctx.moveTo(ux - 3, uy + 5);
            ctx.lineTo(ux + 3, uy + 5);
            ctx.lineTo(ux + 15, uy + 60);
            ctx.lineTo(ux - 15, uy + 60);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;

            drawUFO(ux, uy, t, i);
        }

        // Scattered green "scan" particles
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 12; i++) {
            const px = cx + Math.sin(t * 0.1 + i * 1.3) * 60;
            const py = cy + Math.cos(t * 0.08 + i * 0.9) * 40;
            const size = 1 + (i % 3);
            ctx.fillStyle = i % 2 === 0 ? '#44ff88' : '#88ffcc';
            ctx.fillRect(px, py, size, size);
        }
        ctx.globalAlpha = 1;
    }

    function drawUFO(x, y, t, idx) {
        const bob = Math.sin(t * 0.3 + idx * 2) * 2;
        const uy = y + bob;

        // UFO body (classic saucer shape)
        // Bottom dome (dark)
        ctx.fillStyle = '#556677';
        ctx.beginPath();
        ctx.ellipse(x, uy + 2, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main saucer disc
        ctx.fillStyle = '#99aabb';
        ctx.beginPath();
        ctx.ellipse(x, uy, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Saucer rim highlight
        ctx.fillStyle = '#bbccdd';
        ctx.beginPath();
        ctx.ellipse(x, uy - 1, 10, 2, 0, 0, Math.PI);
        ctx.fill();

        // Cockpit dome (glass)
        ctx.fillStyle = '#66ffaa';
        ctx.beginPath();
        ctx.ellipse(x, uy - 2, 4, 3, 0, Math.PI, 0);
        ctx.fill();
        // Cockpit highlight
        ctx.fillStyle = '#aaffcc';
        ctx.beginPath();
        ctx.ellipse(x - 1, uy - 3, 2, 1.5, 0, Math.PI, 0);
        ctx.fill();

        // Blinking lights around rim
        const numLights = 6;
        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2 + t * 0.5;
            const lx = x + Math.cos(angle) * 9;
            const ly = uy + Math.sin(angle) * 2.5;
            const on = ((t + i * 2) % 4) < 2;
            ctx.fillStyle = on ? '#ff4444' : '#ffcc00';
            ctx.fillRect(lx - 0.5, ly - 0.5, 1.5, 1.5);
        }
    }

    // === EASTER EGG VISUALS ===

    function drawEasterEggs(palette) {
        if (typeof GameState === 'undefined') return;
        // Reset animation timers when events not active
        if (!GameState.activeEvents.some(e => e.id === 'tonttu_invasion')) tonttuStartTime = 0;
        if (!GameState.activeEvents.some(e => e.id === 'angry_bird')) { angryBirdStartTime = 0; angryBirdSoundPlayed = false; }
        for (const evt of GameState.activeEvents) {
            if (evt.id === 'tonttu_invasion') drawTonttuInvasion(palette);
            if (evt.id === 'moose_rush_hour') drawMooseRushHour(palette);
            if (evt.id === 'rubber_duck') drawRubberDuck(palette);
        }
    }

    function drawScreenEasterEggs() {
        if (typeof GameState === 'undefined') return;
        for (const evt of GameState.activeEvents) {
            if (evt.id === 'northern_lights') drawNorthernLights();
            if (evt.id === 'angry_bird') drawAngryBirdFlight();
            if (evt.id === 'swedish_invasion') drawSwedishFlag();
        }
    }

    function drawSwedishFlag() {
        if (!canvas) return;
        // Draw Swedish flag at top-center of screen
        const flagW = 80, flagH = 50;
        const fx = (cssWidth - flagW) / 2;
        const fy = 8;

        // Gentle wave animation
        const wave = Math.sin(animTime * 2) * 2;

        ctx.save();

        // Flag shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(fx + 2, fy + 2 + wave, flagW, flagH);

        // Blue background
        ctx.fillStyle = '#006AA7';
        ctx.fillRect(fx, fy + wave, flagW, flagH);

        // Yellow cross (Scandinavian cross — offset left)
        ctx.fillStyle = '#FECC00';
        // Horizontal bar
        ctx.fillRect(fx, fy + wave + flagH * 0.4, flagW, flagH * 0.2);
        // Vertical bar (offset to left third)
        ctx.fillRect(fx + flagW * 0.3, fy + wave, flagW * 0.15, flagH);

        // Flag border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(fx, fy + wave, flagW, flagH);

        // Flagpole
        ctx.fillStyle = '#666';
        ctx.fillRect(fx - 3, fy - 4, 4, flagH + 16);
        // Pole finial
        ctx.fillStyle = '#FECC00';
        ctx.beginPath();
        ctx.arc(fx - 1, fy - 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // "SVENSKA HELSINFORS" text below flag
        ctx.font = '5px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        const textX = fx + flagW / 2;
        const textY = fy + flagH + wave + 4;
        ctx.strokeText('HELSINGFORS', textX, textY);
        ctx.fillStyle = '#FECC00';
        ctx.fillText('HELSINGFORS', textX, textY);

        ctx.restore();
    }

    // --- ANGRY BIRD ---
    let angryBirdStartTime = 0;
    let angryBirdSoundPlayed = false;

    function drawAngryBirdFlight() {
        if (!canvas) return;
        if (!angryBirdStartTime) {
            angryBirdStartTime = animTime;
            angryBirdSoundPlayed = false;
        }

        const elapsed = (animTime - angryBirdStartTime) * 0.001; // seconds
        const flightDuration = 2.5; // seconds to cross screen
        const progress = Math.min(elapsed / flightDuration, 1);

        // Play sound at start
        if (!angryBirdSoundPlayed) {
            angryBirdSoundPlayed = true;
            Sound.playAngryBird();
        }

        if (progress >= 1) return; // flight done, stays in activeEvents for revenue but no more drawing

        // Parabolic arc: left to right, peaking in upper third
        const w = cssWidth;
        const h = cssHeight;
        const bx = -60 + (w + 120) * progress;
        const arc = -4 * (progress - 0.5) * (progress - 0.5) + 1; // peaks at 0.5
        const by = h * 0.7 - arc * h * 0.45; // starts low-left, arcs up, lands low-right
        const rotation = (progress - 0.5) * 0.6; // slight spin

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rotation);
        drawAngryBirdSprite(0, 0);
        ctx.restore();
    }

    function drawAngryBirdSprite(x, y) {
        const s = 2.2; // scale — about 3x moose size

        // Body (red, round)
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.arc(x, y, 14*s, 0, Math.PI * 2);
        ctx.fill();

        // Darker red underbelly shadow
        ctx.fillStyle = '#aa1a1a';
        ctx.beginPath();
        ctx.arc(x, y + 4*s, 12*s, 0, Math.PI);
        ctx.fill();

        // Belly (cream/beige oval)
        ctx.fillStyle = '#ffe8c8';
        ctx.beginPath();
        ctx.ellipse(x, y + 5*s, 8*s, 7*s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly inner highlight
        ctx.fillStyle = '#fff2dd';
        ctx.beginPath();
        ctx.ellipse(x, y + 4*s, 5*s, 4.5*s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail feathers (dark, back-top)
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.moveTo(x - 3*s, y - 12*s);
        ctx.lineTo(x - 8*s, y - 22*s);
        ctx.lineTo(x - 4*s, y - 20*s);
        ctx.lineTo(x, y - 24*s);
        ctx.lineTo(x + 4*s, y - 20*s);
        ctx.lineTo(x + 8*s, y - 22*s);
        ctx.lineTo(x + 3*s, y - 12*s);
        ctx.closePath();
        ctx.fill();

        // Head tuft (two feathers on top)
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.moveTo(x - 1*s, y - 13*s);
        ctx.lineTo(x - 3*s, y - 20*s);
        ctx.lineTo(x + 1*s, y - 14*s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 1*s, y - 13*s);
        ctx.lineTo(x + 3*s, y - 19*s);
        ctx.lineTo(x + 4*s, y - 13*s);
        ctx.closePath();
        ctx.fill();

        // Angry eyebrows (thick, V-shaped, iconic!)
        ctx.fillStyle = '#222222';
        ctx.save();
        // Left eyebrow
        ctx.translate(x - 4*s, y - 6*s);
        ctx.rotate(-0.35);
        ctx.fillRect(-6*s, -1.5*s, 8*s, 3*s);
        ctx.restore();
        ctx.save();
        // Right eyebrow
        ctx.translate(x + 4*s, y - 6*s);
        ctx.rotate(0.35);
        ctx.fillRect(-2*s, -1.5*s, 8*s, 3*s);
        ctx.restore();

        // Eyes (white circles with black pupils)
        // Left eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 4*s, y - 2*s, 4*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(x - 3*s, y - 1.5*s, 2*s, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 4*s, y - 2*s, 4*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(x + 3*s, y - 1.5*s, 2*s, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 4*s, y - 3*s, 1*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 2.5*s, y - 3*s, 1*s, 0, Math.PI * 2);
        ctx.fill();

        // Beak (yellow/orange diamond, pointing right)
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(x + 1*s, y + 1*s);
        ctx.lineTo(x + 10*s, y + 4*s);
        ctx.lineTo(x + 1*s, y + 7*s);
        ctx.closePath();
        ctx.fill();
        // Upper beak
        ctx.fillStyle = '#ffcc22';
        ctx.beginPath();
        ctx.moveTo(x + 1*s, y + 1*s);
        ctx.lineTo(x + 10*s, y + 4*s);
        ctx.lineTo(x + 1*s, y + 4*s);
        ctx.closePath();
        ctx.fill();
    }

    // --- TONTTU INVASION ---
    // Small red-capped gnomes sitting on building rooftops
    let tonttuStartTime = 0;

    function drawTonttuInvasion(palette) {
        // Track when invasion started for bounce effect
        if (!tonttuStartTime) tonttuStartTime = animTime;
        const elapsed = (animTime - tonttuStartTime) * 0.001; // seconds since start
        const t = animTime * 0.001;
        let idx = 0;

        // Place tontut on owned properties
        const ownedProps = GameState.properties.filter(p => p.owner);
        for (let i = 0; i < ownedProps.length && i < 20; i++) {
            const p = ownedProps[i];
            const tx = p.x + (i % 3 - 1) * 3;
            const ty = p.y - 12 - (i % 2) * 2;
            drawTonttu(tx, ty, t + i * 0.7, elapsed, idx++);
        }

        // Spread across ALL landmarks (not just first 8)
        for (let i = 0; i < HelsinkiDistricts.landmarks.length; i++) {
            const lm = HelsinkiDistricts.landmarks[i];
            const tx = lm.pos[0] + 3;
            const ty = lm.pos[1] - 10;
            drawTonttu(tx, ty, t + i * 1.1 + 5, elapsed, idx++);
        }

        // Also scatter some on random unowned properties across the city
        const unowned = GameState.properties.filter(p => !p.owner);
        const step = Math.max(1, Math.floor(unowned.length / 15)); // pick ~15 spread across the list
        for (let i = 0; i < unowned.length; i += step) {
            const p = unowned[i];
            const tx = p.x + ((i / step) % 3 - 1) * 3;
            const ty = p.y - 12;
            drawTonttu(tx, ty, t + i * 0.5 + 10, elapsed, idx++);
        }
    }

    function drawTonttu(x, y, t, elapsed, idx) {
        // Big excited bouncing for first 4 seconds, then settle to gentle bob
        const bouncePhase = Math.max(0, 1 - elapsed / 4); // 1→0 over 4s
        const bigBounce = Math.abs(Math.sin((t + idx * 0.4) * 5)) * 6 * bouncePhase;
        const gentleBob = Math.sin(t * 2) * 0.5;
        const bob = gentleBob - bigBounce;
        const ty = y + bob;
        // Body (grey wool)
        ctx.fillStyle = '#666677';
        ctx.fillRect(x - 1.5, ty - 1, 3, 3);
        // Head
        ctx.fillStyle = '#ddbb88';
        ctx.beginPath();
        ctx.arc(x, ty - 2.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Red pointy hat
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.moveTo(x - 2, ty - 3);
        ctx.lineTo(x, ty - 7 + Math.sin(t * 3) * 0.5);
        ctx.lineTo(x + 2, ty - 3);
        ctx.closePath();
        ctx.fill();
        // Hat brim
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2.2, ty - 3.5, 4.4, 1);
        // Eyes (tiny dots)
        ctx.fillStyle = '#111111';
        ctx.fillRect(x - 1, ty - 2.8, 0.6, 0.6);
        ctx.fillRect(x + 0.5, ty - 2.8, 0.6, 0.6);
        // White beard
        ctx.fillStyle = '#eeeeee';
        ctx.beginPath();
        ctx.moveTo(x - 1.2, ty - 1.5);
        ctx.lineTo(x, ty + 0.5);
        ctx.lineTo(x + 1.2, ty - 1.5);
        ctx.closePath();
        ctx.fill();
    }

    // --- MOOSE RUSH HOUR ---
    // Animated moose running along Mannerheimintie
    function drawMooseRushHour(palette) {
        const t = animTime * 0.001;
        // Find Mannerheimintie road to get its path
        const road = HelsinkiDistricts.roads.find(r => r.name === 'Mannerheimintie');
        if (!road || !road.points || road.points.length < 2) return;

        // 5 moose running along the road at different positions
        for (let i = 0; i < 5; i++) {
            const progress = ((t * 0.08 + i * 0.2) % 1.0);
            // Interpolate along road points
            const totalSegs = road.points.length - 1;
            const segFloat = progress * totalSegs;
            const segIdx = Math.min(Math.floor(segFloat), totalSegs - 1);
            const segT = segFloat - segIdx;
            const p1 = road.points[segIdx];
            const p2 = road.points[segIdx + 1];
            const mx = p1[0] + (p2[0] - p1[0]) * segT + (i % 2 - 0.5) * 6;
            const my = p1[1] + (p2[1] - p1[1]) * segT;
            drawRunningMoose(mx, my, t + i, palette);
        }

        // Dust cloud particles along the road
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#aa9966';
        for (let i = 0; i < 15; i++) {
            const progress = ((t * 0.08 + i * 0.07) % 1.0);
            const totalSegs = road.points.length - 1;
            const segFloat = progress * totalSegs;
            const segIdx = Math.min(Math.floor(segFloat), totalSegs - 1);
            const segT = segFloat - segIdx;
            const p1 = road.points[segIdx];
            const p2 = road.points[segIdx + 1];
            const dx = p1[0] + (p2[0] - p1[0]) * segT + Math.sin(t + i) * 8;
            const dy = p1[1] + (p2[1] - p1[1]) * segT + Math.cos(t + i) * 4;
            ctx.beginPath();
            ctx.arc(dx, dy, 2 + Math.sin(i) * 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function drawRunningMoose(x, y, t, palette) {
        // Animated running moose (legs move)
        const stride = Math.sin(t * 6) * 2;
        // Body (brown)
        ctx.fillStyle = '#664422';
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Legs (animated)
        ctx.fillStyle = '#553311';
        ctx.fillRect(x - 4, y - 1 + stride, 1.5, 4);
        ctx.fillRect(x - 1.5, y - 1 - stride, 1.5, 4);
        ctx.fillRect(x + 1, y - 1 + stride * 0.8, 1.5, 4);
        ctx.fillRect(x + 3.5, y - 1 - stride * 0.8, 1.5, 4);
        // Neck
        ctx.fillStyle = '#664422';
        ctx.beginPath();
        ctx.moveTo(x + 4, y - 5);
        ctx.lineTo(x + 7, y - 10);
        ctx.lineTo(x + 5, y - 10);
        ctx.lineTo(x + 3, y - 6);
        ctx.closePath();
        ctx.fill();
        // Head
        ctx.fillStyle = '#553311';
        ctx.beginPath();
        ctx.ellipse(x + 7, y - 11, 3, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Antlers
        ctx.strokeStyle = '#776644';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x + 6, y - 12);
        ctx.lineTo(x + 4, y - 16);
        ctx.lineTo(x + 2, y - 15);
        ctx.moveTo(x + 4, y - 16);
        ctx.lineTo(x + 5, y - 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 12);
        ctx.lineTo(x + 10, y - 16);
        ctx.lineTo(x + 12, y - 15);
        ctx.moveTo(x + 10, y - 16);
        ctx.lineTo(x + 9, y - 18);
        ctx.stroke();
        // Eye
        ctx.fillStyle = '#111111';
        ctx.fillRect(x + 8, y - 11.5, 0.8, 0.8);
    }

    // --- GIANT RUBBER DUCK ---
    function drawRubberDuck(palette) {
        // Position in South Harbour
        const pos = HelsinkiDistricts.geoToMap([[60.165, 24.958]])[0];
        const x = pos[0], y = pos[1];
        const t = animTime * 0.001;
        const bob = Math.sin(t * 1.5) * 2;
        const tilt = Math.sin(t * 0.8) * 0.05;

        ctx.save();
        ctx.translate(x, y + bob);
        ctx.rotate(tilt);

        // Water ripples around duck
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            const r = 14 + i * 5 + Math.sin(t + i) * 2;
            ctx.globalAlpha = 0.15 - i * 0.04;
            ctx.beginPath();
            ctx.ellipse(0, 4, r, r * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Body (big yellow oval)
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Body highlight
        ctx.fillStyle = '#ffee55';
        ctx.beginPath();
        ctx.ellipse(-2, -2, 5, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Head (smaller circle)
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.arc(8, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        // Head highlight
        ctx.fillStyle = '#ffee55';
        ctx.beginPath();
        ctx.arc(7, -9.5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Beak (orange)
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(12, -8);
        ctx.lineTo(17, -7);
        ctx.lineTo(12, -5.5);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(10, -9.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10.5, -10, 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // --- NORTHERN LIGHTS ---
    function drawNorthernLights() {
        if (!canvas) return;
        const t = animTime * 0.0005;
        const w = cssWidth;

        ctx.save();
        // Draw aurora bands across the top of the screen
        for (let band = 0; band < 5; band++) {
            const baseY = 20 + band * 25;
            const hue = band * 30; // green to teal to blue-green
            ctx.globalAlpha = 0.08 + Math.sin(t * 2 + band * 0.7) * 0.04;

            ctx.beginPath();
            ctx.moveTo(0, baseY);
            for (let x = 0; x <= w; x += 8) {
                const wave = Math.sin(x * 0.008 + t * 3 + band * 1.2) * 15
                           + Math.sin(x * 0.015 + t * 1.5 + band) * 8;
                ctx.lineTo(x, baseY + wave);
            }
            // Close to form a filled band
            for (let x = w; x >= 0; x -= 8) {
                const wave = Math.sin(x * 0.008 + t * 3 + band * 1.2) * 15
                           + Math.sin(x * 0.015 + t * 1.5 + band) * 8;
                ctx.lineTo(x, baseY + wave + 30 + Math.sin(t + band) * 5);
            }
            ctx.closePath();

            // Green-teal gradient
            const r = Math.floor(20 + band * 10);
            const g = Math.floor(200 - band * 15);
            const b = Math.floor(80 + band * 30);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fill();
        }

        // Shimmer particles
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 20; i++) {
            const px = (Math.sin(t * 1.3 + i * 3.7) * 0.5 + 0.5) * w;
            const py = 20 + Math.sin(t * 0.8 + i * 2.1) * 50 + 40;
            const size = 1 + Math.sin(t * 4 + i) * 0.5;
            ctx.fillStyle = i % 3 === 0 ? '#88ffaa' : (i % 3 === 1 ? '#55ddaa' : '#aaffcc');
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function isSwedishInvasionActive() {
        return typeof GameState !== 'undefined' &&
            GameState.activeEvents &&
            GameState.activeEvents.some(e => e.id === 'swedish_invasion');
    }

    function drawDistrictLabels(palette) {
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const useSwedish = isSwedishInvasionActive();

        for (const district of HelsinkiDistricts.districts) {
            const [cx, cy] = district.center;
            const isHovered = district === hoveredDistrict;

            const label = useSwedish
                ? (HelsinkiDistricts.SWEDISH_NAMES[district.id] || district.name)
                : district.name;

            // Text outline for readability (no background box)
            ctx.strokeStyle = 'rgba(10, 10, 26, 0.9)';
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.strokeText(label, cx, cy);

            ctx.fillStyle = isHovered ? '#ffcc00' : 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(label, cx, cy);
        }

        // Island labels + decorative sprites
        ctx.font = '6px "Press Start 2P"';
        if (HelsinkiDistricts.islands) {
            for (const island of HelsinkiDistricts.islands) {
                if (!island.label) continue;
                const poly = island.polygon;
                let sx = 0, sy = 0;
                for (const p of poly) { sx += p[0]; sy += p[1]; }
                const cx = sx / poly.length;
                const cy = sy / poly.length;

                // Draw island-specific decorations
                if (island.name === 'Suomenlinna') {
                    drawSuomenlinnaDeco(cx, cy, palette);
                } else if (island.name === 'Mustikkamaa') {
                    drawBlueberryDeco(cx, cy - 10);
                } else if (island.name === 'Korkeasaari') {
                    drawKorkeasaariDeco(cx, cy, palette);
                }

                const islandLabel = useSwedish
                    ? (HelsinkiDistricts.SWEDISH_NAMES[island.name] || island.name)
                    : island.name;

                ctx.font = '6px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(10, 10, 26, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeText(islandLabel, cx, cy);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillText(islandLabel, cx, cy);
            }
        }

        // Water body labels
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const toolonlahtiLabel = useSwedish ? 'Tölöviken' : 'Töölönlahti';
        const toolonlahtiCenter = HelsinkiDistricts.geoToMap([[60.180, 24.937]])[0];
        ctx.strokeStyle = 'rgba(10, 10, 26, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeText(toolonlahtiLabel, toolonlahtiCenter[0], toolonlahtiCenter[1] + 12);
        ctx.fillStyle = 'rgba(180, 210, 230, 0.6)';
        ctx.fillText(toolonlahtiLabel, toolonlahtiCenter[0], toolonlahtiCenter[1] + 12);

        // Munkkiniemi area label (not a district, just a geographic label)
        const munkkiniemiLabel = useSwedish ? 'Munksnäs' : 'Munkkiniemi';
        const munkkiniemiPos = HelsinkiDistricts.geoToMap([[60.194, 24.912]])[0];
        ctx.strokeStyle = 'rgba(10, 10, 26, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeText(munkkiniemiLabel, munkkiniemiPos[0], munkkiniemiPos[1] - 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fillText(munkkiniemiLabel, munkkiniemiPos[0], munkkiniemiPos[1] - 10);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // Drawn last so tooltips always appear on top of district labels
    function drawHoverTooltips() {
        ctx.font = '6px "Press Start 2P"';

        if (hoveredProperty) {
            const sx = hoveredProperty.x;
            const sy = hoveredProperty.y;
            const label = hoveredProperty.name;
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(10,10,26,0.92)';
            ctx.fillRect(sx - textWidth / 2 - 4, sy - 20, textWidth + 8, 12);
            ctx.fillStyle = '#ffcc00';
            ctx.fillText(label, sx - textWidth / 2, sy - 11);
        }

        if (hoveredLandmark) {
            const [x, y] = hoveredLandmark.pos;
            const label = hoveredLandmark.name;
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(10,10,26,0.92)';
            ctx.fillRect(x - textWidth / 2 - 4, y - 24, textWidth + 8, 12);
            ctx.fillStyle = '#ffcc00';
            ctx.fillText(label, x - textWidth / 2, y - 15);
        }
    }

    // =========================================================
    // ADVISOR — Monopoly Man-style tycoon with speech bubble
    // =========================================================
    const ADVISOR_TIPS = [
        // General tips
        "Buy low, upgrade high. That's the Helsinki way.",
        "Keep your properties in shape! Tenants hate leaky pipes.",
        "Diversify, my friend. Don't put all your euros in one district.",
        "A wise investor always keeps some cash in reserve.",
        "Winter is coming. Hotels slow down, but retail goes brrr.",
        "Summer tourists love hotels and restaurants. Ka-ching!",
        "The bank is your friend... until the interest bill arrives.",
        "Hire a maintenance person. Your future self will thank you.",
        "An accountant pays for itself if you have a big loan.",
        "A property manager means one extra action per turn!",
        "Check the Stats panel to see how your empire grows.",
        "Use filters to find bargain properties. There's always a deal.",
        "Rivals can't buy what you buy first. Speed matters!",
        "Upgraded properties earn more AND look taller. Win-win.",
        "Sell before a crash, buy after one. Easier said than done.",
        // Funny
        "I once bought all of Kallio. The hipsters were NOT happy.",
        "In Helsinki, even the seagulls have investment portfolios.",
        "They say money can't buy happiness. They never owned Stockmann.",
        "Nalle Wahlroos just bought another property. Do something!",
        "Hjallis is eyeing that restaurant. Are you going to let him?",
        "Pro tip: aliens occasionally invade. Don't ask me why.",
        "The market goes up, the market goes down. I just twirl my mustache.",
        "I've been standing here for hours. Could you end the turn?",
        "Fun fact: I'm not actually the Monopoly Man. Please don't sue.",
        "Psst... Ctrl+Shift+C. You didn't hear it from me.",
        "My monocle sees all. Especially underpriced real estate.",
        "Helsinki has more saunas than parking spots. Invest accordingly.",
        "Did you know? Löyly means 'steam.' And also 'money printer.'",
        "Jätkäsaari used to be a harbour. Now it's a gold mine.",
        "Töölö is lovely this time of year. Any time of year, really.",
        // --- New tips ---
        "Condition drops faster than you think. Stay ahead of it.",
        "The Scout staff member can spot deals you'd never find alone.",
        "Landmarks can't be bought, but the properties near them? Fair game.",
        "Spring is a great time to buy. Everyone else is waiting for summer.",
        "Don't ignore cheap properties. Upgrade them and watch them bloom.",
        "A fully upgraded property is a beautiful thing. Five stars!",
        "The newspaper comes every January. Read it for market gossip.",
        "Auctions are chaotic. That's where the real deals happen.",
        "If a rival offers to sell, think carefully. They might know something.",
        "Properties in bad condition earn less. Much less.",
        "Keep an eye on the event ticker. Helsinki is full of surprises.",
        "The interest rate adds up fast. Pay loans early if you can.",
        "Seasonal events can make or break your quarterly revenue.",
        "Eira and Kaivopuisto have the priciest land. Worth every euro.",
        "Kallio is cheap now. Give it time.",
        // --- More funny ---
        "I've seen things you wouldn't believe. Moose on Mannerheimintie.",
        "My top hat is purely decorative. Unlike your portfolio.",
        "Risto is probably analyzing you right now. With an algorithm.",
        "If you hear a Swedish anthem, don't panic. It'll pass.",
        "I tried ice swimming once. I do not recommend it for the faint of heart.",
        "The tram takes forever but the real estate along the route? Chef's kiss.",
        "Every property has a story. Most of them involve leaky pipes.",
        "I've been advising tycoons since... well, since you started.",
        "Suomenlinna is nice to visit. Nicer to own property near.",
        "Remember: Helsinki always wins. The question is whether you win too.",
        "Some say I talk too much. Those people don't own enough property.",
        "Did I mention the 'Can Afford' filter? Very useful for bargain hunters.",
        "A wise man once said: 'Buy property.' That wise man was me.",
        "Kluuvi properties cost a fortune. But so does everything at Stockmann.",
        "They keep building in Jätkäsaari. The cranes have cranes.",
        // --- Batch 2: tips ---
        "Buy near a tram line. The number 9 alone is worth millions.",
        "Never let a property hit zero condition. Trust me on this one.",
        "Your first loan feels scary. Your tenth feels routine. That's growth.",
        "Staff are investments, not expenses. Especially the accountant.",
        "If you can't afford to upgrade, at least repair. Half-measures help.",
        "The Scout tip in the ticker is always worth reading. Always.",
        "Districts that look boring on the map often have great ROI.",
        "Rivals focus on type preferences. Use that against them.",
        "An auction isn't a loss if you drove the price up for your rival.",
        "Don't sleep on Kulosaari. Exclusive is another word for expensive.",
        "The bank is most useful when you don't desperately need it.",
        "Seasonal revenue swings are predictable. Plan around them.",
        "Condition below 50% is an emergency. Treat it like one.",
        "If you're cash-heavy in spring, buy before the summer rush.",
        "Revenue compounds. Upgrade early, thank yourself later.",
        "Kallio rents are rising. What? That's what I heard.",
        "Check your net worth in Stats. It's the number that actually matters.",
        "The log panel is a full confession of your financial decisions.",
        "Buying in Kruununhaka? You have expensive taste. I approve.",
        "Market crashes are temporary. Good locations are permanent.",
        // --- Batch 2: funny ---
        "The monocle isn't just decorative. It magnifies undervalued assets.",
        "I once tried to buy Suomenlinna. Apparently it's not for sale. Yet.",
        "Peter Vesterbacka thinks everything should have a tunnel. I agree about the profit.",
        "The bear in Korkeasaari looks at the market more calmly than most investors.",
        "You can undo your last action. You cannot undo bad strategy.",
        "Every city has its Mayfair. In Helsinki, it's Eira. Go buy something there.",
        "I've watched this city from this corner for a very long time.",
        "Technically, I am made of pixels. Financially, I am made of ambition.",
        "The trams run on time. Your rent collection should too.",
        "That moose in the north looks like he knows something. Follow his gaze.",
        "My predecessor advised Swedish tycoons. He didn't last long.",
        "If you're reading this, you have too much free time. Also, buy something.",
        "I once forgot to repair a property for three turns. I still have nightmares.",
        "Hjallis never met a restaurant he didn't want to own. Smart man.",
        "The Silja Line leaves every evening. Your competition should too.",
        "I have never once regretted a purchase. I have OFTEN regretted not purchasing.",
        "The harbour view adds 20% to property value. The Monopoly Man adds dignity.",
        "Did you know Helsinki has over 300 islands? And I want all of them.",
        "The polar bears swim past the harbour sometimes. Very distracting.",
        "Even in silence, Helsinki real estate appreciates. Especially in silence.",
        "Winter is long in Helsinki. Your income stream shouldn't be.",
        "My top hat contains an entire market analysis. Don't ask me to prove it.",
        "Someone in Töölö is always watching you make decisions. Make good ones.",
        "I have met the rubber duck. We do not speak of this.",
        "Imagine owning the Olympic Stadium. Now go buy everything around it.",
        "The tonttu invade every winter. Charge them rent and call it seasonal.",
        "I respect anyone who upgrades to max level. It's basically performance art.",
        "Kaivopuisto in summer is delightful. In winter it's a philosophical experience.",
        "There's no bad property, only bad prices. And you're the one setting the strategy.",
        "If Risto is buying offices, he knows something. Or thinks he does.",
        "I've advised kings, captains of industry, and now you. The bar is variable.",
        "The first year is always the hardest. The second year, you own the first year.",
        "Loyal tenants are built through consistent maintenance. Don't ghost them.",
        "Nalle once outbid me at auction. I let him think it was on purpose.",
        "When in doubt, buy near the market square. That's where everything begins.",
        // --- Batch 3: tips ---
        "Properties near parks hold their value through bad markets.",
        "A slow start with good properties beats a fast start with bad ones.",
        "The repair cost is always less than the lost revenue. Do the math.",
        "Bidding wars are chaotic, but the property always goes to someone. Make it you.",
        "Don't ignore the turn log. It's a full audit trail of your instincts.",
        "Max-upgraded hotels in summer are basically printing machines.",
        "The 'Can Afford' filter is for disciplined investors. Use it.",
        "Every district has a ceiling. Knowing it is worth more than a staff member.",
        "The accountant saves you more the larger your loan. Scale matters.",
        "A Property Manager frees an extra action every turn. Permanently.",
        "Rivals can steal properties you're sitting on. Don't sit too long.",
        "If you see a bidding war coming, save some cash before end of turn.",
        "Office buildings in Ruoholahti are Risto's hunting ground. Be faster.",
        "January newspaper tells you how bad last year was. Or how good. Usually bad.",
        "Katajanokka waterfront is some of the best real estate in the city.",
        "The first property you buy sets the tone for your whole campaign.",
        "Seasonal bonuses can flip a marginal property into a strong one.",
        "Buy before a district fills up. Rivals crowd out late arrivals.",
        "End turns with zero actions wasted. Every action is a compounding decision.",
        "The bank will lend you 2x your net worth. Terrifying and useful.",
        // --- Batch 3: funny ---
        "They told me real estate in Hernesaari was risky. They are now renting from me.",
        "I once advised a man who never read the newspaper. He retired on a park bench.",
        "The seagulls here have seen empires rise and fall. Mostly rise, if I'm advising.",
        "Saunas are the one thing Helsinki will never stop building. Invest nearby.",
        "Peter once pitched me on a Helsinki-Tallinn tunnel. I asked about the rent rolls.",
        "You can't take it with you. But you can leave it fully upgraded.",
        "The aurora borealis inspires poets. It inspires me to think about property values.",
        "Somewhere in Helsinki right now, someone is signing a lease. Make it your lease.",
        "My monocle is prescription. My investment advice is free. Both are precise.",
        "I have a cane I never need but carry anyway. The market understands symbolism.",
        "Oodi Library is a masterpiece. The properties around it are also quite nice.",
        "Sometimes the market whispers. Sometimes it shouts. I have excellent hearing.",
        "Nalle disagrees with my strategy. Nalle is also very rich. We manage.",
        "If a rival quip is aggressive, it usually means they're nervous.",
        "Owning property in every district feels like being mayor, but profitable.",
        "The Christmas tree on Senate Square is lovely. The ground rent, lovelier.",
        "They renovated the market hall. Someone always profits from renovation.",
        "I was born in a waistcoat. Metaphorically. The mustache is real.",
        "The ferry to Suomenlinna runs on schedule. Your revenue should too.",
        "Every time you end a turn, somewhere in Helsinki a rent cheque clears.",
        "Some investors wait for the perfect moment. The perfect moment was last turn.",
        "I once missed an auction by one turn. I still wake up in a cold sweat.",
        "A loan at 5% against a 15% ROI property is just arithmetic. Beautiful arithmetic.",
        "Töölönlahti freezes in winter. Your ambition shouldn't.",
        "The view from the top of your portfolio is worth every negotiation.",
        "Hjallis once sang karaoke at a property closing. The deal still closed.",
        "I carry a briefcase at all times. It contains nothing. The confidence is free.",
    ];

    const ADVISOR_CONTEXT_QUOTES = {
        lowCash: [
            "Your wallet is looking thin. Maybe visit the bank?",
            "I can see the bottom of your piggy bank from here.",
            "A loan might be wise right now. Just saying.",
            "This is what we in the business call 'financially tight.'",
            "Even the ducks in Töölönlahti have more savings right now.",
            "Consider selling a property. Cash flow is king.",
        ],
        richCash: [
            "Look at all that cash! Time to go shopping.",
            "Money in the bank earns nothing. Buy property!",
            "You could buy a small island with that. Oh wait, Kulosaari is available.",
            "That's a lot of euros sitting idle. Make them work!",
            "Cash is nice, but properties are nicer. Go spend it!",
            "I can smell the money from here. Invest it before I do.",
        ],
        noProperties: [
            "Click a building on the map to start your empire!",
            "Every tycoon starts somewhere. Pick your first property!",
            "The map is full of opportunities. Just click one!",
            "Your portfolio is emptier than Kamppi Chapel. Fix that.",
        ],
        manyProperties: [
            "What an empire! Your rivals must be jealous.",
            "You own half of Helsinki. Why stop there?",
            "At this rate, they'll rename the city after you.",
            "Impressive portfolio! Don't forget to maintain it all.",
        ],
        badCondition: [
            "Your properties are falling apart! Repair them!",
            "I can hear the pipes groaning from here. Fix things!",
            "Those buildings won't repair themselves. Well, maybe in the future.",
            "Neglected properties lose revenue fast. Act now!",
        ],
        winning: [
            "You're almost at the finish line! Keep pushing!",
            "The crown of Helsinki is within reach!",
            "So close! Don't take your foot off the gas!",
            "Victory is near. I can taste it. Tastes like salmiakki.",
        ],
    };

    const ADVISOR_ACTION_QUOTES = {
        buy: [
            "That's what I like to see!",
            "Excellent purchase!",
            "Smart move. I'd have bought that myself.",
            "Welcome to the portfolio!",
            "One more step toward world domination.",
            "The previous owner is crying right now.",
            "Location, location, location!",
            "Another jewel in the crown!",
            "Bold move. I respect that.",
            "The empire grows!",
            "You've got an eye for property. I approve.",
            "That one's going to pay for itself. Trust me.",
            "If I had a euro for every good purchase you've made...",
            "Splendid acquisition!",
        ],
        sell: [
            "Profit is profit!",
            "Sometimes you have to let go.",
            "Cash in hand is never a bad thing.",
            "I hope you won't regret that one.",
            "Goodbye, old friend.",
            "A true tycoon knows when to sell.",
            "Sell high, buy low. Classic.",
            "That cash will look nice in your account.",
            "Strategic divestment. Very sophisticated.",
            "One less property to maintain!",
            "The market thanks you for your liquidity.",
            "Sometimes the best investment is uninvesting.",
        ],
        upgrade: [
            "Bigger is better!",
            "Now THAT'S an investment.",
            "Watch that revenue climb!",
            "The tenants will love it.",
            "Shiny and new. Well, shinier.",
            "Level up! ...Sorry, wrong game.",
            "Every upgrade pays for itself eventually.",
            "Now that's what I call value-add!",
            "The building practically glows with potential.",
            "Revenue goes up, problems go down. Mostly.",
            "Your tenants just got happier. And richer for you.",
            "Another star on the building. Keep going!",
        ],
        repair: [
            "Good as new!",
            "The pipes thank you.",
            "Maintenance is not glamorous, but it pays.",
            "A stitch in time saves nine.",
            "Your tenants can sleep in peace now.",
            "No more leaky roofs!",
            "Prevention is cheaper than disaster. Well done.",
            "The building sighs with relief.",
            "That's what responsible ownership looks like.",
            "Patched up and ready to earn!",
            "Your maintenance person would be proud.",
            "Crisis averted. Back to making money.",
        ],
        finnish_silence: [
            "Ah. Silence. This is fine.",
            "Nothing to report. Remarkable.",
            "The city breathes. No one speaks.",
            "Even the trams are quiet. Cherish this.",
            "Silence. The most Finnish thing that can happen.",
            "Not every moment needs a comment. Even mine.",
            "Helsinki rests. The property market does not.",
            "Peace. For now.",
            "This is what Finns call a good day.",
            "Complete silence. I have never felt more at home.",
        ],
    };

    let advisorQuote = ADVISOR_TIPS[0];
    let advisorLastTurn = -1;
    let advisorActionOverride = null;

    // Advisor hide/show state
    let advisorHidden = localStorage.getItem('ht_advisorHidden') === 'true';
    let advisorSlideOffset = advisorHidden ? 1 : 0; // 0 = fully visible, 1 = fully off-screen
    let advisorDepartureQuote = null;
    let advisorDepartureTimer = 0;

    const ADVISOR_DEPARTURE_QUOTES = [
        "Good luck beating the game without my advice!",
        "Fine! I'll just count my money in silence...",
        "You'll regret this when the market crashes!",
        "I see how it is. Even my monocle is offended.",
        "Off I go! Don't come crying when rents drop!",
        "Dismissed?! I've advised KINGS of real estate!",
        "My mustache and I will not forget this insult.",
        "Very well. I'll be polishing my top hat if you need me.",
        "Hiding ME? The audacity! The AUDACITY!",
        "I'm not mad, I'm just... deeply, profoundly disappointed.",
    ];

    const ADVISOR_RETURN_QUOTES = [
        "I knew you still needed my help!",
        "Ah, back to your senses I see!",
        "Did you miss the monocle? Everyone misses the monocle.",
        "The market waited for no one while I was gone!",
        "Finally! Do you know how BORING it is off-screen?",
        "I forgive you. This time.",
        "Smart move. Properties don't buy themselves!",
        "The tycoon is BACK, baby!",
        "Miss me? Of course you did. Everyone does.",
        "Let's pretend that never happened, shall we?",
    ];

    function triggerAdvisorAction(action) {
        // ~50% chance to comment on an action
        if (Math.random() > 0.5) return;
        const quotes = ADVISOR_ACTION_QUOTES[action];
        if (!quotes) return;
        advisorActionOverride = quotes[Math.floor(Math.random() * quotes.length)];
    }

    function setAdvisorQuote(text) {
        advisorActionOverride = text;
    }

    function updateAdvisorQuote() {
        // Action override takes priority (shown until next turn change)
        if (advisorActionOverride) {
            advisorQuote = advisorActionOverride;
            advisorActionOverride = null;
            return;
        }

        const turn = GameState.turn;
        if (turn === advisorLastTurn) return;
        advisorLastTurn = turn;

        // Every 3 turns, maybe give a contextual quote
        if (turn % 3 === 0) {
            const contextual = getContextualQuote();
            if (contextual) { advisorQuote = contextual; return; }
        }

        // Otherwise random tip
        advisorQuote = ADVISOR_TIPS[Math.floor(Math.random() * ADVISOR_TIPS.length)];
    }

    function getContextualQuote() {
        const playerProps = GameState.properties.filter(p => p.owner === 'player');
        const netWorth = Economy.calculateNetWorth(GameState);
        const pool = [];

        if (playerProps.length === 0) {
            pool.push(...ADVISOR_CONTEXT_QUOTES.noProperties);
        }
        if (playerProps.length >= 15) {
            pool.push(...ADVISOR_CONTEXT_QUOTES.manyProperties);
        }
        if (GameState.money < 50000 && playerProps.length > 0) {
            pool.push(...ADVISOR_CONTEXT_QUOTES.lowCash);
        }
        if (GameState.money > 5000000) {
            pool.push(...ADVISOR_CONTEXT_QUOTES.richCash);
        }
        if (playerProps.length > 0) {
            const avgCond = playerProps.reduce((s, p) => s + p.condition, 0) / playerProps.length;
            if (avgCond < 40) pool.push(...ADVISOR_CONTEXT_QUOTES.badCondition);
        }
        if (GameState.mode === 'campaign' && netWorth >= GameState.winTarget * 0.8) {
            pool.push(...ADVISOR_CONTEXT_QUOTES.winning);
        }

        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function hideAdvisor() {
        advisorHidden = true;
        localStorage.setItem('ht_advisorHidden', 'true');
        advisorDepartureQuote = ADVISOR_DEPARTURE_QUOTES[Math.floor(Math.random() * ADVISOR_DEPARTURE_QUOTES.length)];
        advisorDepartureTimer = 2500; // show quote for 2.5 seconds before sliding
    }

    function showAdvisor() {
        advisorHidden = false;
        localStorage.setItem('ht_advisorHidden', 'false');
        advisorDepartureQuote = ADVISOR_RETURN_QUOTES[Math.floor(Math.random() * ADVISOR_RETURN_QUOTES.length)];
        advisorDepartureTimer = 2500;
    }

    // Cached advisor button bounds for click detection
    let advisorHideBtnBounds = null;
    let advisorShowBtnBounds = null;

    function drawAdvisor(palette) {
        updateAdvisorQuote();

        const uiScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-scale')) || 1;
        const boxW = Math.floor(238 * uiScale);
        const boxH = Math.floor(212 * uiScale);
        const btnH = Math.floor(20 * uiScale);
        const btnFontSize = Math.max(7, Math.floor(7 * uiScale));

        // Animate slide offset — force visible during autopilot
        const isAutopilotForSlide = typeof Game !== 'undefined' && Game.isAutopilot && Game.isAutopilot();
        const slideTarget = (advisorHidden && !isAutopilotForSlide && advisorDepartureTimer <= 0) ? 1 : 0;
        const slideSpeed = 0.04;
        if (advisorSlideOffset < slideTarget) {
            advisorSlideOffset = Math.min(slideTarget, advisorSlideOffset + slideSpeed);
        } else if (advisorSlideOffset > slideTarget) {
            advisorSlideOffset = Math.max(slideTarget, advisorSlideOffset - slideSpeed);
        }

        // When fully hidden, draw "Show" button in bottom-right corner
        if (advisorSlideOffset >= 1) {
            const showBtnW = Math.floor(50 * uiScale);
            const showBtnH = btnH;
            const showBtnX = cssWidth - showBtnW - 8;
            const showBtnY = cssHeight - showBtnH - 8;
            advisorShowBtnBounds = { x: showBtnX, y: showBtnY, w: showBtnW, h: showBtnH };
            advisorHideBtnBounds = null;

            ctx.fillStyle = 'rgba(10, 10, 26, 0.88)';
            ctx.fillRect(showBtnX, showBtnY, showBtnW, showBtnH);
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 1;
            ctx.strokeRect(showBtnX, showBtnY, showBtnW, showBtnH);
            ctx.font = `${btnFontSize}px "Press Start 2P", monospace`;
            ctx.fillStyle = '#ffcc00';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Show', showBtnX + showBtnW / 2, showBtnY + showBtnH / 2);
            return;
        }

        advisorShowBtnBounds = null;

        // Slide the advisor box off to the right
        const slidePixels = Math.floor(advisorSlideOffset * (boxW + 16));
        const boxX = cssWidth - boxW - 8 + slidePixels;
        const boxY = cssHeight - boxH - btnH - 10;  // bottom-right always
        const p = 1.875 * uiScale;

        // "Hide" button at the bottom-left corner of the advisor box
        const hideBtnW = Math.floor(50 * uiScale);
        const hideBtnX = boxX;
        const hideBtnY = boxY + boxH + 2;
        advisorHideBtnBounds = { x: hideBtnX, y: hideBtnY, w: hideBtnW, h: btnH };

        ctx.fillStyle = 'rgba(10, 10, 26, 0.88)';
        ctx.fillRect(hideBtnX, hideBtnY, hideBtnW, btnH);
        ctx.strokeStyle = '#3a3a5c';
        ctx.lineWidth = 1;
        ctx.strokeRect(hideBtnX, hideBtnY, hideBtnW, btnH);
        ctx.font = `${btnFontSize}px "Press Start 2P", monospace`;
        ctx.fillStyle = '#aaaacc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hide', hideBtnX + hideBtnW / 2, hideBtnY + btnH / 2);

        // Panel background
        ctx.fillStyle = 'rgba(10, 10, 26, 0.88)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#3a3a5c';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Draw the tycoon sprite (bottom-center of left portion)
        const spriteX = boxX + Math.floor(48 * uiScale);
        const spriteY = boxY + boxH - Math.floor(12 * uiScale);
        drawTycoonSprite(spriteX, spriteY, p, palette);

        // Determine what text to show
        let displayQuote = advisorQuote;
        if (advisorDepartureQuote && advisorDepartureTimer > 0) {
            displayQuote = advisorDepartureQuote;
        }

        // Speech bubble (right side)
        const bubbleX = boxX + Math.floor(92 * uiScale);
        const bubbleY = boxY + Math.floor(8 * uiScale);
        const bubbleW = boxW - Math.floor(100 * uiScale);
        const bubbleH = boxH - Math.floor(18 * uiScale);

        ctx.fillStyle = 'rgba(30, 30, 55, 0.95)';
        ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1;
        ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

        // Bubble tail (small triangle pointing left toward the character)
        ctx.fillStyle = 'rgba(30, 30, 55, 0.95)';
        ctx.beginPath();
        ctx.moveTo(bubbleX, bubbleY + bubbleH * 0.45);
        ctx.lineTo(bubbleX - Math.floor(7 * uiScale), bubbleY + bubbleH * 0.5);
        ctx.lineTo(bubbleX, bubbleY + bubbleH * 0.55);
        ctx.fill();
        ctx.strokeStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(bubbleX, bubbleY + bubbleH * 0.45);
        ctx.lineTo(bubbleX - Math.floor(7 * uiScale), bubbleY + bubbleH * 0.5);
        ctx.lineTo(bubbleX, bubbleY + bubbleH * 0.55);
        ctx.stroke();

        // Word-wrap the quote text
        const fontSize = Math.max(8, Math.floor(8 * uiScale));
        ctx.font = `${fontSize}px "Press Start 2P", monospace`;
        ctx.fillStyle = '#e0e0ff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const words = displayQuote.split(' ');
        const maxLineW = bubbleW - Math.floor(8 * uiScale);
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxLineW && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);

        const lineH = Math.floor(12 * uiScale);
        const pad = Math.floor(5 * uiScale);
        const textStartY = bubbleY + Math.max(pad, (bubbleH - lines.length * lineH) / 2);
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], bubbleX + pad, textStartY + i * lineH);
        }
    }

    function drawTycoonSprite(x, y, p, palette) {
        // Monopoly-Man-style tycoon, drawn from bottom-center
        // x,y = bottom center of sprite

        // Top hat
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x - 7*p, y - 36*p, 14*p, 3*p);   // hat brim
        ctx.fillRect(x - 5*p, y - 48*p, 10*p, 12*p);   // hat crown
        // Hat band
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(x - 5*p, y - 38*p, 10*p, 2*p);

        // Face
        ctx.fillStyle = '#e8c090';
        ctx.fillRect(x - 5*p, y - 33*p, 10*p, 10*p);

        // Eyes
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x - 3*p, y - 30*p, 2*p, 2*p);    // left eye
        ctx.fillRect(x + 1*p, y - 30*p, 2*p, 2*p);     // right eye

        // Monocle (right eye)
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 2*p, y - 29*p, 3*p, 0, Math.PI * 2);
        ctx.stroke();
        // Monocle chain
        ctx.beginPath();
        ctx.moveTo(x + 5*p, y - 28*p);
        ctx.lineTo(x + 7*p, y - 22*p);
        ctx.stroke();

        // Mustache
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x - 4*p, y - 26*p, 3*p, 2*p);
        ctx.fillRect(x + 1*p, y - 26*p, 3*p, 2*p);
        // Curled ends
        ctx.fillRect(x - 5*p, y - 27*p, 1*p, 2*p);
        ctx.fillRect(x + 4*p, y - 27*p, 1*p, 2*p);

        // Smile
        ctx.fillStyle = '#c06060';
        ctx.fillRect(x - 2*p, y - 24*p, 4*p, 1*p);

        // Suit body
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x - 6*p, y - 23*p, 12*p, 14*p);

        // Suit lapels
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(x - 1*p, y - 23*p);
        ctx.lineTo(x - 4*p, y - 15*p);
        ctx.lineTo(x - 1*p, y - 15*p);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 1*p, y - 23*p);
        ctx.lineTo(x + 4*p, y - 15*p);
        ctx.lineTo(x + 1*p, y - 15*p);
        ctx.fill();

        // Tie
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(x - 1*p, y - 22*p, 2*p, 10*p);
        // Tie knot
        ctx.fillRect(x - 2*p, y - 22*p, 4*p, 2*p);

        // Shirt collar
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 3*p, y - 23*p, 2*p, 2*p);
        ctx.fillRect(x + 1*p, y - 23*p, 2*p, 2*p);

        // Arms
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x - 8*p, y - 21*p, 2*p, 10*p);   // left arm
        ctx.fillRect(x + 6*p, y - 21*p, 2*p, 10*p);    // right arm

        // Hands
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 8*p, y - 11*p, 2*p, 2*p);
        ctx.fillRect(x + 6*p, y - 11*p, 2*p, 2*p);

        // Legs
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x - 4*p, y - 9*p, 3*p, 8*p);     // left leg
        ctx.fillRect(x + 1*p, y - 9*p, 3*p, 8*p);      // right leg

        // Shoes
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(x - 5*p, y - 1*p, 4*p, 2*p);
        ctx.fillRect(x + 1*p, y - 1*p, 4*p, 2*p);
    }

    // === Helpers ===

    function fillPolygon(polygon) {
        if (!polygon || polygon.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(polygon[0][0], polygon[0][1]);
        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i][0], polygon[i][1]);
        }
        ctx.closePath();
        ctx.fill();
    }

    function strokePolygon(polygon) {
        if (!polygon || polygon.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(polygon[0][0], polygon[0][1]);
        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i][0], polygon[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
    }

    function drawFilledPolygon(polygon, fillColor, strokeColor, lineWidth) {
        ctx.fillStyle = fillColor;
        fillPolygon(polygon);
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth || 1;
            strokePolygon(polygon);
        }
    }

    // === RIVAL PORTRAIT DRAWING ===
    // Each portrait is drawn on a small canvas for the offer dialog

    function drawRivalPortrait(canvasEl, rivalId) {
        const c = canvasEl.getContext('2d');
        const w = canvasEl.width;
        const h = canvasEl.height;
        c.clearRect(0, 0, w, h);
        c.imageSmoothingEnabled = false;

        // Scale so our 48x48 pixel art fills the canvas
        const s = w / 48;
        c.save();
        c.scale(s, s);

        if (rivalId === 'nalle') drawBjornPortrait(c);
        else if (rivalId === 'hjallis') drawHjallisPortrait(c);
        else if (rivalId === 'risto') drawRistoPortrait(c);
        else if (rivalId === 'peter') drawPeterPortrait(c);

        c.restore();
    }

    function drawBjornPortrait(c) {
        // Background
        c.fillStyle = '#1a1a2e';
        c.fillRect(0, 0, 48, 48);

        // Navy suit jacket
        c.fillStyle = '#1a1a44';
        c.fillRect(10, 32, 28, 16);
        // Lapels
        c.fillStyle = '#222255';
        c.fillRect(14, 32, 4, 10);
        c.fillRect(30, 32, 4, 10);
        // White shirt collar
        c.fillStyle = '#e8e8f0';
        c.fillRect(19, 30, 10, 4);
        // Blue tie
        c.fillStyle = '#1a3a7a';
        c.fillRect(23, 33, 3, 8);
        // Gold tie dots
        c.fillStyle = '#ccaa44';
        c.fillRect(24, 34, 1, 1);
        c.fillRect(24, 36, 1, 1);
        c.fillRect(24, 38, 1, 1);
        // Pocket square
        c.fillStyle = '#ffffff';
        c.fillRect(12, 34, 3, 2);

        // Neck
        c.fillStyle = '#d8b090';
        c.fillRect(20, 28, 8, 5);

        // Face (head shape)
        c.fillStyle = '#d8b090';
        c.fillRect(15, 10, 18, 20);
        // Chin
        c.fillRect(17, 28, 14, 2);

        // Silver/white hair - swept back, full
        c.fillStyle = '#c8c8cc';
        c.fillRect(14, 6, 20, 6);
        c.fillRect(13, 8, 3, 10);
        c.fillRect(33, 8, 2, 8);
        // Hair top highlight
        c.fillStyle = '#d8d8dd';
        c.fillRect(16, 6, 14, 2);

        // Ears
        c.fillStyle = '#d0a888';
        c.fillRect(13, 16, 2, 5);
        c.fillRect(33, 16, 2, 5);

        // Eyes
        c.fillStyle = '#ffffff';
        c.fillRect(18, 17, 4, 3);
        c.fillRect(26, 17, 4, 3);
        c.fillStyle = '#446688';
        c.fillRect(20, 17, 2, 3);
        c.fillRect(28, 17, 2, 3);
        c.fillStyle = '#1a1a22';
        c.fillRect(20, 18, 1, 2);
        c.fillRect(28, 18, 1, 2);

        // Glasses - round wire frames
        c.strokeStyle = '#887766';
        c.lineWidth = 0.8;
        // Left lens
        c.strokeRect(17, 16, 6, 5);
        // Right lens
        c.strokeRect(25, 16, 6, 5);
        // Bridge
        c.beginPath();
        c.moveTo(23, 18);
        c.lineTo(25, 18);
        c.stroke();
        // Temple arms
        c.beginPath();
        c.moveTo(17, 17);
        c.lineTo(14, 17);
        c.stroke();
        c.beginPath();
        c.moveTo(31, 17);
        c.lineTo(34, 17);
        c.stroke();

        // Eyebrows
        c.fillStyle = '#aaaaaa';
        c.fillRect(18, 15, 5, 1);
        c.fillRect(26, 15, 5, 1);

        // Nose
        c.fillStyle = '#c8a080';
        c.fillRect(23, 20, 3, 4);
        c.fillRect(22, 23, 1, 1);

        // Slight smile / mouth
        c.fillStyle = '#b07060';
        c.fillRect(21, 25, 6, 1);
        c.fillStyle = '#c08070';
        c.fillRect(22, 26, 4, 1);

        // Subtle mustache
        c.fillStyle = '#aaaaaa';
        c.fillRect(21, 24, 6, 1);
    }

    function drawHjallisPortrait(c) {
        // Background
        c.fillStyle = '#1a1a2e';
        c.fillRect(0, 0, 48, 48);

        // Dark jacket (open collar, casual)
        c.fillStyle = '#222233';
        c.fillRect(10, 33, 28, 15);
        // Jacket lapels / collar (open)
        c.fillStyle = '#2a2a3a';
        c.fillRect(13, 33, 5, 8);
        c.fillRect(30, 33, 5, 8);
        // Light blue shirt (open collar, no tie)
        c.fillStyle = '#8899bb';
        c.fillRect(18, 31, 12, 8);
        // Shirt collar points
        c.fillStyle = '#99aacc';
        c.fillRect(17, 31, 3, 3);
        c.fillRect(28, 31, 3, 3);

        // Neck (slightly thicker)
        c.fillStyle = '#d0a888';
        c.fillRect(19, 28, 10, 5);

        // Face (broader, rounder)
        c.fillStyle = '#d0a888';
        c.fillRect(14, 10, 20, 20);
        // Wider jaw
        c.fillRect(15, 28, 18, 3);
        // Round cheeks
        c.fillStyle = '#d8b090';
        c.fillRect(14, 18, 2, 6);
        c.fillRect(32, 18, 2, 6);

        // Reddish-brown hair - shorter, natural
        c.fillStyle = '#884422';
        c.fillRect(14, 6, 20, 6);
        c.fillRect(13, 8, 2, 6);
        c.fillRect(33, 8, 2, 5);
        // Hair highlight
        c.fillStyle = '#995533';
        c.fillRect(16, 6, 10, 2);

        // Ears
        c.fillStyle = '#c8a080';
        c.fillRect(12, 16, 2, 5);
        c.fillRect(34, 16, 2, 5);

        // Eyes (warm, friendly)
        c.fillStyle = '#ffffff';
        c.fillRect(18, 17, 4, 3);
        c.fillRect(26, 17, 4, 3);
        c.fillStyle = '#556644';
        c.fillRect(20, 17, 2, 3);
        c.fillRect(28, 17, 2, 3);
        c.fillStyle = '#1a1a22';
        c.fillRect(20, 18, 1, 2);
        c.fillRect(28, 18, 1, 2);

        // Eyebrows (slightly raised - friendly)
        c.fillStyle = '#774422';
        c.fillRect(18, 14, 5, 1);
        c.fillRect(26, 14, 5, 1);

        // Nose
        c.fillStyle = '#c09878';
        c.fillRect(23, 20, 3, 4);

        // Broad smile (signature Hjallis grin)
        c.fillStyle = '#b06050';
        c.fillRect(19, 25, 10, 1);
        c.fillStyle = '#ffffff';
        c.fillRect(20, 25, 8, 1); // teeth showing
        c.fillStyle = '#c07060';
        c.fillRect(20, 26, 8, 1); // lower lip

        // Smile lines
        c.fillStyle = '#c09878';
        c.fillRect(18, 24, 1, 3);
        c.fillRect(29, 24, 1, 3);
    }

    function drawRistoPortrait(c) {
        // Background
        c.fillStyle = '#1a1a2e';
        c.fillRect(0, 0, 48, 48);

        // Dark navy blazer (smart casual)
        c.fillStyle = '#1a2244';
        c.fillRect(10, 33, 28, 15);
        // Blazer lapels
        c.fillStyle = '#222a55';
        c.fillRect(14, 33, 4, 8);
        c.fillRect(30, 33, 4, 8);
        // Light blue shirt (no tie, modern)
        c.fillStyle = '#aabbdd';
        c.fillRect(18, 31, 12, 8);
        // Collar
        c.fillStyle = '#bbccee';
        c.fillRect(17, 31, 3, 2);
        c.fillRect(28, 31, 3, 2);

        // Neck
        c.fillStyle = '#d0a080';
        c.fillRect(20, 28, 8, 5);

        // Face (lean, angular)
        c.fillStyle = '#d0a080';
        c.fillRect(15, 10, 18, 20);
        // Angular jaw
        c.fillRect(17, 28, 14, 2);

        // Light brown hair — neat, modern cut
        c.fillStyle = '#886644';
        c.fillRect(15, 5, 18, 7);
        c.fillRect(14, 7, 2, 6);
        c.fillRect(33, 7, 2, 5);
        // Hair highlight / parting
        c.fillStyle = '#997755';
        c.fillRect(18, 5, 8, 2);
        c.fillRect(16, 6, 4, 1);

        // Ears
        c.fillStyle = '#c89878';
        c.fillRect(13, 16, 2, 5);
        c.fillRect(33, 16, 2, 5);

        // Eyes (bright blue)
        c.fillStyle = '#ffffff';
        c.fillRect(18, 17, 4, 3);
        c.fillRect(26, 17, 4, 3);
        c.fillStyle = '#3366aa';
        c.fillRect(20, 17, 2, 3);
        c.fillRect(28, 17, 2, 3);
        c.fillStyle = '#1a1a22';
        c.fillRect(20, 18, 1, 2);
        c.fillRect(28, 18, 1, 2);

        // Eyebrows (neat)
        c.fillStyle = '#775533';
        c.fillRect(18, 15, 5, 1);
        c.fillRect(26, 15, 5, 1);

        // Nose
        c.fillStyle = '#c09070';
        c.fillRect(23, 20, 3, 4);

        // Slight confident smile
        c.fillStyle = '#b06050';
        c.fillRect(21, 25, 6, 1);
        c.fillStyle = '#c07060';
        c.fillRect(22, 26, 4, 1);
    }

    function drawPeterPortrait(c) {
        // Background — dark red-maroon
        c.fillStyle = '#1a0505';
        c.fillRect(0, 0, 48, 48);

        // === RED HOODIE (most distinctive feature) ===
        // Main hoodie body
        c.fillStyle = '#cc2200';
        c.fillRect(7, 30, 34, 18);
        // Hoodie collar/hood rim — slightly darker
        c.fillStyle = '#aa1800';
        c.fillRect(10, 27, 28, 7);
        // Kangaroo pocket
        c.fillStyle = '#bb1f00';
        c.fillRect(14, 37, 20, 7);
        c.fillStyle = '#aa1b00';
        c.fillRect(14, 37, 20, 1);
        // Zipper track down center
        c.fillStyle = '#999999';
        c.fillRect(23, 28, 2, 20);
        // Zipper pull
        c.fillStyle = '#bbbbbb';
        c.fillRect(22, 32, 4, 2);
        // Dark drawstrings (hood strings)
        c.fillStyle = '#666666';
        c.fillRect(19, 28, 1, 12);
        c.fillRect(28, 28, 1, 12);
        // Drawstring ends
        c.fillStyle = '#555555';
        c.fillRect(18, 40, 3, 2);
        c.fillRect(27, 40, 3, 2);
        // Hoodie shoulder shading
        c.fillStyle = '#bb1e00';
        c.fillRect(7, 30, 6, 8);
        c.fillRect(35, 30, 6, 8);

        // Neck
        c.fillStyle = '#d8b090';
        c.fillRect(20, 25, 8, 6);

        // === FACE ===
        c.fillStyle = '#d8b090';
        c.fillRect(14, 8, 20, 19);
        // Chin
        c.fillRect(16, 25, 16, 3);
        // Round cheeks
        c.fillStyle = '#d0a888';
        c.fillRect(13, 17, 2, 7);
        c.fillRect(33, 17, 2, 7);

        // === HAIR — short, dark, slightly receding ===
        c.fillStyle = '#2a2020';
        c.fillRect(15, 5, 18, 5);
        // Receding temples (skin shows through slightly)
        c.fillStyle = '#3a2828';
        c.fillRect(15, 6, 2, 4);
        c.fillRect(31, 6, 2, 4);
        // Top of head / crown
        c.fillStyle = '#221818';
        c.fillRect(18, 3, 12, 5);
        // Hair highlight
        c.fillStyle = '#332222';
        c.fillRect(20, 3, 6, 2);

        // Ears
        c.fillStyle = '#c8a080';
        c.fillRect(12, 15, 2, 5);
        c.fillRect(34, 15, 2, 5);

        // === EYES — blue-grey, friendly ===
        c.fillStyle = '#ffffff';
        c.fillRect(17, 15, 5, 3);
        c.fillRect(26, 15, 5, 3);
        c.fillStyle = '#5588aa';
        c.fillRect(19, 15, 3, 3);
        c.fillRect(28, 15, 3, 3);
        c.fillStyle = '#1a1a22';
        c.fillRect(20, 16, 1, 2);
        c.fillRect(29, 16, 1, 2);
        // Eye highlight
        c.fillStyle = '#aaccdd';
        c.fillRect(19, 15, 1, 1);
        c.fillRect(28, 15, 1, 1);

        // Eyebrows — dark, slightly arched (friendly)
        c.fillStyle = '#2a1818';
        c.fillRect(17, 13, 6, 1);
        c.fillRect(26, 13, 6, 1);
        // Arch
        c.fillRect(21, 12, 2, 1);
        c.fillRect(30, 12, 2, 1);

        // Nose
        c.fillStyle = '#c8a080';
        c.fillRect(22, 19, 4, 5);
        c.fillStyle = '#b89068';
        c.fillRect(21, 23, 2, 1);
        c.fillRect(25, 23, 2, 1);

        // === SHORT STUBBLE — subtle shadow ===
        c.fillStyle = 'rgba(40, 15, 10, 0.25)';
        c.fillRect(15, 22, 18, 5);
        c.fillStyle = 'rgba(40, 15, 10, 0.15)';
        c.fillRect(14, 20, 20, 3);

        // === SMILE — friendly, confident ===
        c.fillStyle = '#c07060';
        c.fillRect(19, 24, 10, 1);
        c.fillStyle = '#ffffff';
        c.fillRect(20, 24, 8, 1);
        c.fillStyle = '#b06050';
        c.fillRect(19, 25, 10, 1);
        c.fillStyle = '#c08070';
        c.fillRect(20, 26, 8, 1);
        // Smile lines
        c.fillStyle = '#c09878';
        c.fillRect(18, 23, 1, 4);
        c.fillRect(29, 23, 1, 4);
    }

    // === PLAYER PORTRAITS ===

    function drawAdvisorPortraitOnCanvas(canvasEl) {
        const c = canvasEl.getContext('2d');
        const w = canvasEl.width;
        const h = canvasEl.height;
        c.clearRect(0, 0, w, h);
        c.imageSmoothingEnabled = false;
        const s = w / 48;
        c.save();
        c.scale(s, s);
        drawAdvisorPortrait(c);
        c.restore();
    }

    function drawAdvisorPortrait(c) {
        // Background — dark navy
        c.fillStyle = '#0a0a1a';
        c.fillRect(0, 0, 48, 48);

        // Top hat
        c.fillStyle = '#1a1a2e';
        c.fillRect(11, 1, 26, 3);  // brim
        c.fillRect(14, -6, 20, 8); // crown (extends slightly above for drama)
        c.fillRect(14, 1, 20, 3);  // crown lower
        // Hat band
        c.fillStyle = '#ffcc00';
        c.fillRect(14, 3, 20, 2);

        // Suit body
        c.fillStyle = '#2a2a4a';
        c.fillRect(10, 35, 28, 13);
        // Lapels
        c.fillStyle = '#1a1a2e';
        c.fillRect(14, 35, 5, 9);
        c.fillRect(29, 35, 5, 9);
        // Red tie
        c.fillStyle = '#ff4444';
        c.fillRect(23, 35, 3, 10);
        c.fillRect(22, 35, 5, 2); // knot
        // White shirt collar
        c.fillStyle = '#ffffff';
        c.fillRect(18, 34, 4, 3);
        c.fillRect(26, 34, 4, 3);

        // Neck
        c.fillStyle = '#e8c090';
        c.fillRect(20, 31, 8, 5);

        // Face
        c.fillStyle = '#e8c090';
        c.fillRect(13, 10, 22, 23);
        // Ears
        c.fillRect(11, 17, 3, 6);
        c.fillRect(34, 17, 3, 6);

        // Eyes
        c.fillStyle = '#1a1a2e';
        c.fillRect(18, 19, 3, 3);  // left eye
        c.fillRect(27, 19, 3, 3);  // right eye
        // Eye whites
        c.fillStyle = '#ffffff';
        c.fillRect(18, 19, 3, 2);
        c.fillRect(27, 19, 3, 2);
        // Pupils
        c.fillStyle = '#1a1a2e';
        c.fillRect(19, 19, 2, 2);
        c.fillRect(28, 19, 2, 2);
        // Eye highlight
        c.fillStyle = '#ffffff';
        c.fillRect(20, 19, 1, 1);
        c.fillRect(29, 19, 1, 1);

        // Monocle on right eye
        c.strokeStyle = '#ffcc00';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(28.5, 20, 4, 0, Math.PI * 2);
        c.stroke();
        // Monocle chain
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(32, 21);
        c.lineTo(35, 28);
        c.lineTo(34, 35);
        c.stroke();

        // Eyebrows — arched, distinguished
        c.fillStyle = '#3a3a3a';
        c.fillRect(17, 17, 5, 1);
        c.fillRect(16, 17, 1, 1);
        c.fillRect(26, 17, 5, 1);
        c.fillRect(31, 17, 1, 1);

        // Nose
        c.fillStyle = '#d0a878';
        c.fillRect(23, 22, 3, 4);
        c.fillRect(22, 25, 1, 1);
        c.fillRect(26, 25, 1, 1);

        // Magnificent mustache
        c.fillStyle = '#3a3a3a';
        c.fillRect(17, 27, 6, 2);  // left side
        c.fillRect(25, 27, 6, 2);  // right side
        c.fillRect(23, 27, 2, 1);  // center
        // Curled ends
        c.fillRect(16, 26, 2, 2);
        c.fillRect(30, 26, 2, 2);
        c.fillRect(15, 27, 1, 1);
        c.fillRect(32, 27, 1, 1);

        // Smile
        c.fillStyle = '#c06060';
        c.fillRect(21, 29, 6, 1);

        // Gold border around portrait
        c.strokeStyle = '#ffcc00';
        c.lineWidth = 2;
        c.strokeRect(1, 1, 46, 46);
    }

    function drawPlayerPortraitOnCanvas(canvasEl, gender) {
        const c = canvasEl.getContext('2d');
        const w = canvasEl.width;
        const h = canvasEl.height;
        c.clearRect(0, 0, w, h);
        c.imageSmoothingEnabled = false;
        const s = w / 48;
        c.save();
        c.scale(s, s);
        if (gender === 'female') drawPlayerFemalePortrait(c);
        else drawPlayerMalePortrait(c);
        c.restore();
    }

    function drawPlayerMalePortrait(c) {
        // Background
        c.fillStyle = '#1a1a2e';
        c.fillRect(0, 0, 48, 48);
        // Green suit jacket
        c.fillStyle = '#224422';
        c.fillRect(10, 33, 28, 15);
        // Lapels
        c.fillStyle = '#2a5a2a';
        c.fillRect(14, 33, 4, 8);
        c.fillRect(30, 33, 4, 8);
        // White shirt
        c.fillStyle = '#aaccaa';
        c.fillRect(18, 31, 12, 8);
        // Green tie
        c.fillStyle = '#338833';
        c.fillRect(23, 33, 3, 8);
        // € tie pin
        c.fillStyle = '#ffdd44';
        c.fillRect(24, 35, 1, 1);
        // Pocket square
        c.fillStyle = '#44ff44';
        c.fillRect(12, 35, 3, 2);
        // Neck
        c.fillStyle = '#d0a888';
        c.fillRect(20, 28, 8, 5);
        // Face
        c.fillStyle = '#d0a888';
        c.fillRect(15, 10, 18, 20);
        c.fillRect(17, 28, 14, 2);
        // Jaw line (slightly wider face)
        c.fillStyle = '#c89878';
        c.fillRect(15, 26, 1, 3);
        c.fillRect(32, 26, 1, 3);
        // Hair (dark brown, short styled)
        c.fillStyle = '#443322';
        c.fillRect(14, 5, 20, 7);
        c.fillRect(13, 7, 2, 8);
        c.fillRect(34, 7, 1, 6);
        // Hair highlight
        c.fillStyle = '#554433';
        c.fillRect(16, 6, 8, 2);
        // Eyebrows
        c.fillStyle = '#443322';
        c.fillRect(18, 15, 4, 1);
        c.fillRect(26, 15, 4, 1);
        // Eyes
        c.fillStyle = '#ffffff';
        c.fillRect(18, 17, 4, 3);
        c.fillRect(26, 17, 4, 3);
        c.fillStyle = '#336633';
        c.fillRect(20, 17, 2, 3);
        c.fillRect(28, 17, 2, 3);
        c.fillStyle = '#1a1a22';
        c.fillRect(20, 18, 1, 2);
        c.fillRect(28, 18, 1, 2);
        // Nose
        c.fillStyle = '#c09878';
        c.fillRect(23, 20, 3, 4);
        // Confident smile
        c.fillStyle = '#b06050';
        c.fillRect(20, 25, 8, 1);
        c.fillRect(21, 26, 6, 1);
        // € symbol on pocket
        c.fillStyle = '#44ff44';
        c.font = '6px monospace';
        c.fillText('€', 12, 41);
    }

    function drawPlayerFemalePortrait(c) {
        // Background
        c.fillStyle = '#1a1a2e';
        c.fillRect(0, 0, 48, 48);
        // Dark green blazer
        c.fillStyle = '#1a3a2a';
        c.fillRect(10, 33, 28, 15);
        // Blazer lapels
        c.fillStyle = '#225533';
        c.fillRect(14, 33, 4, 8);
        c.fillRect(30, 33, 4, 8);
        // Emerald blouse
        c.fillStyle = '#55aa77';
        c.fillRect(17, 31, 14, 8);
        // Necklace (gold)
        c.fillStyle = '#ffcc44';
        c.fillRect(19, 31, 2, 1);
        c.fillRect(21, 32, 1, 1);
        c.fillRect(26, 32, 1, 1);
        c.fillRect(27, 31, 2, 1);
        // Gold pendant
        c.fillStyle = '#ffdd44';
        c.fillRect(23, 33, 2, 2);
        // Neck
        c.fillStyle = '#d8b098';
        c.fillRect(20, 27, 8, 5);
        // Face (slightly softer shape)
        c.fillStyle = '#d8b098';
        c.fillRect(15, 10, 18, 20);
        c.fillRect(17, 28, 14, 2);
        // Softer chin
        c.fillStyle = '#d8b098';
        c.fillRect(16, 27, 16, 2);
        // Hair (auburn, longer with volume)
        c.fillStyle = '#8a3322';
        c.fillRect(13, 4, 22, 8);
        c.fillRect(12, 7, 3, 18);
        c.fillRect(33, 7, 3, 18);
        // Side hair frames face
        c.fillRect(12, 25, 3, 8);
        c.fillRect(33, 25, 3, 8);
        // Hair highlight
        c.fillStyle = '#aa4433';
        c.fillRect(15, 5, 6, 2);
        c.fillRect(26, 5, 6, 2);
        // Top volume
        c.fillStyle = '#8a3322';
        c.fillRect(14, 3, 20, 3);
        // Eyebrows (thinner, arched upward — friendly)
        c.fillStyle = '#7a3322';
        c.fillRect(19, 15, 3, 1);
        c.fillRect(18, 16, 1, 1);
        c.fillRect(28, 15, 3, 1);
        c.fillRect(31, 16, 1, 1);
        // Eyes (slightly larger, with lashes)
        c.fillStyle = '#ffffff';
        c.fillRect(18, 17, 5, 3);
        c.fillRect(26, 17, 5, 3);
        c.fillStyle = '#337744';
        c.fillRect(20, 17, 3, 3);
        c.fillRect(28, 17, 3, 3);
        c.fillStyle = '#1a1a22';
        c.fillRect(21, 18, 1, 2);
        c.fillRect(29, 18, 1, 2);
        // Eye shine
        c.fillStyle = '#ffffff';
        c.fillRect(20, 17, 1, 1);
        c.fillRect(28, 17, 1, 1);
        // Eyelashes (lighter, less heavy)
        c.fillStyle = '#553333';
        c.fillRect(18, 16, 5, 1);
        c.fillRect(26, 16, 5, 1);
        // Nose (smaller)
        c.fillStyle = '#c8a088';
        c.fillRect(23, 20, 2, 3);
        // Warm smile (wider, upturned)
        c.fillStyle = '#cc6666';
        c.fillRect(20, 25, 8, 1);
        c.fillRect(21, 26, 6, 1);
        // Upper lip highlight
        c.fillStyle = '#dd7777';
        c.fillRect(22, 24, 4, 1);
        // Subtle blush
        c.fillStyle = 'rgba(220, 140, 140, 0.15)';
        c.fillRect(16, 22, 4, 3);
        c.fillRect(28, 22, 4, 3);
        // € brooch on blazer
        c.fillStyle = '#44ff44';
        c.font = '6px monospace';
        c.fillText('€', 12, 41);
    }

    // === ANIMATION TICK ===
    // Continuously running animation for seagulls, ferry, weather
    let animTime = 0;
    let animFrameId = null;
    let weatherParticles = [];
    let weatherActive = false;
    let weatherType = null; // 'rain', 'snow', 'sun'
    let weatherTimer = 0;
    const WEATHER_DURATION = 5000; // 5 seconds of weather

    // Seagull drift state — each seagull gets an offset that changes over time
    const seagullStates = waterDecoPositions.seagulls.map((pos, i) => ({
        baseX: pos[0],
        baseY: pos[1],
        phase: i * 1.3,
        radius: 6 + Math.random() * 4,
    }));

    // Suomenlinna ferry animation state
    const ferryAnim = {
        startPos: HelsinkiDistricts.geoToMap([[60.166, 24.956]])[0],  // near market square
        endPos: HelsinkiDistricts.geoToMap([[60.150, 24.977]])[0],    // NW edge of Suomenlinna
        progress: 0, // 0..1..0 (oscillates)
        speed: 0.00002, // very slow drift
        direction: 1,
        dwellTimer: 0, // pause at each end
    };

    function startAnimationLoop() {
        if (animFrameId) return;
        let lastTime = performance.now();
        let lastRenderTime = 0;
        const RENDER_INTERVAL = 80; // ~12 fps for animations (saves CPU)

        function tick(now) {
            const dt = now - lastTime;
            lastTime = now;
            animTime += dt;

            // Update seagull positions
            for (const sg of seagullStates) {
                const t = animTime * 0.001 + sg.phase;
                sg.currentX = sg.baseX + Math.cos(t * 0.5) * sg.radius;
                sg.currentY = sg.baseY + Math.sin(t * 0.7) * sg.radius * 0.6;
            }

            // Update ferry position (with dwell at each end)
            if (ferryAnim.dwellTimer > 0) {
                ferryAnim.dwellTimer -= dt;
            } else {
                ferryAnim.progress += ferryAnim.speed * dt * ferryAnim.direction;
                if (ferryAnim.progress >= 1) {
                    ferryAnim.progress = 1;
                    ferryAnim.direction = -1;
                    ferryAnim.dwellTimer = 6000; // pause 6 seconds at Suomenlinna
                }
                if (ferryAnim.progress <= 0) {
                    ferryAnim.progress = 0;
                    ferryAnim.direction = 1;
                    ferryAnim.dwellTimer = 6000; // pause 6 seconds at Market Square
                }
            }

            // Update advisor departure timer
            if (advisorDepartureTimer > 0) {
                advisorDepartureTimer -= dt;
                if (advisorDepartureTimer <= 0) {
                    advisorDepartureTimer = 0;
                    advisorDepartureQuote = null;
                }
            }

            // Update weather
            let needsRender = false;
            if (weatherActive) {
                weatherTimer -= dt;
                if (weatherTimer <= 0) {
                    weatherActive = false;
                    weatherParticles = [];
                    needsRender = true;
                } else {
                    updateWeatherParticles(dt);
                    needsRender = true;
                }
            }

            // Advisor slide animation needs renders
            const apActive = typeof Game !== 'undefined' && Game.isAutopilot && Game.isAutopilot();
            const slideTarget = (advisorHidden && !apActive && advisorDepartureTimer <= 0) ? 1 : 0;
            if (advisorSlideOffset !== slideTarget || advisorDepartureTimer > 0) needsRender = true;
            if (autopilotBannerTimer > 0) needsRender = true;

            // Re-render at throttled rate (or always during weather/advisor animation)
            if (!transitionFrom && (now - lastRenderTime > RENDER_INTERVAL || needsRender)) {
                lastRenderTime = now;
                render();
            }

            animFrameId = requestAnimationFrame(tick);
        }
        animFrameId = requestAnimationFrame(tick);
    }

    function triggerWeather(season) {
        // 30% chance each season change
        if (Math.random() > 0.3) return;
        if (season === 'winter') weatherType = 'snow';
        else if (season === 'autumn') weatherType = 'rain';
        else if (season === 'summer') weatherType = 'sun';
        else weatherType = 'rain'; // spring rain
        weatherActive = true;
        weatherTimer = WEATHER_DURATION;
        weatherParticles = [];
        // Pre-spawn particles
        for (let i = 0; i < 60; i++) {
            spawnWeatherParticle();
        }
    }

    function spawnWeatherParticle() {
        weatherParticles.push({
            x: Math.random() * (canvas ? cssWidth : 800),
            y: Math.random() * (canvas ? cssHeight : 600) - 50,
            vx: weatherType === 'rain' ? -0.5 : (weatherType === 'snow' ? (Math.random() - 0.5) * 0.3 : 0),
            vy: weatherType === 'rain' ? 3 + Math.random() * 2 : (weatherType === 'snow' ? 0.5 + Math.random() * 0.5 : -0.3),
            size: weatherType === 'snow' ? 1.5 + Math.random() * 2 : (weatherType === 'sun' ? 2 + Math.random() * 3 : 1),
            life: 1,
            alpha: 0.3 + Math.random() * 0.4,
        });
    }

    function updateWeatherParticles(dt) {
        const dts = dt / 16; // normalize to ~60fps
        for (let i = weatherParticles.length - 1; i >= 0; i--) {
            const p = weatherParticles[i];
            p.x += p.vx * dts;
            p.y += p.vy * dts;
            if (weatherType === 'sun') {
                p.life -= 0.003 * dts;
                p.alpha = p.life * 0.5;
            }
            // Remove off-screen or dead
            if (p.y > (canvas ? cssHeight : 600) + 10 || p.x < -10 || p.life <= 0) {
                weatherParticles.splice(i, 1);
                if (weatherActive) spawnWeatherParticle();
            }
        }
    }

    function drawWeatherEffects() {
        if (!weatherActive || weatherParticles.length === 0) return;
        ctx.save();
        // Weather renders in screen space (after ctx.restore in render)
        for (const p of weatherParticles) {
            if (weatherType === 'rain') {
                ctx.strokeStyle = `rgba(180, 200, 255, ${p.alpha * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
                ctx.stroke();
            } else if (weatherType === 'snow') {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (weatherType === 'sun') {
                ctx.fillStyle = `rgba(255, 230, 100, ${p.alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // Override render to use animated positions + weather
    function render() {
        if (!ctx) return;
        const palette = getBlendedPalette();
        const dpr = window.devicePixelRatio || 1;

        // Scale context to match high-DPI buffer
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear with deep water color
        ctx.fillStyle = palette.waterDark;
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(camera.zoom, camera.zoom);

        drawWater(palette);
        drawLand(palette);
        drawInternalWater(palette);

        // Animated Suomenlinna ferry
        drawAnimatedFerry(palette);

        drawWaterDecorations(palette);
        drawParks(palette);
        drawRoads(palette);
        drawDistrictOverlays(palette);
        drawLandDecorations(palette);
        drawLandmarks(palette);
        drawProperties(palette);
        drawAlienInvasion(palette);
        drawEasterEggs(palette);
        drawDistrictLabels(palette);
        drawHoverTooltips(palette);

        ctx.restore();

        drawAdvisor(palette);

        // Screen-space effects (northern lights, Nokia 3310)
        drawScreenEasterEggs();

        // Weather effects (screen space)
        drawWeatherEffects();

        // Season transition banner
        if (seasonBannerAlpha > 0) {
            drawSeasonBanner();
        }
        if (autopilotBannerTimer > 0) {
            drawAutopilotBanner();
        }
    }

    function drawAnimatedFerry(palette) {
        // Static ferries
        drawVikingLineFerry(ferryPositions.vikingLine[0], ferryPositions.vikingLine[1], palette);
        drawSiljaLineFerry(ferryPositions.siljaLine[0], ferryPositions.siljaLine[1], palette);

        // Animated Suomenlinna ferry
        const t = ferryAnim.progress;
        const sx = ferryAnim.startPos[0], sy = ferryAnim.startPos[1];
        const ex = ferryAnim.endPos[0], ey = ferryAnim.endPos[1];
        const fx = sx + (ex - sx) * t;
        const fy = sy + (ey - sy) * t;
        drawSuomenlinnaFerry(fx, fy, palette);
    }

    // Wrap setSeason to also trigger weather
    const _innerSetSeason = setSeason;

    function setSeasonWithWeather(season) {
        _innerSetSeason(season);
        triggerWeather(season);
    }

    // === NEWSPAPER ILLUSTRATION SPRITES ===
    // Static versions of easter egg sprites drawn to arbitrary canvas contexts

    function drawNewsIllustration(canvasEl, illustrationId) {
        const c = canvasEl.getContext('2d');
        const w = canvasEl.width;
        const h = canvasEl.height;
        c.clearRect(0, 0, w, h);
        c.imageSmoothingEnabled = false;

        switch (illustrationId) {
        case 'alien': drawNewsUFO(c, w, h); break;
        case 'tonttu': drawNewsTonttu(c, w, h); break;
        case 'moose': drawNewsMoose(c, w, h); break;
        case 'nokia': drawNewsNokia(c, w, h); break;
        case 'northern_lights': drawNewsNorthernLights(c, w, h); break;
        case 'rubber_duck': drawNewsRubberDuck(c, w, h); break;
        case 'angry_bird': drawNewsAngryBird(c, w, h); break;
        case 'polar_bear': drawNewsPolarBear(c, w, h); break;
        case 'swedish': drawNewsSwedishFlag(c, w, h); break;
        }
    }

    function drawNewsUFO(c, w, h) {
        const cx = w / 2, cy = h / 2 + 4;
        const s = w / 80;

        // Starry background
        c.fillStyle = '#0a0a2a';
        c.fillRect(0, 0, w, h);
        for (let i = 0; i < 12; i++) {
            c.fillStyle = `rgba(255,255,200,${0.3 + Math.random() * 0.5})`;
            c.fillRect(((i * 37 + 11) % w), ((i * 23 + 7) % (h * 0.6)), 1.5 * s, 1.5 * s);
        }

        // Tractor beam
        c.fillStyle = 'rgba(100,255,170,0.12)';
        c.beginPath();
        c.moveTo(cx - 4 * s, cy + 3 * s);
        c.lineTo(cx - 14 * s, h);
        c.lineTo(cx + 14 * s, h);
        c.lineTo(cx + 4 * s, cy + 3 * s);
        c.closePath();
        c.fill();

        // Bottom dome
        c.fillStyle = '#556677';
        c.beginPath();
        c.ellipse(cx, cy + 2 * s, 10 * s, 3.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Main saucer
        c.fillStyle = '#99aabb';
        c.beginPath();
        c.ellipse(cx, cy, 12 * s, 4 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Rim highlight
        c.fillStyle = '#bbccdd';
        c.beginPath();
        c.ellipse(cx, cy - 1 * s, 12 * s, 2.5 * s, 0, Math.PI, 0);
        c.fill();
        // Cockpit dome
        c.fillStyle = '#66ffaa';
        c.beginPath();
        c.ellipse(cx, cy - 2 * s, 5 * s, 4 * s, 0, Math.PI, 0);
        c.fill();
        c.fillStyle = '#aaffcc';
        c.beginPath();
        c.ellipse(cx - 1 * s, cy - 4 * s, 2.5 * s, 2 * s, 0, Math.PI, 0);
        c.fill();
        // Rim lights
        const colors = ['#ff4444', '#ffcc00', '#ff4444', '#ffcc00', '#ff4444', '#ffcc00'];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            c.fillStyle = colors[i];
            c.fillRect(cx + Math.cos(angle) * 11 * s - s, cy + Math.sin(angle) * 3 * s - s, 2 * s, 2 * s);
        }
    }

    function drawNewsTonttu(c, w, h) {
        const s = w / 60;
        // Snowy rooftop scene
        c.fillStyle = '#2a3050';
        c.fillRect(0, 0, w, h);
        // Rooftops
        c.fillStyle = '#5a4a3a';
        c.fillRect(0, h * 0.65, w * 0.35, h * 0.35);
        c.fillRect(w * 0.4, h * 0.55, w * 0.3, h * 0.45);
        c.fillRect(w * 0.75, h * 0.6, w * 0.25, h * 0.4);
        // Snow on roofs
        c.fillStyle = '#ddeeff';
        c.fillRect(0, h * 0.63, w * 0.35, 3 * s);
        c.fillRect(w * 0.4, h * 0.53, w * 0.3, 3 * s);
        c.fillRect(w * 0.75, h * 0.58, w * 0.25, 3 * s);

        // Draw 3 tonttus on rooftops
        const positions = [[w * 0.17, h * 0.6], [w * 0.55, h * 0.5], [w * 0.87, h * 0.55]];
        for (const [tx, ty] of positions) {
            // Body
            c.fillStyle = '#666677';
            c.fillRect(tx - 2 * s, ty - 1 * s, 4 * s, 5 * s);
            // Head
            c.fillStyle = '#ddbb88';
            c.beginPath();
            c.arc(tx, ty - 3 * s, 2.5 * s, 0, Math.PI * 2);
            c.fill();
            // Red hat
            c.fillStyle = '#cc2222';
            c.beginPath();
            c.moveTo(tx - 3 * s, ty - 4.5 * s);
            c.lineTo(tx, ty - 10 * s);
            c.lineTo(tx + 3 * s, ty - 4.5 * s);
            c.closePath();
            c.fill();
            // Hat brim
            c.fillStyle = '#ffffff';
            c.fillRect(tx - 3.2 * s, ty - 5 * s, 6.4 * s, 1.5 * s);
            // Eyes
            c.fillStyle = '#111111';
            c.fillRect(tx - 1.2 * s, ty - 3.5 * s, 1 * s, 1 * s);
            c.fillRect(tx + 0.5 * s, ty - 3.5 * s, 1 * s, 1 * s);
            // White beard
            c.fillStyle = '#eeeeee';
            c.beginPath();
            c.moveTo(tx - 1.5 * s, ty - 1.5 * s);
            c.lineTo(tx, ty + 1 * s);
            c.lineTo(tx + 1.5 * s, ty - 1.5 * s);
            c.closePath();
            c.fill();
        }
    }

    function drawNewsMoose(c, w, h) {
        const cx = w / 2, s = w / 80;
        // Road scene
        c.fillStyle = '#88aa66';
        c.fillRect(0, 0, w, h);
        c.fillStyle = '#555555';
        c.fillRect(0, h * 0.45, w, h * 0.3);
        c.fillStyle = '#eeee44';
        for (let i = 0; i < 6; i++) {
            c.fillRect(w * 0.05 + i * w * 0.17, h * 0.58, w * 0.08, 2 * s);
        }

        // Draw moose in center
        const mx = cx, my = h * 0.42;
        // Body
        c.fillStyle = '#5a3a1a';
        c.beginPath();
        c.ellipse(mx, my, 10 * s, 6 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Legs
        c.fillStyle = '#4a2a0a';
        c.fillRect(mx - 7 * s, my + 4 * s, 3 * s, 8 * s);
        c.fillRect(mx - 2 * s, my + 5 * s, 3 * s, 7 * s);
        c.fillRect(mx + 3 * s, my + 5 * s, 3 * s, 7 * s);
        c.fillRect(mx + 7 * s, my + 4 * s, 3 * s, 8 * s);
        // Neck & Head
        c.fillStyle = '#5a3a1a';
        c.fillRect(mx + 8 * s, my - 8 * s, 4 * s, 10 * s);
        c.beginPath();
        c.ellipse(mx + 12 * s, my - 10 * s, 5 * s, 3.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Snout
        c.fillStyle = '#7a5a3a';
        c.beginPath();
        c.ellipse(mx + 16 * s, my - 9 * s, 3 * s, 2.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Antlers
        c.fillStyle = '#8a7a5a';
        c.fillRect(mx + 9 * s, my - 14 * s, 2 * s, 5 * s);
        c.fillRect(mx + 7 * s, my - 17 * s, 7 * s, 2 * s);
        c.fillRect(mx + 12 * s, my - 14 * s, 2 * s, 5 * s);
        c.fillRect(mx + 10 * s, my - 19 * s, 7 * s, 2 * s);
        // Eye
        c.fillStyle = '#111111';
        c.beginPath();
        c.arc(mx + 13 * s, my - 10.5 * s, 1 * s, 0, Math.PI * 2);
        c.fill();
    }

    function drawNewsNokia(c, w, h) {
        const cx = w / 2, cy = h / 2, s = w / 80;
        // Blue corporate background
        c.fillStyle = '#001848';
        c.fillRect(0, 0, w, h);

        // Nokia 3310 shape
        const px = cx - 8 * s, py = cy - 16 * s;
        const pw = 16 * s, ph = 32 * s;
        // Phone body
        c.fillStyle = '#334488';
        c.fillRect(px, py, pw, ph);
        c.fillStyle = '#2a3a6a';
        c.fillRect(px + 1 * s, py + 1 * s, pw - 2 * s, ph - 2 * s);
        // Screen
        c.fillStyle = '#88aa66';
        c.fillRect(px + 3 * s, py + 4 * s, pw - 6 * s, 10 * s);
        // Screen text (NOKIA)
        c.fillStyle = '#334422';
        c.fillRect(px + 4.5 * s, py + 7 * s, 1.5 * s, 3 * s); // N
        c.fillRect(px + 5.5 * s, py + 7 * s, 0.5 * s, 0.5 * s);
        c.fillRect(px + 6.5 * s, py + 7 * s, 1.5 * s, 3 * s);
        // Keypad dots
        c.fillStyle = '#556699';
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                c.fillRect(px + 3.5 * s + col * 3.5 * s, py + 17 * s + row * 3.5 * s, 2.5 * s, 2 * s);
            }
        }
        // Sparkle / excitement lines
        c.strokeStyle = '#ffcc00';
        c.lineWidth = 1.5 * s;
        c.beginPath(); c.moveTo(px - 5 * s, py + 5 * s); c.lineTo(px - 10 * s, py + 2 * s); c.stroke();
        c.beginPath(); c.moveTo(px - 4 * s, py + 10 * s); c.lineTo(px - 10 * s, py + 12 * s); c.stroke();
        c.beginPath(); c.moveTo(px + pw + 5 * s, py + 5 * s); c.lineTo(px + pw + 10 * s, py + 2 * s); c.stroke();
        c.beginPath(); c.moveTo(px + pw + 4 * s, py + 10 * s); c.lineTo(px + pw + 10 * s, py + 12 * s); c.stroke();
    }

    function drawNewsNorthernLights(c, w, h) {
        // Dark sky with aurora
        c.fillStyle = '#0a0a2a';
        c.fillRect(0, 0, w, h);
        // Stars
        for (let i = 0; i < 15; i++) {
            c.fillStyle = `rgba(255,255,220,${0.3 + Math.random() * 0.5})`;
            const sx = ((i * 31 + 13) % w);
            const sy = ((i * 17 + 5) % (h * 0.4));
            c.fillRect(sx, sy, 1.5, 1.5);
        }
        // Aurora bands
        const colors = [
            'rgba(0,255,100,0.25)', 'rgba(0,200,150,0.2)',
            'rgba(100,0,255,0.15)', 'rgba(0,255,200,0.2)',
        ];
        for (let band = 0; band < 4; band++) {
            c.fillStyle = colors[band];
            c.beginPath();
            c.moveTo(0, h * 0.1 + band * h * 0.08);
            for (let x = 0; x <= w; x += w / 8) {
                const wave = Math.sin(x / w * Math.PI * 2 + band * 1.5) * h * 0.08;
                c.lineTo(x, h * 0.15 + band * h * 0.08 + wave);
            }
            c.lineTo(w, h * 0.35 + band * h * 0.05);
            c.lineTo(0, h * 0.35 + band * h * 0.05);
            c.closePath();
            c.fill();
        }
        // City silhouette
        c.fillStyle = '#111122';
        c.fillRect(0, h * 0.75, w, h * 0.25);
        // Buildings
        const bw = w / 10;
        const heights = [0.6, 0.55, 0.65, 0.5, 0.7, 0.58, 0.62, 0.52, 0.68, 0.55];
        for (let i = 0; i < 10; i++) {
            c.fillRect(i * bw, h * heights[i], bw - 1, h);
        }
        // Church spire
        c.beginPath();
        c.moveTo(w * 0.45, h * 0.5);
        c.lineTo(w * 0.48, h * 0.35);
        c.lineTo(w * 0.51, h * 0.5);
        c.closePath();
        c.fill();
        // Window lights
        c.fillStyle = '#ffcc44';
        for (let i = 0; i < 8; i++) {
            const wx = ((i * 43 + 17) % (w - 10)) + 5;
            const wy = h * 0.7 + ((i * 19 + 3) % (h * 0.15));
            c.fillRect(wx, wy, 3, 3);
        }
    }

    function drawNewsRubberDuck(c, w, h) {
        const cx = w / 2, cy = h / 2 + h * 0.1, s = w / 70;
        // Water background
        c.fillStyle = '#2255aa';
        c.fillRect(0, 0, w, h);
        // Water ripples
        c.strokeStyle = 'rgba(255,255,255,0.12)';
        c.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            c.beginPath();
            c.ellipse(cx, cy + 6 * s, (16 + i * 6) * s, (5 + i * 2) * s, 0, 0, Math.PI * 2);
            c.stroke();
        }
        // Body
        c.fillStyle = '#ffdd00';
        c.beginPath();
        c.ellipse(cx, cy, 12 * s, 9 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Body highlight
        c.fillStyle = '#ffee55';
        c.beginPath();
        c.ellipse(cx - 2 * s, cy - 3 * s, 6 * s, 4 * s, -0.3, 0, Math.PI * 2);
        c.fill();
        // Head
        c.fillStyle = '#ffdd00';
        c.beginPath();
        c.arc(cx + 10 * s, cy - 10 * s, 8 * s, 0, Math.PI * 2);
        c.fill();
        // Head highlight
        c.fillStyle = '#ffee55';
        c.beginPath();
        c.arc(cx + 9 * s, cy - 12 * s, 4 * s, 0, Math.PI * 2);
        c.fill();
        // Beak
        c.fillStyle = '#ff8800';
        c.beginPath();
        c.moveTo(cx + 16 * s, cy - 10 * s);
        c.lineTo(cx + 23 * s, cy - 9 * s);
        c.lineTo(cx + 16 * s, cy - 7 * s);
        c.closePath();
        c.fill();
        // Eye
        c.fillStyle = '#111111';
        c.beginPath();
        c.arc(cx + 13 * s, cy - 12 * s, 1.5 * s, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(cx + 13.5 * s, cy - 12.5 * s, 0.6 * s, 0, Math.PI * 2);
        c.fill();
    }

    function drawNewsPolarBear(c, w, h) {
        const s = w / 70;
        // Snowy landscape
        c.fillStyle = '#c8d8e8';
        c.fillRect(0, 0, w, h);
        // Snow ground
        c.fillStyle = '#e8eef4';
        c.fillRect(0, h * 0.6, w, h * 0.4);
        // Snow mounds
        c.fillStyle = '#f0f4f8';
        c.beginPath();
        c.ellipse(w * 0.2, h * 0.62, w * 0.2, h * 0.06, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(w * 0.75, h * 0.63, w * 0.18, h * 0.05, 0, 0, Math.PI * 2);
        c.fill();

        // Polar bear (centered)
        const bx = w * 0.5, by = h * 0.52;
        // Body
        c.fillStyle = '#f0ece8';
        c.beginPath();
        c.ellipse(bx, by, 10 * s, 6.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Rear haunch
        c.beginPath();
        c.ellipse(bx - 6 * s, by + 1 * s, 5 * s, 5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Shoulder hump
        c.beginPath();
        c.ellipse(bx + 3 * s, by - 3 * s, 5 * s, 4 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Legs
        c.fillStyle = '#e8e4df';
        c.fillRect(bx + 1.5 * s, by + 4 * s, 4 * s, 7 * s);
        c.fillRect(bx + 6 * s, by + 3 * s, 4 * s, 8 * s);
        c.fillRect(bx - 8 * s, by + 3 * s, 4 * s, 7 * s);
        c.fillRect(bx - 4 * s, by + 4 * s, 4 * s, 7 * s);
        // Paws
        c.fillStyle = '#ddd8d2';
        for (const px of [bx + 3.5 * s, bx + 8 * s, bx - 6 * s, bx - 2 * s]) {
            c.beginPath();
            c.ellipse(px, by + 11 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
            c.fill();
        }
        // Neck
        c.fillStyle = '#f0ece8';
        c.fillRect(bx + 6 * s, by - 6 * s, 5 * s, 6 * s);
        // Head
        c.beginPath();
        c.ellipse(bx + 11 * s, by - 7 * s, 5.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Snout
        c.fillStyle = '#e8e4df';
        c.beginPath();
        c.ellipse(bx + 16 * s, by - 6 * s, 3 * s, 2.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Ears
        c.fillStyle = '#e0dcd6';
        c.beginPath(); c.arc(bx + 9 * s, by - 11 * s, 2 * s, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(bx + 13 * s, by - 11 * s, 2 * s, 0, Math.PI * 2); c.fill();
        // Eye
        c.fillStyle = '#111111';
        c.beginPath(); c.arc(bx + 12.5 * s, by - 8 * s, 1 * s, 0, Math.PI * 2); c.fill();
        // Nose
        c.beginPath(); c.arc(bx + 18 * s, by - 6.5 * s, 1.2 * s, 0, Math.PI * 2); c.fill();
    }

    function drawNewsAngryBird(c, w, h) {
        const cx = w / 2, cy = h / 2 + 2, s = w / 70;
        // Sky background
        c.fillStyle = '#5588cc';
        c.fillRect(0, 0, w, h);
        // Clouds
        c.fillStyle = 'rgba(255,255,255,0.3)';
        c.beginPath(); c.arc(w * 0.2, h * 0.25, 8 * s, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(w * 0.8, h * 0.15, 6 * s, 0, Math.PI * 2); c.fill();

        // Body
        c.fillStyle = '#cc2222';
        c.beginPath();
        c.arc(cx, cy, 14 * s, 0, Math.PI * 2);
        c.fill();
        // Belly
        c.fillStyle = '#ffe8c8';
        c.beginPath();
        c.ellipse(cx, cy + 5 * s, 8 * s, 7 * s, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fff2dd';
        c.beginPath();
        c.ellipse(cx, cy + 4 * s, 5 * s, 4.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        // Tail feathers
        c.fillStyle = '#222222';
        c.beginPath();
        c.moveTo(cx - 3 * s, cy - 12 * s);
        c.lineTo(cx - 7 * s, cy - 20 * s);
        c.lineTo(cx - 3 * s, cy - 18 * s);
        c.lineTo(cx, cy - 22 * s);
        c.lineTo(cx + 3 * s, cy - 18 * s);
        c.lineTo(cx + 7 * s, cy - 20 * s);
        c.lineTo(cx + 3 * s, cy - 12 * s);
        c.closePath();
        c.fill();
        // Head tuft
        c.fillStyle = '#cc2222';
        c.beginPath();
        c.moveTo(cx - 1 * s, cy - 13 * s);
        c.lineTo(cx - 3 * s, cy - 19 * s);
        c.lineTo(cx + 1 * s, cy - 14 * s);
        c.closePath();
        c.fill();
        c.beginPath();
        c.moveTo(cx + 1 * s, cy - 13 * s);
        c.lineTo(cx + 3 * s, cy - 18 * s);
        c.lineTo(cx + 4 * s, cy - 13 * s);
        c.closePath();
        c.fill();
        // Eyebrows
        c.fillStyle = '#222222';
        c.save();
        c.translate(cx - 4 * s, cy - 6 * s);
        c.rotate(-0.4);
        c.fillRect(-5 * s, -1.2 * s, 8 * s, 2.5 * s);
        c.restore();
        c.save();
        c.translate(cx + 4 * s, cy - 6 * s);
        c.rotate(0.4);
        c.fillRect(-3 * s, -1.2 * s, 8 * s, 2.5 * s);
        c.restore();
        // Eyes
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(cx - 3.5 * s, cy - 3 * s, 3.5 * s, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(cx + 3.5 * s, cy - 3 * s, 3.5 * s, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#111111';
        c.beginPath(); c.arc(cx - 2 * s, cy - 3 * s, 2 * s, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(cx + 2 * s, cy - 3 * s, 2 * s, 0, Math.PI * 2); c.fill();
        // Beak
        c.fillStyle = '#ff8800';
        c.beginPath();
        c.moveTo(cx - 3 * s, cy + 1 * s);
        c.lineTo(cx, cy + 6 * s);
        c.lineTo(cx + 3 * s, cy + 1 * s);
        c.closePath();
        c.fill();
        c.fillStyle = '#cc6600';
        c.beginPath();
        c.moveTo(cx - 3 * s, cy + 2.5 * s);
        c.lineTo(cx, cy + 6 * s);
        c.lineTo(cx + 3 * s, cy + 2.5 * s);
        c.closePath();
        c.fill();
    }

    function drawNewsSwedishFlag(c, w, h) {
        const s = w / 80;
        // Sky blue background
        c.fillStyle = '#88bbdd';
        c.fillRect(0, 0, w, h);
        // Ground
        c.fillStyle = '#667766';
        c.fillRect(0, h * 0.75, w, h * 0.25);

        // Flagpole
        const poleX = w * 0.35;
        c.fillStyle = '#555';
        c.fillRect(poleX - 1.5 * s, h * 0.15, 3 * s, h * 0.65);
        // Pole finial
        c.fillStyle = '#FECC00';
        c.beginPath();
        c.arc(poleX, h * 0.14, 3 * s, 0, Math.PI * 2);
        c.fill();

        // Swedish flag on pole
        const fx = poleX + 1.5 * s;
        const fy = h * 0.18;
        const fw = w * 0.45;
        const fh = h * 0.35;
        // Blue
        c.fillStyle = '#006AA7';
        c.fillRect(fx, fy, fw, fh);
        // Yellow cross
        c.fillStyle = '#FECC00';
        c.fillRect(fx, fy + fh * 0.4, fw, fh * 0.2);
        c.fillRect(fx + fw * 0.25, fy, fw * 0.15, fh);
        // Border
        c.strokeStyle = '#333';
        c.lineWidth = s;
        c.strokeRect(fx, fy, fw, fh);

        // Finnish flag on ground (fallen over)
        const gfx = w * 0.55;
        const gfy = h * 0.68;
        c.save();
        c.translate(gfx, gfy);
        c.rotate(0.3);
        const gfw = w * 0.3;
        const gfh = h * 0.2;
        c.fillStyle = '#fff';
        c.fillRect(0, 0, gfw, gfh);
        c.fillStyle = '#003580';
        c.fillRect(0, gfh * 0.4, gfw, gfh * 0.2);
        c.fillRect(gfw * 0.3, 0, gfw * 0.15, gfh);
        c.strokeStyle = '#999';
        c.lineWidth = s * 0.5;
        c.strokeRect(0, 0, gfw, gfh);
        c.restore();
    }

    function zoomToProperty(property) {
        // Zoom to max level
        camera.zoom = 4;

        // Center camera on property
        // Transform: screenPos = mapPos * zoom + cameraPos
        // We want property to appear at screen center (cssWidth/2, cssHeight/2)
        // So: cssWidth/2 = property.x * zoom + camera.x
        // camera.x = cssWidth/2 - property.x * zoom
        camera.x = cssWidth / 2 - property.x * camera.zoom;
        camera.y = cssHeight / 2 - property.y * camera.zoom;

        // Clamp camera to map bounds
        const mapScreenWidth = HelsinkiDistricts.MAP_WIDTH * camera.zoom;
        const mapScreenHeight = HelsinkiDistricts.MAP_HEIGHT * camera.zoom;
        camera.x = Math.max(-mapScreenWidth + cssWidth, Math.min(0, camera.x));
        camera.y = Math.max(-mapScreenHeight + cssHeight, Math.min(0, camera.y));

        render();
    }

    return {
        init: function(canvasEl) {
            init(canvasEl);
            startAnimationLoop();
        },
        render,
        resize,
        setSeason: setSeasonWithWeather,
        screenToMap,
        mapToScreen,
        triggerAdvisorAction,
        setAdvisorQuote,
        setAutopilotBanner,
        drawRivalPortrait,
        drawPlayerPortrait: drawPlayerPortraitOnCanvas,
        drawAdvisorPortrait: drawAdvisorPortraitOnCanvas,
        drawNewsIllustration,
        forcePolarBears,
        zoomToProperty,
        camera,
        get hoveredDistrict() { return hoveredDistrict; },
        get hoveredProperty() { return hoveredProperty; },
    };
})();
