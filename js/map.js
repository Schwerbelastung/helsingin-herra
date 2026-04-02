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
        camera.x = -HelsinkiDistricts.MAP_WIDTH / 2 + canvas.width / 2;
        camera.y = -HelsinkiDistricts.MAP_HEIGHT / 2 + canvas.height / 2;
        camera.zoom = Math.min(
            canvas.width / HelsinkiDistricts.MAP_WIDTH,
            canvas.height / HelsinkiDistricts.MAP_HEIGHT
        ) * 0.85;
    }

    function resize() {
        // Use the canvas element's CSS-computed size (set by flex layout)
        // rather than hardcoded offsets
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
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
        const mapPos = screenToMap(e.clientX - rect.left, e.clientY - rect.top);

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

        // Check districts
        for (const district of HelsinkiDistricts.districts) {
            if (pointInPolygon(mapPos, district.polygon)) {
                if (typeof UI !== 'undefined') UI.showDistrictInfo(district);
                return;
            }
        }

        if (typeof UI !== 'undefined') UI.hidePropertyPanel();
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

    function setSeason(season) {
        currentSeason = season;
    }

    // === RENDERING ===

    function render() {
        if (!ctx) return;
        const palette = seasonPalettes[currentSeason];

        // Clear with deep water color
        ctx.fillStyle = palette.waterDark;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(camera.zoom, camera.zoom);

        drawWater(palette);
        drawLand(palette);
        drawInternalWater(palette);
        drawParks(palette);
        drawRoads(palette);
        drawDistrictOverlays(palette);
        drawLandmarks(palette);
        drawProperties(palette);
        drawAlienInvasion(palette);
        drawDistrictLabels(palette);
        drawHoverTooltips(palette);

        ctx.restore();

        drawMinimap(palette);
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
                // Tiny shadow
                ctx.fillStyle = palette.coastEdge;
                ctx.save();
                ctx.translate(1, 1);
                fillPolygon(island.polygon);
                ctx.restore();
                drawFilledPolygon(island.polygon, palette.landAlt, palette.coastEdge, 0.5);
            }
        }
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
        for (const district of HelsinkiDistricts.districts) {
            const isHovered = district === hoveredDistrict;

            // Subtle district tint
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = district.color;
            fillPolygon(district.polygon);
            ctx.globalAlpha = 1;

            if (isHovered) {
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = '#ffffff';
                fillPolygon(district.polygon);
                ctx.globalAlpha = 1;
            }

            // District border
            ctx.strokeStyle = isHovered ? '#ffcc00' : 'rgba(255,255,255,0.12)';
            ctx.lineWidth = isHovered ? 2 : 0.5;
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
        for (const lm of HelsinkiDistricts.landmarks) {
            const [x, y] = lm.pos;
            const isHovered = lm === hoveredLandmark;

            // Different shapes for different landmarks
            const isChurch = lm.name.includes('Cathedral') || lm.name.includes('Church');
            const isMonument = lm.name.includes('Monument') || lm.name.includes('Stadium');

            // Hover glow
            if (isHovered) {
                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(x, y - 2, 10, 0, Math.PI * 2);
                ctx.stroke();
            }

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

            // Snow on landmarks in winter
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
            const drawer = spriteDrawers[prop.type];
            if (drawer) {
                drawer(sx, sy, color, prop.upgradeLevel);
            } else {
                // Fallback square
                ctx.fillStyle = color;
                ctx.fillRect(sx - 4, sy - 8, 8, 8);
            }

            // Snow on rooftops in winter
            if (palette.snow && matches) {
                ctx.fillStyle = '#e8e8f0';
                const h = prop.type === 'office' ? 12 : prop.type === 'hotel' ? 14 : 10;
                ctx.fillRect(sx - 4, sy - h - 1, 8, 2);
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

    function drawDistrictLabels(palette) {
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';

        for (const district of HelsinkiDistricts.districts) {
            const [cx, cy] = district.center;
            const isHovered = district === hoveredDistrict;

            const label = district.name;
            const metrics = ctx.measureText(label);
            const tw = metrics.width;

            ctx.fillStyle = 'rgba(10, 10, 26, 0.7)';
            ctx.fillRect(cx - tw / 2 - 3, cy - 5, tw + 6, 12);

            ctx.fillStyle = isHovered ? '#ffcc00' : 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(label, cx, cy + 4);
        }

        // Island labels (smaller, dimmer)
        ctx.font = '5px "Press Start 2P"';
        if (HelsinkiDistricts.islands) {
            for (const island of HelsinkiDistricts.islands) {
                if (!island.label) continue;
                const poly = island.polygon;
                // Compute centroid
                let sx = 0, sy = 0;
                for (const p of poly) { sx += p[0]; sy += p[1]; }
                const cx = sx / poly.length;
                const cy = sy / poly.length;

                const metrics = ctx.measureText(island.name);
                const tw = metrics.width;
                ctx.fillStyle = 'rgba(10, 10, 26, 0.6)';
                ctx.fillRect(cx - tw / 2 - 2, cy - 4, tw + 4, 10);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillText(island.name, cx, cy + 3);
            }
        }

        ctx.textAlign = 'left';
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

    function drawMinimap(palette) {
        const mmW = 150;
        const mmH = Math.floor(mmW * HelsinkiDistricts.MAP_HEIGHT / HelsinkiDistricts.MAP_WIDTH);
        const mmX = canvas.width - mmW - 10;
        const mmY = 10;
        const scale = mmW / HelsinkiDistricts.MAP_WIDTH;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
        ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
        ctx.fillStyle = palette.water;
        ctx.fillRect(mmX, mmY, mmW, mmH);

        // Draw land on minimap
        ctx.save();
        ctx.translate(mmX, mmY);
        ctx.scale(scale, scale);

        ctx.fillStyle = palette.land;
        fillPolygon(HelsinkiDistricts.coastline);
        fillPolygon(HelsinkiDistricts.lauttasaariIsland);
        fillPolygon(HelsinkiDistricts.jatkasaariIsland);
        fillPolygon(HelsinkiDistricts.kaskisaariIsland);
        fillPolygon(HelsinkiDistricts.lehtisaariIsland);
        fillPolygon(HelsinkiDistricts.kuusisaariIsland);
        fillPolygon(HelsinkiDistricts.kulosaariIsland);

        // Draw small islands on minimap
        if (HelsinkiDistricts.islands) {
            ctx.fillStyle = palette.landAlt;
            for (const island of HelsinkiDistricts.islands) {
                fillPolygon(island.polygon);
            }
        }

        // Draw internal water on minimap
        ctx.fillStyle = palette.water;
        for (const key in HelsinkiDistricts.waterBodies) {
            const body = HelsinkiDistricts.waterBodies[key];
            if (body && body.length >= 3) fillPolygon(body);
        }

        ctx.restore();

        // Viewport indicator
        const vpLeft = (-camera.x / camera.zoom) * scale + mmX;
        const vpTop = (-camera.y / camera.zoom) * scale + mmY;
        const vpWidth = (canvas.width / camera.zoom) * scale;
        const vpHeight = (canvas.height / camera.zoom) * scale;

        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1;
        ctx.strokeRect(vpLeft, vpTop, vpWidth, vpHeight);

        // Border
        ctx.strokeStyle = '#3a3a5c';
        ctx.lineWidth = 2;
        ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
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

    return {
        init,
        render,
        resize,
        setSeason,
        screenToMap,
        mapToScreen,
        camera,
        get hoveredDistrict() { return hoveredDistrict; },
        get hoveredProperty() { return hoveredProperty; },
    };
})();
