// Helsinki Tycoon - District Data
// Coordinate system: approximate mapping of Helsinki geography
// Helsinki is a PENINSULA — land extends north off the map (mainland Finland)
// Water to the south, east (Kruunuvuorenselkä), and west (Lauttasaari strait)
// Lauttasaari is a separate island to the west
//
// Real Helsinki reference points:
// - Railway Station: 60.1713°N, 24.9414°E
// - Senate Square: 60.1693°N, 24.9527°E
// - Stockmann: 60.1686°N, 24.9381°E
// - Kamppi Centre: 60.1690°N, 24.9318°E
// - Kallio Church: 60.1842°N, 24.9496°E
// - Töölönlahti south: 60.1752°N, 24.9360°E

const HelsinkiDistricts = (() => {
    // Convert lat/lon to map coordinates
    // Wider map to capture Lauttasaari properly
    const LON_MIN = 24.860;
    const LON_MAX = 25.000;
    const LAT_MIN = 60.138;
    const LAT_MAX = 60.205;
    const MAP_WIDTH = 1400;
    const MAP_HEIGHT = 1005;

    function lonToX(lon) {
        return ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_WIDTH;
    }

    function latToY(lat) {
        return ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_HEIGHT;
    }

    function geoToMap(coords) {
        return coords.map(([lat, lon]) => [lonToX(lon), latToY(lat)]);
    }

    // =========================================================
    // MAIN LANDMASS — peninsula going off the top of the map
    // Traced clockwise starting from northwest (off-map top)
    // =========================================================
    const coastline = geoToMap([
        // --- TOP EDGE (mainland goes off-map) ---
        [60.205, 24.898],   // NW corner off-map
        [60.205, 24.990],   // NE corner off-map

        // --- EAST COAST going south ---
        // Arabianranta / Vanhankaupunginlahti outlet
        [60.202, 24.988],
        [60.199, 24.984],
        [60.197, 24.980],
        // Hermanni / Kalasatama approach
        [60.195, 24.978],
        [60.193, 24.977],

        // Kalasatama harbour — indentation where old port was
        [60.191, 24.978],
        [60.190, 24.981],   // harbour notch east
        [60.189, 24.980],   // harbour notch south
        [60.188, 24.978],

        // Sompasaari peninsula — distinct promontory east
        [60.187, 24.978],
        [60.1865, 24.981],
        [60.186, 24.984],   // Sompasaari east tip
        [60.185, 24.983],
        [60.184, 24.980],

        // Coast tucks west between Sompasaari and Merihaka
        [60.183, 24.978],
        [60.182, 24.976],
        [60.181, 24.975],

        // Merihaka / Siltasaari east shore
        [60.180, 24.973],
        [60.179, 24.972],

        // --- ELÄINTARHANLAHTI BAY (deep V between Hakaniemi and Kruununhaka) ---
        [60.178, 24.971],
        [60.177, 24.968],
        [60.1755, 24.965],   // bay floor
        [60.175, 24.963],

        // --- KATAJANOKKA PENINSULA ---
        // West base (near Uspenski Cathedral)
        [60.174, 24.964],
        [60.173, 24.967],
        [60.172, 24.970],
        // North shore going east
        [60.171, 24.974],
        [60.170, 24.977],
        // East tip — Viking Line / ferry terminals
        [60.168, 24.980],
        [60.166, 24.982],
        [60.165, 24.981],
        // South shore curves back west
        [60.164, 24.978],
        [60.163, 24.975],
        [60.162, 24.972],
        // South-west (Allas Sea Pool side)
        [60.163, 24.967],
        [60.164, 24.963],

        // --- SOUTH HARBOUR (Eteläsatama / Market Square) ---
        [60.165, 24.959],
        [60.167, 24.956],
        [60.1672, 24.953],   // Kolera-allas basin
        [60.166, 24.950],

        // --- KAIVOPUISTO PENINSULA ---
        [60.164, 24.952],
        [60.162, 24.954],
        [60.159, 24.957],
        // Kaivopuisto south tip — southernmost Helsinki
        [60.156, 24.958],
        [60.154, 24.957],
        [60.152, 24.955],
        [60.151, 24.952],
        // Southwest arc back north
        [60.150, 24.948],
        [60.151, 24.944],

        // --- ULLANLINNA / EIRA COAST ---
        [60.152, 24.940],
        [60.153, 24.936],
        // Eira — coast bumps slightly south here (Merisatama)
        [60.154, 24.932],
        [60.153, 24.929],
        [60.152, 24.926],
        [60.151, 24.923],

        // --- HERNESAARI PENINSULA ---
        [60.150, 24.921],
        [60.149, 24.920],
        // Löyly sauna — south tip
        [60.147, 24.920],
        [60.146, 24.918],
        // West side
        [60.147, 24.916],
        [60.149, 24.914],
        [60.151, 24.913],
        [60.153, 24.912],
        [60.155, 24.911],

        // --- HIETALAHTI BAY ---
        [60.157, 24.910],
        [60.158, 24.908],
        [60.159, 24.907],
        [60.160, 24.905],

        // --- JÄTKÄSAARI PENINSULA ---
        [60.160, 24.903],
        [60.158, 24.901],
        [60.156, 24.900],
        [60.154, 24.901],
        // South coast
        [60.152, 24.903],
        [60.150, 24.905],
        // South-west tip
        [60.149, 24.906],
        [60.148, 24.904],
        // West coast
        [60.149, 24.900],
        [60.151, 24.897],
        [60.153, 24.896],
        [60.155, 24.896],
        // Ruoholahti canal area
        [60.157, 24.897],

        // --- WEST COAST (facing Lauttasaari strait) ---
        [60.159, 24.898],
        [60.161, 24.899],
        [60.163, 24.901],
        [60.165, 24.902],

        // --- LAPINLAHTI BAY (Lappviken) — a deep bay ---
        // Bay entrance south
        [60.167, 24.903],
        [60.168, 24.905],
        // Bay goes inland (northeast)
        [60.169, 24.908],
        [60.170, 24.910],   // bay head (deepest point)
        [60.171, 24.909],
        // Bay north shore coming back west
        [60.172, 24.907],
        [60.173, 24.905],
        // Bay entrance north
        [60.174, 24.904],

        // --- HIETANIEMI COAST ---
        // Hietaranta beach — gentle westward curve
        [60.176, 24.905],
        [60.177, 24.907],
        [60.178, 24.908],
        // Hietaniemi cemetery coast
        [60.180, 24.908],
        [60.181, 24.907],
        [60.183, 24.906],
        // Towards Seurasaari bridge
        [60.185, 24.905],
        [60.186, 24.904],

        // --- SEURASAARI STRAIT (bridge crosses here) ---
        [60.187, 24.903],
        [60.188, 24.902],

        // --- MEILAHTI COAST going north ---
        [60.190, 24.902],
        [60.192, 24.901],
        [60.195, 24.900],
        [60.198, 24.899],
        [60.201, 24.898],
        // Back to NW corner off-map
        [60.205, 24.898],
    ]);

    // =========================================================
    // LAUTTASAARI ISLAND — separated from mainland by strait
    // =========================================================
    const lauttasaariIsland = geoToMap([
        // North shore (faces strait)
        [60.168, 24.880],
        [60.167, 24.884],
        [60.166, 24.888],
        [60.165, 24.892],
        // Northeast — closest to mainland (bridge at ~24.893)
        [60.163, 24.895],
        [60.162, 24.896],
        // East shore
        [60.160, 24.896],
        [60.158, 24.895],
        [60.156, 24.893],
        // Southeast
        [60.154, 24.890],
        [60.153, 24.887],
        // South shore
        [60.152, 24.884],
        [60.152, 24.880],
        [60.153, 24.876],
        // Southwest
        [60.154, 24.873],
        [60.155, 24.870],
        // West shore
        [60.157, 24.868],
        [60.159, 24.866],
        // Northwest
        [60.161, 24.866],
        [60.163, 24.867],
        [60.165, 24.869],
        // North
        [60.167, 24.872],
        [60.168, 24.876],
        [60.168, 24.880],
    ]);

    // =========================================================
    // INTERNAL WATER BODIES (drawn on top of land)
    // =========================================================
    const waterBodies = {
        // Töölönlahti — distinctive bay cutting into the city
        toolonlahti: geoToMap([
            // South end (near Kiasma/Musiikkitalo)
            [60.174, 24.935],
            [60.174, 24.938],
            // West shore
            [60.176, 24.933],
            [60.178, 24.932],
            [60.180, 24.931],
            // North end (Linnunlaulu)
            [60.183, 24.932],
            [60.185, 24.933],
            [60.186, 24.935],
            // East shore
            [60.186, 24.937],
            [60.185, 24.939],
            [60.183, 24.940],
            // Back south along east shore
            [60.181, 24.941],
            [60.179, 24.942],
            [60.177, 24.942],
            [60.175, 24.941],
            [60.174, 24.940],
            [60.174, 24.938],
        ]),

        // South Harbour (Eteläsatama / Kolera-allas)
        southHarbour: geoToMap([
            [60.167, 24.953],
            [60.168, 24.956],
            [60.168, 24.960],
            [60.166, 24.962],
            [60.165, 24.960],
            [60.164, 24.956],
            [60.165, 24.953],
            [60.167, 24.953],
        ]),

        // Eläintarhanlahti (bay between Hakaniemi/Siltasaari and Kruununhaka/Katajanokka)
        elaintarhanlahti: geoToMap([
            // South entrance (near Katajanokka/Kruununhaka)
            [60.175, 24.963],
            [60.176, 24.960],
            // West shore (Kaisaniemi botanical garden)
            [60.177, 24.956],
            [60.178, 24.953],
            [60.179, 24.951],
            // North end (Hakaniemi bridge area)
            [60.180, 24.951],
            [60.181, 24.953],
            [60.181, 24.956],
            // East shore (Siltasaari)
            [60.180, 24.960],
            [60.179, 24.964],
            [60.178, 24.967],
            // Back south via east entrance
            [60.177, 24.968],
            [60.176, 24.966],
            [60.175, 24.963],
        ]),

        // Hietalahti dock area (small bay between Punavuori and Jätkäsaari)
        hietalahti: geoToMap([
            [60.160, 24.905],
            [60.161, 24.908],
            [60.162, 24.912],
            [60.161, 24.914],
            [60.160, 24.912],
            [60.159, 24.908],
            [60.160, 24.905],
        ]),

        // Lapinlahti bay (Lappviken) — significant bay on west coast
        lapinlahti: geoToMap([
            [60.167, 24.903],
            [60.168, 24.905],
            [60.169, 24.908],
            [60.170, 24.910],   // deepest point
            [60.171, 24.909],
            [60.172, 24.907],
            [60.173, 24.905],
            [60.174, 24.904],
            [60.173, 24.903],
            [60.171, 24.903],
            [60.169, 24.903],
            [60.167, 24.903],
        ]),

        // Lauttasaari strait — the channel between Lauttasaari and mainland
        // (Rendered as wide water gap — already implied by the gap between
        //  the coastline and lauttasaariIsland polygons, but we can add
        //  a subtle indicator)
    };

    // =========================================================
    // PARKS AND GREEN AREAS
    // =========================================================
    const parks = [
        {
            name: 'Esplanadi',
            polygon: geoToMap([
                [60.1685, 24.936],
                [60.1695, 24.936],
                [60.1695, 24.950],
                [60.1685, 24.950],
                [60.1685, 24.936],
            ]),
        },
        {
            name: 'Kaivopuisto',
            polygon: geoToMap([
                [60.155, 24.946],
                [60.158, 24.948],
                [60.159, 24.953],
                [60.157, 24.956],
                [60.154, 24.954],
                [60.153, 24.950],
                [60.155, 24.946],
            ]),
        },
        {
            name: 'Kaisaniemi Park',
            polygon: geoToMap([
                [60.175, 24.944],
                [60.177, 24.946],
                [60.177, 24.950],
                [60.175, 24.950],
                [60.175, 24.944],
            ]),
        },
        {
            name: 'Sinebrychoff Park',
            polygon: geoToMap([
                [60.163, 24.918],
                [60.165, 24.920],
                [60.165, 24.924],
                [60.163, 24.924],
                [60.163, 24.918],
            ]),
        },
        {
            name: 'Hietaniemi Beach',
            polygon: geoToMap([
                [60.177, 24.906],
                [60.179, 24.908],
                [60.181, 24.909],
                [60.181, 24.911],
                [60.179, 24.911],
                [60.177, 24.909],
                [60.177, 24.906],
            ]),
        },
        {
            name: 'Sibelius Park',
            polygon: geoToMap([
                [60.181, 24.910],
                [60.184, 24.912],
                [60.184, 24.916],
                [60.181, 24.916],
                [60.181, 24.910],
            ]),
        },
        {
            name: 'Tähtitorninmäki',
            polygon: geoToMap([
                [60.161, 24.945],
                [60.163, 24.947],
                [60.163, 24.950],
                [60.161, 24.950],
                [60.161, 24.945],
            ]),
        },
    ];

    // =========================================================
    // MAJOR ROADS
    // =========================================================
    const roads = [
        {
            // Main artery: Erottaja NW through city centre, along W side of Töölönlahti, to Pasila
            name: 'Mannerheimintie',
            points: geoToMap([
                [60.167, 24.938],   // Erottaja (south end)
                [60.169, 24.936],   // Stockmann
                [60.171, 24.935],   // Kamppi / Railway Station
                [60.174, 24.934],   // Kiasma
                [60.177, 24.933],   // Töölönlahti west shore
                [60.180, 24.932],   // Ooppera
                [60.184, 24.930],   // Töölön tulli
                [60.188, 24.928],   // towards Pasila
                [60.193, 24.925],   // north off-map edge area
            ]),
        },
        {
            // E-W street through Kluuvi, from Mannerheimintie to Senate Square
            name: 'Aleksanterinkatu',
            points: geoToMap([
                [60.1705, 24.938],  // starts at Mannerheimintie / Stockmann
                [60.1700, 24.942],
                [60.1695, 24.948],
                [60.1693, 24.952],  // Senate Square
            ]),
        },
        {
            // E-W, one block south of Aleksanterinkatu (Esplanadi park between them)
            name: 'Pohjois-Esplanadi',
            points: geoToMap([
                [60.1690, 24.936],  // west end near Erottaja
                [60.1688, 24.942],
                [60.1685, 24.948],
                [60.1683, 24.952],  // east end at Market Square
            ]),
        },
        {
            // NE from Hakaniemi through Kallio and Sörnäinen — Helsinki's east axis
            name: 'Hämeentie',
            points: geoToMap([
                [60.179, 24.951],   // Hakaniemi (Pitkäsilta bridge)
                [60.182, 24.950],   // Kallio (runs almost due north here)
                [60.185, 24.951],   // Kallio church area
                [60.188, 24.953],   // Sörnäinen
                [60.192, 24.957],   // curves NE
                [60.196, 24.962],   // towards Arabia
            ]),
        },
        {
            // E-W from Hietalahti to Erottaja / Mannerheimintie
            name: 'Bulevardi',
            points: geoToMap([
                [60.162, 24.930],   // west end (Hietalahti square)
                [60.164, 24.933],
                [60.166, 24.936],
                [60.167, 24.938],   // east end at Erottaja / Mannerheimintie
            ]),
        },
        {
            // N-S on west side: from Ruoholahti north through Etu-Töölö
            name: 'Mechelininkatu',
            points: geoToMap([
                [60.162, 24.916],   // south end (Hietalahti area)
                [60.165, 24.918],
                [60.168, 24.920],
                [60.172, 24.922],   // crosses Runeberginkatu
                [60.176, 24.924],   // north end near Töölöntori
            ]),
        },
        {
            // N-S parallel to Mannerheimintie, west of it, through Töölö
            name: 'Runeberginkatu',
            points: geoToMap([
                [60.170, 24.923],   // south end
                [60.174, 24.925],
                [60.178, 24.927],
                [60.182, 24.929],   // north end
            ]),
        },
        {
            // Bridge road connecting mainland to Lauttasaari island
            name: 'Lauttasaarentie',
            points: geoToMap([
                [60.160, 24.899],   // mainland side (Ruoholahti)
                [60.162, 24.896],   // bridge
                [60.163, 24.892],
                [60.164, 24.884],   // into Lauttasaari
            ]),
        },
        {
            // Coastal road on east side: Merihaka to Kalasatama
            name: 'Sörnäisten rantatie',
            points: geoToMap([
                [60.181, 24.968],   // Merihaka
                [60.183, 24.972],
                [60.186, 24.975],   // Sompasaari junction
                [60.189, 24.977],   // Kalasatama
                [60.192, 24.977],   // north
            ]),
        },
    ];

    // =========================================================
    // DISTRICT DEFINITIONS
    // =========================================================
    const districts = [
        {
            id: 'lauttasaari',
            name: 'Lauttasaari',
            polygon: lauttasaariIsland,
            center: geoToMap([[60.160, 24.882]])[0],
            color: '#4a7a5a',
            description: 'Residential island, good transport links',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'jatkasaari',
            name: 'Jätkäsaari',
            polygon: geoToMap([
                [60.160, 24.903],
                [60.160, 24.899],
                [60.157, 24.897],
                [60.155, 24.896],
                [60.153, 24.896],
                [60.151, 24.897],
                [60.149, 24.900],
                [60.148, 24.904],
                [60.149, 24.907],
                [60.150, 24.905],
                [60.152, 24.903],
                [60.154, 24.902],
                [60.156, 24.901],
                [60.158, 24.901],
                [60.160, 24.903],
            ]),
            center: geoToMap([[60.154, 24.900]])[0],
            color: '#5a7a7a',
            description: 'Modern new development area',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'ruoholahti',
            name: 'Ruoholahti',
            polygon: geoToMap([
                [60.160, 24.903],
                [60.163, 24.901],
                [60.165, 24.902],
                [60.167, 24.903],
                // Lapinlahti bay cuts into eastern edge
                [60.168, 24.905],
                [60.169, 24.908],
                [60.168, 24.914],
                [60.165, 24.913],
                [60.162, 24.912],
                [60.160, 24.908],
                [60.160, 24.903],
            ]),
            center: geoToMap([[60.164, 24.907]])[0],
            color: '#5a6a7a',
            description: 'Office district with canal',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'kamppi',
            name: 'Kamppi',
            polygon: geoToMap([
                [60.168, 24.924],
                [60.170, 24.920],
                [60.172, 24.918],
                [60.175, 24.920],
                [60.177, 24.924],
                [60.176, 24.930],
                [60.174, 24.934],
                [60.172, 24.934],
                [60.170, 24.932],
                [60.168, 24.928],
                [60.168, 24.924],
            ]),
            center: geoToMap([[60.172, 24.926]])[0],
            color: '#7a6a5a',
            description: 'Major commercial hub, shopping centre',
            prestige: 4,
            propertyDensity: 'high',
        },
        {
            id: 'punavuori',
            name: 'Punavuori',
            polygon: geoToMap([
                [60.160, 24.912],
                [60.162, 24.912],
                [60.165, 24.913],
                [60.168, 24.914],
                [60.169, 24.918],
                [60.168, 24.924],
                [60.167, 24.928],
                [60.165, 24.928],
                [60.162, 24.926],
                [60.160, 24.922],
                [60.158, 24.918],
                [60.157, 24.914],
                [60.158, 24.912],
                [60.160, 24.912],
            ]),
            center: geoToMap([[60.163, 24.920]])[0],
            color: '#7a5a6a',
            description: 'Design district, trendy boutiques',
            prestige: 4,
            propertyDensity: 'high',
        },
        {
            id: 'eira',
            name: 'Eira',
            polygon: geoToMap([
                [60.155, 24.912],
                [60.158, 24.912],
                [60.158, 24.918],
                [60.157, 24.924],
                [60.155, 24.930],
                [60.153, 24.933],
                [60.152, 24.928],
                [60.151, 24.922],
                [60.149, 24.918],
                [60.150, 24.914],
                [60.152, 24.913],
                [60.155, 24.912],
            ]),
            center: geoToMap([[60.154, 24.922]])[0],
            color: '#6a7a5a',
            description: 'Upscale residential, Art Nouveau',
            prestige: 5,
            propertyDensity: 'low',
        },
        {
            id: 'ullanlinna',
            name: 'Ullanlinna',
            polygon: geoToMap([
                [60.155, 24.930],
                [60.157, 24.932],
                [60.160, 24.934],
                [60.162, 24.938],
                [60.162, 24.944],
                [60.161, 24.948],
                [60.159, 24.950],
                // Southern boundary — shared with Kaivopuisto
                [60.157, 24.950],
                [60.155, 24.948],
                [60.153, 24.944],
                [60.152, 24.940],
                [60.153, 24.935],
                [60.155, 24.930],
            ]),
            center: geoToMap([[60.158, 24.940]])[0],
            color: '#6a6a5a',
            description: 'Upscale residential, embassies',
            prestige: 5,
            propertyDensity: 'low',
        },
        {
            id: 'kaivopuisto',
            name: 'Kaivopuisto',
            polygon: geoToMap([
                // Northern boundary shared with Ullanlinna/Kaartinkaupunki
                [60.159, 24.950],
                [60.161, 24.948],
                [60.162, 24.950],
                [60.164, 24.952],
                // East coast
                [60.161, 24.955],
                [60.158, 24.957],
                // South tip — southernmost Helsinki
                [60.155, 24.958],
                [60.153, 24.957],
                [60.151, 24.955],
                [60.150, 24.952],
                // West side back north
                [60.150, 24.948],
                [60.151, 24.944],
                [60.153, 24.944],
                [60.155, 24.948],
                [60.157, 24.950],
                [60.159, 24.950],
            ]),
            center: geoToMap([[60.156, 24.952]])[0],
            color: '#5a7a5a',
            description: 'Grand park, embassies, sea views',
            prestige: 5,
            propertyDensity: 'low',
        },
        {
            id: 'kaartinkaupunki',
            name: 'Kaartinkaupunki',
            polygon: geoToMap([
                [60.165, 24.928],
                [60.167, 24.928],
                [60.168, 24.932],
                [60.170, 24.934],
                [60.170, 24.942],
                [60.168, 24.946],
                [60.166, 24.948],
                [60.164, 24.944],
                [60.162, 24.938],
                [60.162, 24.934],
                [60.163, 24.930],
                [60.165, 24.928],
            ]),
            center: geoToMap([[60.166, 24.938]])[0],
            color: '#6a5a6a',
            description: 'Central mixed-use district',
            prestige: 4,
            propertyDensity: 'medium',
        },
        {
            id: 'kluuvi',
            name: 'Kluuvi',
            polygon: geoToMap([
                [60.170, 24.932],
                [60.172, 24.934],
                [60.174, 24.934],
                [60.176, 24.936],
                [60.177, 24.942],
                [60.175, 24.946],
                [60.173, 24.948],
                [60.171, 24.946],
                [60.170, 24.942],
                [60.170, 24.937],
                [60.170, 24.932],
            ]),
            center: geoToMap([[60.173, 24.940]])[0],
            color: '#8a7a5a',
            description: 'Retail core — Stockmann, Esplanadi',
            prestige: 5,
            propertyDensity: 'high',
        },
        {
            id: 'kruununhaka',
            name: 'Kruununhaka',
            polygon: geoToMap([
                [60.173, 24.948],
                [60.175, 24.946],
                [60.177, 24.948],
                [60.178, 24.953],
                [60.177, 24.958],
                [60.175, 24.960],
                [60.173, 24.958],
                [60.171, 24.956],
                [60.170, 24.952],
                [60.171, 24.948],
                [60.173, 24.948],
            ]),
            center: geoToMap([[60.174, 24.953]])[0],
            color: '#7a6a6a',
            description: 'Historic district, Senate Square',
            prestige: 4,
            propertyDensity: 'medium',
        },
        {
            id: 'katajanokka',
            name: 'Katajanokka',
            polygon: geoToMap([
                // North-west (Uspenski area)
                [60.174, 24.964],
                [60.173, 24.967],
                [60.172, 24.970],
                // North shore going east
                [60.171, 24.974],
                [60.170, 24.977],
                // East tip (ferry terminals)
                [60.168, 24.980],
                [60.166, 24.982],
                [60.165, 24.981],
                // South shore
                [60.164, 24.978],
                [60.163, 24.975],
                [60.162, 24.972],
                [60.163, 24.967],
                [60.164, 24.963],
                // West (harbour / Market Square side)
                [60.166, 24.960],
                [60.168, 24.961],
                [60.170, 24.963],
                [60.173, 24.963],
                [60.174, 24.964],
            ]),
            center: geoToMap([[60.168, 24.972]])[0],
            color: '#5a7a6a',
            description: 'Peninsula with terminals and Allas Sea Pool',
            prestige: 3,
            propertyDensity: 'low',
        },
        {
            id: 'kallio',
            name: 'Kallio',
            polygon: geoToMap([
                [60.180, 24.944],
                [60.182, 24.942],
                [60.185, 24.943],
                [60.188, 24.946],
                [60.191, 24.950],
                [60.190, 24.955],
                [60.187, 24.957],
                [60.184, 24.955],
                [60.182, 24.952],
                [60.180, 24.950],
                [60.180, 24.944],
            ]),
            center: geoToMap([[60.185, 24.949]])[0],
            color: '#7a5a5a',
            description: 'Vibrant nightlife, affordable housing',
            prestige: 2,
            propertyDensity: 'high',
        },
        {
            id: 'hakaniemi',
            name: 'Hakaniemi',
            polygon: geoToMap([
                [60.178, 24.950],
                [60.180, 24.950],
                [60.182, 24.952],
                [60.183, 24.957],
                [60.182, 24.963],
                [60.180, 24.966],
                [60.178, 24.965],
                [60.177, 24.960],
                [60.177, 24.956],
                [60.178, 24.950],
            ]),
            center: geoToMap([[60.180, 24.958]])[0],
            color: '#6a6a7a',
            description: 'Market hall, mixed use',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'sornainen',
            name: 'Sörnäinen',
            polygon: geoToMap([
                [60.187, 24.957],
                [60.190, 24.955],
                [60.193, 24.958],
                [60.195, 24.963],
                [60.194, 24.970],
                [60.192, 24.972],
                [60.189, 24.972],
                [60.187, 24.970],
                [60.186, 24.966],
                [60.185, 24.961],
                [60.187, 24.957],
            ]),
            center: geoToMap([[60.190, 24.964]])[0],
            color: '#5a5a6a',
            description: 'Emerging area, Suvilahti events',
            prestige: 2,
            propertyDensity: 'low',
        },
        {
            id: 'kalasatama',
            name: 'Kalasatama',
            polygon: geoToMap([
                [60.189, 24.972],
                [60.192, 24.972],
                [60.194, 24.974],
                [60.196, 24.978],
                [60.193, 24.977],
                [60.191, 24.978],
                [60.190, 24.980],
                [60.189, 24.979],
                [60.188, 24.978],
                [60.187, 24.978],
                [60.187, 24.975],
                [60.189, 24.972],
            ]),
            center: geoToMap([[60.191, 24.976]])[0],
            color: '#5a6a8a',
            description: 'Modern towers, REDI shopping centre',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'sompasaari',
            name: 'Sompasaari',
            polygon: geoToMap([
                // Peninsula south of Kalasatama
                [60.187, 24.975],
                [60.187, 24.978],
                [60.186, 24.981],
                [60.185, 24.983],
                [60.184, 24.982],
                [60.183, 24.979],
                [60.182, 24.977],
                [60.183, 24.975],
                [60.185, 24.974],
                [60.187, 24.975],
            ]),
            center: geoToMap([[60.185, 24.978]])[0],
            color: '#5a7a8a',
            description: 'New residential peninsula, sea views',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'merihaka',
            name: 'Merihaka',
            polygon: geoToMap([
                [60.178, 24.965],
                [60.180, 24.966],
                [60.182, 24.968],
                [60.183, 24.972],
                [60.183, 24.975],
                [60.182, 24.977],
                [60.181, 24.975],
                [60.179, 24.972],
                [60.177, 24.970],
                [60.177, 24.967],
                [60.178, 24.965],
            ]),
            center: geoToMap([[60.181, 24.971]])[0],
            color: '#5a6a6a',
            description: 'Brutalist residential towers',
            prestige: 2,
            propertyDensity: 'low',
        },
        {
            id: 'hernesaari',
            name: 'Hernesaari',
            polygon: geoToMap([
                // North (connects to Eira/Punavuori)
                [60.155, 24.912],
                [60.153, 24.913],
                [60.151, 24.913],
                // East side
                [60.149, 24.914],
                [60.147, 24.916],
                // South tip (Löyly area)
                [60.146, 24.918],
                [60.147, 24.920],
                // West side
                [60.149, 24.921],
                [60.151, 24.922],
                [60.152, 24.925],
                // Back north
                [60.153, 24.922],
                [60.154, 24.918],
                [60.155, 24.914],
                [60.155, 24.912],
            ]),
            center: geoToMap([[60.150, 24.918]])[0],
            color: '#6a6a5a',
            description: 'Industrial peninsula, Löyly sauna',
            prestige: 2,
            propertyDensity: 'low',
        },
        {
            id: 'kaskisaari',
            name: 'Kaskisaari',
            polygon: geoToMap([
                // Small exclusive island north of Lauttasaari
                [60.172, 24.884],
                [60.173, 24.882],
                [60.174, 24.883],
                [60.175, 24.886],
                [60.175, 24.890],
                [60.174, 24.893],
                [60.173, 24.894],
                [60.172, 24.892],
                [60.171, 24.889],
                [60.171, 24.886],
                [60.172, 24.884],
            ]),
            center: geoToMap([[60.173, 24.888]])[0],
            color: '#5a8a5a',
            description: 'Exclusive island, ultra-luxury villas',
            prestige: 5,
            propertyDensity: 'low',
        },
        {
            id: 'lehtisaari',
            name: 'Lehtisaari',
            polygon: geoToMap([
                // Island north of Kaskisaari
                [60.178, 24.878],
                [60.179, 24.876],
                [60.181, 24.877],
                [60.182, 24.880],
                [60.182, 24.885],
                [60.181, 24.889],
                [60.180, 24.891],
                [60.178, 24.890],
                [60.177, 24.887],
                [60.177, 24.883],
                [60.178, 24.878],
            ]),
            center: geoToMap([[60.180, 24.884]])[0],
            color: '#5a7a5a',
            description: 'Upscale residential island',
            prestige: 4,
            propertyDensity: 'low',
        },
        {
            id: 'kuusisaari',
            name: 'Kuusisaari',
            polygon: geoToMap([
                // Small exclusive island northeast of Lehtisaari
                [60.184, 24.891],
                [60.185, 24.890],
                [60.186, 24.891],
                [60.187, 24.893],
                [60.187, 24.896],
                [60.186, 24.898],
                [60.185, 24.897],
                [60.184, 24.895],
                [60.184, 24.891],
            ]),
            center: geoToMap([[60.185, 24.894]])[0],
            color: '#4a8a5a',
            description: 'Tiny exclusive island, luxury homes',
            prestige: 5,
            propertyDensity: 'low',
        },
        {
            id: 'toolo',
            name: 'Töölö',
            polygon: geoToMap([
                // South boundary (Lapinlahti bay north shore)
                [60.174, 24.920],
                [60.174, 24.910],
                [60.175, 24.907],
                // West boundary (coast — Hietaniemi)
                [60.177, 24.907],
                [60.180, 24.908],
                [60.183, 24.906],
                [60.186, 24.905],
                [60.188, 24.904],
                // North-west (Meilahti)
                [60.192, 24.906],
                // North boundary
                [60.194, 24.915],
                [60.194, 24.922],
                [60.193, 24.928],
                // East boundary (Töölönlahti west shore)
                [60.190, 24.932],
                [60.186, 24.933],
                [60.183, 24.932],
                [60.180, 24.931],
                [60.178, 24.932],
                [60.176, 24.930],
                // Back south
                [60.175, 24.926],
                [60.174, 24.920],
            ]),
            center: geoToMap([[60.183, 24.920]])[0],
            color: '#6a7a7a',
            description: 'Residential, Finlandia Hall, museums',
            prestige: 4,
            propertyDensity: 'medium',
        },
    ];

    // =========================================================
    // LANDMARKS (for special rendering)
    // =========================================================
    const landmarks = [
        { name: 'Helsinki Cathedral', pos: geoToMap([[60.1695, 24.9527]])[0], district: 'kruununhaka' },
        { name: 'Finlandia Hall', pos: geoToMap([[60.1758, 24.9330]])[0], district: 'toolo' },
        { name: 'Senate Square', pos: geoToMap([[60.1693, 24.9505]])[0], district: 'kruununhaka' },
        { name: 'Railway Station', pos: geoToMap([[60.1713, 24.9414]])[0], district: 'kluuvi' },
        { name: 'Kamppi Centre', pos: geoToMap([[60.1690, 24.9318]])[0], district: 'kamppi' },
        { name: 'Hakaniemi Market', pos: geoToMap([[60.1795, 24.9505]])[0], district: 'hakaniemi' },
        { name: 'Temppeliaukio Church', pos: geoToMap([[60.1730, 24.9250]])[0], district: 'toolo' },
        { name: 'Allas Sea Pool', pos: geoToMap([[60.1670, 24.9580]])[0], district: 'katajanokka' },
        { name: 'Uspenski Cathedral', pos: geoToMap([[60.1687, 24.9610]])[0], district: 'katajanokka' },
        { name: 'Oodi Library', pos: geoToMap([[60.1740, 24.9385]])[0], district: 'kluuvi' },
        { name: 'Sibelius Monument', pos: geoToMap([[60.1822, 24.9132]])[0], district: 'toolo' },
        { name: 'Olympic Stadium', pos: geoToMap([[60.1870, 24.9270]])[0], district: 'toolo' },
        { name: 'REDI Centre', pos: geoToMap([[60.1875, 24.9760]])[0], district: 'kalasatama' },
        { name: 'Kaivopuisto Observatory', pos: geoToMap([[60.1565, 24.9520]])[0], district: 'kaivopuisto' },
    ];

    // =========================================================
    // KASKISAARI & LEHTISAARI — separate island polygons for rendering
    // (These are also districts, but need separate land polygons like Lauttasaari)
    // =========================================================
    const kaskisaariIsland = geoToMap([
        [60.172, 24.884],
        [60.173, 24.882],
        [60.174, 24.883],
        [60.175, 24.886],
        [60.175, 24.890],
        [60.174, 24.893],
        [60.173, 24.894],
        [60.172, 24.892],
        [60.171, 24.889],
        [60.171, 24.886],
        [60.172, 24.884],
    ]);

    const lehtisaariIsland = geoToMap([
        [60.178, 24.878],
        [60.179, 24.876],
        [60.181, 24.877],
        [60.182, 24.880],
        [60.182, 24.885],
        [60.181, 24.889],
        [60.180, 24.891],
        [60.178, 24.890],
        [60.177, 24.887],
        [60.177, 24.883],
        [60.178, 24.878],
    ]);

    const kuusisaariIsland = geoToMap([
        [60.184, 24.891],
        [60.185, 24.890],
        [60.186, 24.891],
        [60.187, 24.893],
        [60.187, 24.896],
        [60.186, 24.898],
        [60.185, 24.897],
        [60.184, 24.895],
        [60.184, 24.891],
    ]);

    // =========================================================
    // SMALL ISLANDS (decorative, not playable districts)
    // =========================================================
    const islands = [
        {
            name: 'Seurasaari',
            polygon: geoToMap([
                // Much larger island — open-air museum
                [60.185, 24.891],
                [60.186, 24.888],
                [60.188, 24.887],
                [60.190, 24.889],
                [60.191, 24.892],
                [60.192, 24.895],
                [60.191, 24.898],
                [60.190, 24.900],
                [60.188, 24.901],
                [60.186, 24.899],
                [60.185, 24.896],
                [60.185, 24.891],
            ]),
        },
        {
            name: 'Harakka',
            polygon: geoToMap([
                [60.150, 24.942],
                [60.151, 24.940],
                [60.152, 24.941],
                [60.152, 24.944],
                [60.151, 24.945],
                [60.150, 24.942],
            ]),
        },
        {
            name: 'Valkosaari',
            polygon: geoToMap([
                [60.162, 24.958],
                [60.163, 24.957],
                [60.164, 24.958],
                [60.163, 24.960],
                [60.162, 24.958],
            ]),
        },
        {
            name: 'Luoto',
            polygon: geoToMap([
                [60.162, 24.962],
                [60.163, 24.961],
                [60.163, 24.964],
                [60.162, 24.964],
                [60.162, 24.962],
            ]),
        },
    ];

    return {
        districts,
        coastline,
        lauttasaariIsland,
        kaskisaariIsland,
        lehtisaariIsland,
        kuusisaariIsland,
        waterBodies,
        parks,
        roads,
        landmarks,
        islands,
        lonToX,
        latToY,
        geoToMap,
        MAP_WIDTH,
        MAP_HEIGHT,
    };
})();
