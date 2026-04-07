// Helsinki Tycoon - Main Entry Point
(function() {
    'use strict';

    window.addEventListener('DOMContentLoaded', () => {
        // Initialize map
        const canvas = document.getElementById('map-canvas');
        MapRenderer.init(canvas);

        // Initialize UI
        UI.init();

        // Initial render (shows the map behind the start screen)
        MapRenderer.render();

        // Start menu music immediately (Electron has no autoplay restriction)
        Sound.init();
        Sound.startMenuMusic();

        console.log('Helsinki Tycoon initialized!');
        console.log(`Map: ${HelsinkiDistricts.districts.length} districts loaded`);
    });
})();
