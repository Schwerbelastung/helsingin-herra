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
            ctx.strokeStyle = isMajor ? palette.roadMajor : palette.road;
            ctx.lineWidth = isMajor ? 1.5 : 0.8;
            ctx.globalAlpha = isMajor ? 0.3 : 0.2;
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

    function drawProperties(palette) {
        if (typeof GameState === 'undefined' || !GameState.properties) return;

        const filtering = typeof UI !== 'undefined' && UI.isFilterActive();

        for (const prop of GameState.properties) {
            const [sx, sy] = [prop.x, prop.y];
            const size = 5;
            const isHovered = prop === hoveredProperty;
            const matches = !filtering || UI.propertyMatchesFilter(prop);

            const typeColors = {
                retail: '#ff8844',
                restaurant: '#ff4488',
                residential: '#4488ff',
                office: '#44bbff',
                hotel: '#ffcc00',
                landmark: '#ff44ff',
            };

            if (!matches) {
                // Dim non-matching properties
                ctx.globalAlpha = 0.15;
            }

            let borderColor = '#888888';
            if (prop.owner === 'player') borderColor = '#44ff44';
            else if (prop.owner) borderColor = '#ff4444';

            ctx.fillStyle = typeColors[prop.type] || '#888888';
            ctx.fillRect(sx - size / 2, sy - size / 2, size, size);

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = isHovered ? 2 : 1;
            ctx.strokeRect(sx - size / 2 - 1, sy - size / 2 - 1, size + 2, size + 2);

            if (matches && isHovered) {
                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 2;
                ctx.strokeRect(sx - size / 2 - 3, sy - size / 2 - 3, size + 6, size + 6);
            }

            if (palette.snow && matches) {
                ctx.fillStyle = '#e8e8f0';
                ctx.fillRect(sx - size / 2, sy - size / 2, size, 1);
            }

            if (!matches) {
                ctx.globalAlpha = 1;
            }
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
        fillPolygon(HelsinkiDistricts.kaskisaariIsland);
        fillPolygon(HelsinkiDistricts.lehtisaariIsland);
        fillPolygon(HelsinkiDistricts.kuusisaariIsland);

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
