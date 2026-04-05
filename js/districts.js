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
        // Kulosaari bridge area — coast comes south from Pasila/Vallila
        [60.202, 24.988],
        [60.200, 24.983],
        [60.198, 24.979],
        [60.196, 24.976],

        // --- VANHANKAUPUNGINLAHTI BAY (bay NE of Sörnäinen, goes north) ---
        // Coast turns west into the bay mouth
        [60.196, 24.976],
        [60.197, 24.972],
        // Bay goes north toward Arabianranta (narrower than before)
        [60.199, 24.968],   // bay narrows going north
        [60.200, 24.965],   // bay head (Arabianranta)
        // Bay east shore comes back south
        [60.199, 24.970],
        [60.198, 24.975],
        [60.196, 24.978],

        // --- KALASATAMA / SÖRNÄINEN COAST ---
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

        // --- HERNESAARI PENINSULA ---
        // East side (heading south from Eira coast)
        [60.150, 24.925],
        [60.148, 24.923],
        // Löyly sauna — south tip
        [60.146, 24.920],
        // West side (heading north)
        [60.147, 24.917],
        [60.149, 24.916],
        [60.152, 24.916],
        [60.155, 24.916],
        [60.157, 24.916],

        // --- COAST TO RUOHOLAHTI (Jätkäsaari is a separate island polygon) ---
        [60.159, 24.912],
        [60.161, 24.908],
        [60.162, 24.903],

        // --- WEST COAST (facing Lauttasaari strait) ---
        [60.162, 24.899],
        [60.163, 24.901],
        [60.165, 24.902],

        // --- LAPINLAHTI BAY (Lappviken) — coast skips bay (internal water body handles it) ---
        [60.167, 24.903],
        [60.170, 24.903],
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
        // Northwest corner
        [60.167, 24.863],
        // North shore — flat and wide
        [60.168, 24.870],
        [60.168, 24.878],
        [60.168, 24.886],
        // Northeast corner — toward bridge
        [60.167, 24.891],
        [60.165, 24.893],
        [60.163, 24.895],
        // East wall — drops south, staying east
        [60.161, 24.893],
        [60.159, 24.892],
        [60.157, 24.891],
        // Vattuniemi — points straight south
        [60.155, 24.890],
        [60.153, 24.889],
        [60.151, 24.887],
        [60.149, 24.884],
        // South tip — turns west
        [60.149, 24.879],
        // Southwest bay — deep concave cut inward
        [60.152, 24.879],
        [60.156, 24.879],
        [60.160, 24.876],
        // West wall — short, straight up from the inner corner
        [60.161, 24.870],
        [60.162, 24.864],
        [60.165, 24.862],
        // Close — back to northwest corner
        [60.167, 24.863],
    ]);

    // =========================================================
    // JÄTKÄSAARI — separate island (like Lauttasaari)
    // =========================================================
    const jatkasaariIsland = geoToMap([
        // Clockwise from NW — narrower rectangular shape
        [60.162, 24.897],   // NW corner (Porkkalankatu)
        [60.162, 24.903],   // N edge midpoint
        [60.161, 24.909],   // NE corner (Länsisatama channel)
        [60.158, 24.910],   // E side upper
        [60.155, 24.910],   // E side middle
        [60.152, 24.909],   // E side lower
        [60.149, 24.908],   // SE corner
        [60.148, 24.905],   // S edge
        [60.147, 24.900],   // SW corner (terminal area)
        [60.148, 24.897],   // W side lower
        [60.151, 24.896],   // W side mid-lower
        [60.155, 24.896],   // W side mid-upper
        [60.159, 24.896],   // W side upper
        [60.162, 24.897],   // close
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

        // Hietalahti dock basin (between mainland, Jätkäsaari, and Hernesaari)
        hietalahti: geoToMap([
            [60.162, 24.903],   // mainland coast (Ruoholahti)
            [60.161, 24.908],   // mainland coast
            [60.159, 24.912],   // mainland coast
            [60.157, 24.916],   // Hernesaari NW corner
            [60.158, 24.910],   // Jätkäsaari E upper
            [60.161, 24.909],   // Jätkäsaari NE corner
            [60.162, 24.903],   // Jätkäsaari N edge → close
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

        // Vanhankaupunginlahti bay (bay going north toward Arabianranta)
        vanhankaupunginlahti: geoToMap([
            [60.196, 24.976],
            [60.197, 24.972],
            [60.199, 24.968],
            [60.200, 24.965],   // bay head
            [60.199, 24.970],
            [60.198, 24.975],
            [60.196, 24.978],
            [60.196, 24.976],
        ]),
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
        {
            // Linnanmäki / Alppipuisto area
            name: 'Alppipuisto',
            polygon: geoToMap([
                [60.187, 24.936],
                [60.190, 24.936],
                [60.192, 24.940],
                [60.192, 24.948],
                [60.190, 24.950],
                [60.187, 24.948],
                [60.186, 24.942],
                [60.187, 24.936],
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
                [60.171, 24.934],   // Kamppi / Railway Station
                [60.174, 24.931],   // Kiasma
                [60.177, 24.929],   // west of Töölönlahti
                [60.180, 24.928],   // Ooppera
                [60.184, 24.927],   // Töölön tulli
                [60.188, 24.925],   // towards Pasila
                [60.193, 24.923],   // north off-map edge area
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
        {
            // Bridge from mainland (Sörnäinen/Hermanni) east to Kulosaari island
            name: 'Kulosaaren silta',
            points: geoToMap([
                [60.195, 24.976],   // mainland side
                [60.194, 24.980],   // bridge over water
                [60.193, 24.984],   // Kulosaari island side
            ]),
        },
        {
            // Pedestrian bridge from Seurasaari north edge to mainland NE
            name: 'Seurasaaren silta',
            points: geoToMap([
                [60.184, 24.900],   // Seurasaari north edge
                [60.186, 24.905],   // mainland side (coast NE)
            ]),
        },
        {
            // Bridge from Mustikkamaa south to Korkeasaari zoo island
            name: 'Korkeasaaren silta',
            points: geoToMap([
                [60.184, 24.988],   // Mustikkamaa side
                [60.183, 24.989],   // Korkeasaari side
            ]),
        },
        {
            // Bridge from Kulosaari south to Mustikkamaa
            name: 'Mustikkamaan silta',
            points: geoToMap([
                [60.189, 24.987],   // Kulosaari side
                [60.188, 24.987],   // Mustikkamaa side
            ]),
        },
        {
            // Bridge from Lauttasaari north to Kaskisaari
            name: 'Kaskisaaren silta',
            points: geoToMap([
                [60.168, 24.881],   // Lauttasaari N tip
                [60.170, 24.884],   // mid-water
                [60.172, 24.885],   // Kaskisaari S edge
            ]),
        },
        {
            // Bridge from Kaskisaari north to Lehtisaari
            name: 'Lehtisaaren silta',
            points: geoToMap([
                [60.175, 24.887],   // Kaskisaari N edge
                [60.177, 24.885],   // Lehtisaari S edge
            ]),
        },
        {
            // Bridge from Lehtisaari north to Kuusisaari
            name: 'Kuusisaaren silta',
            points: geoToMap([
                [60.182, 24.887],   // Lehtisaari N edge
                [60.184, 24.892],   // Kuusisaari S edge
            ]),
        },
        {
            // Bridge from Kuusisaari east to mainland
            name: 'Kuusisaari mainland silta',
            points: geoToMap([
                [60.186, 24.898],   // Kuusisaari E edge
                [60.187, 24.904],   // mainland coast
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
            center: geoToMap([[60.160, 24.876]])[0],
            color: '#4a7a5a',
            description: 'Residential island with beach, good transport links',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'jatkasaari',
            name: 'Jätkäsaari',
            polygon: jatkasaariIsland,
            center: geoToMap([[60.154, 24.904]])[0],
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
                [60.161, 24.910],
                [60.161, 24.907],
                [60.160, 24.905],
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
                // Shifted NE — west of Hernesaari's east edge, east of Ullanlinna
                [60.159, 24.926],   // NW
                [60.159, 24.934],   // NE
                [60.156, 24.936],   // E
                [60.153, 24.934],   // SE
                [60.152, 24.929],   // S (Merisatama)
                [60.153, 24.926],   // SW
                [60.156, 24.925],   // W
                [60.159, 24.926],   // close
            ]),
            center: geoToMap([[60.156, 24.930]])[0],
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
                [60.170, 24.933],   // SW (Mannerheimintie)
                [60.172, 24.934],   // NW (south of Töölönlahti)
                [60.173, 24.938],   // N (Railway Station area)
                [60.173, 24.944],   // NE
                [60.172, 24.948],   // E
                [60.170, 24.948],   // SE
                [60.168, 24.946],   // S (Esplanadi east)
                [60.168, 24.938],   // S (Esplanadi west)
                [60.170, 24.933],   // close
            ]),
            center: geoToMap([[60.170, 24.941]])[0],
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
                [60.1815, 24.954],
                [60.182, 24.953],
                [60.184, 24.955],
                [60.185, 24.958],
                [60.184, 24.963],
                [60.182, 24.966],
                [60.181, 24.965],
                [60.1805, 24.962],
                [60.1805, 24.958],
                [60.181, 24.956],
                [60.1815, 24.954],
            ]),
            center: geoToMap([[60.182, 24.959]])[0],
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
                [60.196, 24.960],
                [60.196, 24.968],
                [60.195, 24.972],
                [60.192, 24.975],
                [60.189, 24.972],
                [60.187, 24.970],
                [60.186, 24.966],
                [60.185, 24.961],
                [60.187, 24.957],
            ]),
            center: geoToMap([[60.191, 24.964]])[0],
            color: '#5a5a6a',
            description: 'Emerging area, Suvilahti events',
            prestige: 2,
            propertyDensity: 'low',
        },
        {
            id: 'kalasatama',
            name: 'Kalasatama',
            polygon: geoToMap([
                // Simple convex polygon — just the land strip
                [60.189, 24.972],
                [60.192, 24.975],
                [60.196, 24.976],
                [60.196, 24.978],
                [60.193, 24.977],
                [60.191, 24.978],
                [60.190, 24.981],
                [60.189, 24.980],
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
                // Clockwise from NW — wider peninsula shape
                [60.157, 24.916],   // NW (channel side)
                [60.157, 24.924],   // NE (connects toward Eira)
                [60.155, 24.926],   // E upper
                [60.152, 24.926],   // E middle
                [60.150, 24.925],   // E lower
                [60.148, 24.923],   // E near south
                // South tip (Löyly area)
                [60.146, 24.920],
                // West side (channel facing Jätkäsaari)
                [60.147, 24.917],
                [60.149, 24.916],
                [60.152, 24.916],
                [60.155, 24.916],
                [60.157, 24.916],   // close
            ]),
            center: geoToMap([[60.151, 24.920]])[0],
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
            description: 'Residential, Finlandia Hall, Kansallismuseo',
            prestige: 4,
            propertyDensity: 'medium',
        },
        {
            id: 'kulosaari',
            name: 'Kulosaari',
            polygon: geoToMap([
                [60.194, 24.982],
                [60.195, 24.980],
                [60.196, 24.981],
                [60.197, 24.984],
                [60.197, 24.989],
                [60.196, 24.993],
                [60.194, 24.995],
                [60.192, 24.994],
                [60.190, 24.992],
                [60.189, 24.989],
                [60.189, 24.986],
                [60.190, 24.983],
                [60.192, 24.981],
                [60.194, 24.982],
            ]),
            center: geoToMap([[60.193, 24.988]])[0],
            color: '#4a7a4a',
            description: 'Exclusive residential island, villas',
            prestige: 5,
            propertyDensity: 'low',
        },
        {
            id: 'alppila',
            name: 'Alppila',
            polygon: geoToMap([
                // South border — follows Kallio's north edge
                [60.188, 24.936],   // SW — east of Töölönlahti
                [60.188, 24.946],   // S — shared with Kallio north
                [60.191, 24.950],   // SE — Kallio NE vertex
                // East border — alongside Sörnäinen's west
                [60.191, 24.955],   // E
                [60.193, 24.958],   // NE — shared with Sörnäinen NW
                // North border
                [60.194, 24.950],   // N
                [60.194, 24.940],   // NW
                // West border — east of Töölönlahti
                [60.191, 24.935],   // W
                [60.188, 24.936],   // close
            ]),
            center: geoToMap([[60.191, 24.945]])[0],
            color: '#7a6a5a',
            description: 'Linnanmäki amusement park, residential area',
            prestige: 3,
            propertyDensity: 'medium',
        },
        {
            id: 'pasila',
            name: 'Pasila',
            polygon: geoToMap([
                // Top edge — flat horizontal line at map border
                [60.205, 24.910],   // NW at map edge
                [60.205, 24.958],   // NE at map edge
                // Right side descends
                [60.200, 24.958],
                [60.197, 24.955],
                [60.195, 24.950],   // SE — near Alppila/Sörnäinen north
                // Bottom of U — curves west
                [60.194, 24.945],
                [60.193, 24.938],   // bottom center of U
                [60.194, 24.930],
                [60.195, 24.924],   // SW — near Töölö NE
                // Left side ascends
                [60.197, 24.918],
                [60.200, 24.912],
                [60.205, 24.910],   // close at NW
            ]),
            center: geoToMap([[60.202, 24.942]])[0],
            color: '#6a5a7a',
            description: 'Railway hub, Tripla mall, Messukeskus',
            prestige: 3,
            propertyDensity: 'medium',
        },
    ];

    // =========================================================
    // LANDMARKS (for special rendering)
    // =========================================================
    const landmarks = [
        {
            name: 'Helsinki Cathedral',
            pos: geoToMap([[60.1695, 24.9527]])[0],
            district: 'kruununhaka',
            blurb: ["The great white cathedral looming over Senate Square has been Helsinki's most-photographed building since photography was invented. It appears on roughly 80% of all tourist photos taken in Finland, including many taken by people who came to photograph something else.", "The steps leading up to it are technically a public staircase, which means at any given moment they host simultaneously: a guided tour group, a bride and groom, three teenagers eating ice cream, and a pigeon who has been there longer than any of them."],
        },
        {
            name: 'Finlandia Hall',
            pos: geoToMap([[60.1758, 24.9330]])[0],
            district: 'toolo',
            blurb: ["Alvar Aalto designed this marble concert hall in 1971 and it is widely considered a masterpiece of Finnish architecture. It is also widely known for the fact that the marble cladding began warping almost immediately after installation. Aalto blamed the Finnish climate. The climate has not commented.", "The building has hosted global summits, peace negotiations, and the occasional bewildering modern art installation. It looks best in winter, when the snow softens its edges and hides the bits that are currently under repair."],
        },
        {
            name: 'Senate Square',
            pos: geoToMap([[60.1693, 24.9505]])[0],
            district: 'kruununhaka',
            blurb: ["Helsinki's grandest public square was designed by Carl Ludwig Engel in the early 19th century, when the city was briefly trying to look like St. Petersburg. The effort was largely successful, which surprises visitors who were expecting something more... Finnish.", "Every major national celebration ends up here eventually. Independence Day, New Year's, victory parades — if Finland does something collectively, it does it on this square, usually in temperatures that would close schools in any other country."],
        },
        {
            name: 'Railway Station',
            pos: geoToMap([[60.1713, 24.9414]])[0],
            district: 'kluuvi',
            blurb: ["Helsinki's main railway station is a National Romantic masterpiece completed in 1919, guarded by four large stone men holding glowing orbs. The men have no official names. Locals have given them many unofficial ones, none of which are fit for a historic plaque.", "The station serves as the beating heart of Helsinki's public transport network, which means at rush hour it is the most organised chaos in northern Europe. Everyone knows exactly where they're going. Nobody gets out of the way."],
        },
        {
            name: 'Hakaniemi Market',
            pos: geoToMap([[60.1825, 24.9565]])[0],
            district: 'hakaniemi',
            blurb: ["Hakaniemi market hall has been selling Finnish groceries since 1914, and some of the vendors look as though they may have been there since the opening. The salmon is excellent. The opinions are complimentary and unasked-for.", "Outside, the square hosts an open market in summer and a deeply determined one in winter. Finns do not cancel outdoor markets due to weather. The weather is aware of this and has given up trying."],
        },
        {
            name: 'Temppeliaukio Church',
            pos: geoToMap([[60.1750, 24.9250]])[0],
            district: 'kamppi',
            blurb: ["This church was carved directly into solid bedrock in 1969, because a Finnish architect looked at a large rock in the middle of Töölö and thought: that would be a great place for a church. Remarkably, everyone agreed.", "The acoustics inside are extraordinary, which is why it doubles as a concert venue. The rough stone walls and copper ceiling create a sound so warm and resonant that even the hymns sound good. This is harder than it sounds."],
        },
        {
            name: 'Allas Sea Pool',
            pos: geoToMap([[60.1670, 24.9580]])[0],
            district: 'katajanokka',
            blurb: ["A floating sea pool complex in the South Harbour, where Helsinkians swim year-round with the kind of commitment to outdoor bathing that baffles the rest of Europe. The heated pool is warm. The sea pool is Baltic. The sauna is extremely Finnish.", "In winter, brave visitors alternate between the sauna and a hole cut in the ice. They report that this feels amazing. Observers report that it looks insane. Both accounts are accurate."],
        },
        {
            name: 'Uspenski Cathedral',
            pos: geoToMap([[60.1687, 24.9610]])[0],
            district: 'katajanokka',
            blurb: ["The red-brick Russian Orthodox cathedral sits on a rocky promontory overlooking the South Harbour, where it has been reminding everyone of Helsinki's complicated history since 1868. It is very large. It is very red. It is impossible to miss and equally impossible to categorise.", "The interior is covered in gold icons and elaborate decoration. Visitors expecting Finnish minimalism find this surprising. The cathedral has been surprising visitors for over 150 years and shows no sign of stopping."],
        },
        {
            name: 'Oodi Library',
            pos: geoToMap([[60.1740, 24.9385]])[0],
            district: 'kluuvi',
            blurb: ["Oodi opened in 2018 as Helsinki's new central library and immediately became the most beloved public building in Finland, which is saying something in a country that takes libraries very seriously. It has 3D printers, recording studios, and approximately one million comfortable chairs.", "The sweeping copper roof curves upward at both ends like a wave frozen mid-crash. Inside, you can borrow power tools, record an album, or simply read in silence, all under the same roof. Finland considers this normal."],
        },
        {
            name: 'Sibelius Monument',
            pos: geoToMap([[60.1822, 24.9132]])[0],
            district: 'toolo',
            blurb: ["Eila Hiltunen's 1967 monument to Jean Sibelius consists of over 600 hollow steel pipes welded together into an abstract wave, which sounds like a description of modern art but is actually a description of a monument that genuinely sounds like Sibelius when the wind blows through it.", "The monument was initially controversial. Critics said it looked nothing like Sibelius. A small portrait bust of the composer was eventually added nearby, which satisfied the critics and confused the pigeons."],
        },
        {
            name: 'Hietaniemi Beach',
            pos: geoToMap([[60.1770, 24.9060]])[0],
            district: 'toolo',
            blurb: ["Hietaniemi, or Hietsu, is Helsinki's most beloved urban beach. In summer it is full of Helsinkians doing the Nordic equivalent of relaxing, which involves lying on the sand, swimming vigorously, eating ice cream, and arguing mildly about whether it is warm enough to swim.", "The beach sits next to one of Helsinki's larger cemeteries, which Helsinkians find perfectly natural. Life and death, sand and stone, summer and the inevitable return of winter. Very Finnish."],
        },
        {
            name: 'Olympic Stadium',
            pos: geoToMap([[60.1870, 24.9270]])[0],
            district: 'toolo',
            blurb: ["Built for the 1940 Olympics, which were cancelled due to a world war, and then used for the 1952 Olympics, making it arguably the most patient sports venue ever constructed. The tower offers the best panoramic view of Helsinki available to anyone who climbs 72 metres of stairs.", "Paavo Nurmi, the Flying Finn, lit the Olympic flame here in 1952. A bronze statue of him sprinting with a torch stands outside. He looks like he is having a very good time. He almost certainly was not."],
        },
        {
            name: 'Linnanmäki',
            pos: geoToMap([[60.1880, 24.9400]])[0],
            district: 'alppila',
            blurb: ["Helsinki's beloved amusement park has been in operation since 1950, and the wooden roller coaster has been terrifying visitors for nearly as long. It is the kind of ride that looks charming from the ground and genuinely alarming from the top.", "All proceeds from Linnanmäki go to child welfare organisations, which means every screaming descent is technically an act of charity. This is perhaps the most Finnish way imaginable to run an amusement park."],
        },
        {
            name: 'Kaivopuisto Observatory',
            pos: geoToMap([[60.1550, 24.9490]])[0],
            district: 'kaivopuisto',
            blurb: ["The old observatory in Kaivopuisto Park was built in 1834 and used for astronomical research until the city lights made stargazing impractical, at which point it became a cultural heritage site and started hosting dinners. A very Finnish career change.", "The park surrounding it is Helsinki's oldest and most genteel public park, popular with dogs, diplomats, and people who want to sit very close to the sea without technically being at the beach."],
        },
        {
            name: 'Tähtitorninmäki Observatory',
            pos: geoToMap([[60.1625, 24.9490]])[0],
            district: 'kaivopuisto',
            blurb: ["Perched on Observatory Hill, this 19th-century observatory looks exactly like what a Finnish astronomer in 1834 would draw if asked to design a place to look at stars. It is circular, dignified, and surrounded by a park where people walk their dogs regardless of weather.", "The hill itself offers one of the better views of the South Harbour. On a clear summer evening, with the sun refusing to set, the view is genuinely remarkable. The observatory is indifferent to this. It is busy being historic."],
        },
        {
            name: 'Seurasaari Open-Air Museum',
            pos: geoToMap([[60.181, 24.900]])[0],
            district: null,
            blurb: ["Seurasaari island houses an open-air museum of traditional Finnish buildings gathered from around the country, because Finland decided the best way to preserve its rural heritage was to move it to an island in Helsinki and let people wander through it on weekends.", "The island is also home to a large population of red squirrels who have decided that museum visitors are an excellent source of food and have no fear whatsoever. They will approach you. This is considered charming by everyone except the person being approached."],
        },
        {
            name: 'Lauttasaari Beach',
            pos: geoToMap([[60.157, 24.878]])[0],
            district: 'lauttasaari',
            blurb: ["A surprisingly tranquil sandy beach on the southwestern edge of Lauttasaari island, known primarily to locals and the kind of Helsinki resident who has time to cycle to the sea on a Tuesday afternoon, which is more of them than you might expect.", "The beach faces west, which means the evening light is excellent. The water is Baltic, which means the temperature is bracing regardless of season. Regulars call this refreshing. First-timers call it several other things."],
        },
        {
            name: 'Munkkiniemi DiscGolf Range',
            pos: geoToMap([[60.1970, 24.9120]])[0],
            district: 'toolo',
            blurb: ["Finland has more disc golf courses per capita than any other country in the world, and Munkkiniemi is one of the Helsinki courses that helped establish this deeply competitive reputation. The sport is taken seriously. The flying discs are not mocked.", "The course winds through forest and parkland, which means players occasionally have to retrieve their discs from trees, bushes, or the general direction of the sea. This is considered part of the experience."],
        },
        {
            name: 'Kiasma',
            pos: geoToMap([[60.1730, 24.9360]])[0],
            district: 'kamppi',
            blurb: ["Steven Holl's contemporary art museum opened in 1998 and immediately divided Helsinki. The curved, light-flooded building was called a masterpiece. It was called an eyesore. It was called impossible to find the entrance to, which remains partially true.", "Inside, the museum hosts contemporary art that is sometimes challenging, sometimes bewildering, and occasionally just a large pile of something in a white room. Helsinkians visit anyway, because supporting culture is important even when you are not entirely sure what you are looking at."],
        },
        {
            name: 'Helsinki Wheel',
            pos: geoToMap([[60.167, 24.962]])[0],
            district: 'katajanokka',
            blurb: ["The Helsinki Wheel sits on the South Harbour waterfront and offers 360-degree views of the city, the sea, and several other ferries that are significantly larger than the gondola you are sitting in. A full rotation takes about 15 minutes, which is enough time to spot most of the landmarks you just walked past.", "The wheel operates year-round, including in Finnish winter, which means that on particularly cold evenings you can watch the city lights reflect on the ice while sitting in a slowly rotating glass bubble. This is, genuinely, quite beautiful."],
        },
        {
            name: 'Pasila Railway Station',
            pos: geoToMap([[60.2010, 24.9335]])[0],
            district: 'pasila',
            blurb: ["Pasila station is Helsinki's second-busiest railway station, a concrete monument to the Finnish conviction that public transport should be efficient, punctual, and aesthetically indifferent. Commuters pass through daily with the grim resolve of people who have memorised the timetable.", "The station connects directly to the Mall of Tripla, whose name remains one of Finland's great linguistic mysteries. 'Mall' is English. 'Tripla' is... Finnish? Latin? A marketing executive's fever dream? Nobody knows, nobody asked, and 250 shops opened anyway. The Finns shrugged and went shopping."],
        },
        {
            name: 'Pasila Government Agency Center',
            pos: geoToMap([[60.1985, 24.9380]])[0],
            district: 'pasila',
            blurb: ["A cluster of government office buildings where a significant portion of Finland's bureaucracy happens in orderly silence. The Tax Administration, the Patent and Registration Office, and various other agencies operate here with the quiet efficiency that Finns expect from their institutions.", "The buildings are functional in the way that only Nordic government architecture can be — neither ugly enough to complain about nor beautiful enough to photograph. Visitors take a number, wait their turn, and leave with their paperwork sorted. The system works. Nobody is excited about this."],
        },
        {
            name: 'Hietaniemi Cemetery',
            pos: geoToMap([[60.170, 24.910]])[0],
            district: 'toolo',
            blurb: ["Finland's most prestigious cemetery, where presidents, composers, architects, and war heroes rest in carefully maintained silence. Mannerheim is here. Sibelius is not — he chose Ainola, his country house, presumably to avoid the neighbours. Alvar Aalto is here, and his grave is, naturally, architecturally significant.", "The cemetery sits next to the beach, which means that on a summer Saturday, sunbathers and the deceased are separated by approximately one hedge. Helsinkians see no contradiction in this. Life, death, and a decent tan are all part of the same afternoon."],
        },
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

    const kulosaariIsland = geoToMap([
        [60.194, 24.982],
        [60.195, 24.980],
        [60.196, 24.981],
        [60.197, 24.984],
        [60.197, 24.989],
        [60.196, 24.993],
        [60.194, 24.995],
        [60.192, 24.994],
        [60.190, 24.992],
        [60.189, 24.989],
        [60.189, 24.986],
        [60.190, 24.983],
        [60.192, 24.981],
        [60.194, 24.982],
    ]);

    // =========================================================
    // SMALL ISLANDS (decorative, not playable districts)
    // =========================================================
    const islands = [
        {
            name: 'Seurasaari',
            label: true,
            forest: true,
            polygon: geoToMap([
                // Open-air museum island — in the water between Kuusisaari and Töölö coast
                [60.178, 24.898],
                [60.179, 24.897],
                [60.181, 24.896],
                [60.183, 24.898],
                [60.184, 24.900],
                [60.183, 24.903],
                [60.181, 24.904],
                [60.179, 24.903],
                [60.178, 24.901],
                [60.178, 24.898],
            ]),
        },
        {
            name: 'Harakka',
            label: true,
            polygon: geoToMap([
                // Nature island south of Ullanlinna
                [60.144, 24.948],
                [60.145, 24.945],
                [60.146, 24.944],
                [60.148, 24.946],
                [60.148, 24.950],
                [60.147, 24.953],
                [60.146, 24.954],
                [60.145, 24.952],
                [60.144, 24.948],
            ]),
        },
        {
            name: 'Sirpalesaari',
            polygon: geoToMap([
                // Round island south of Eira
                [60.145, 24.930],
                [60.146, 24.928],
                [60.147, 24.929],
                [60.148, 24.932],
                [60.147, 24.935],
                [60.146, 24.936],
                [60.145, 24.934],
                [60.145, 24.930],
            ]),
        },
        {
            name: 'Liuskasaari',
            polygon: geoToMap([
                // Narrow island east of Sirpalesaari
                [60.145, 24.938],
                [60.146, 24.936],
                [60.147, 24.937],
                [60.148, 24.940],
                [60.147, 24.942],
                [60.146, 24.942],
                [60.145, 24.940],
                [60.145, 24.938],
            ]),
        },
        {
            name: 'Uunisaari',
            polygon: geoToMap([
                // Island east of Harakka
                [60.146, 24.955],
                [60.147, 24.953],
                [60.149, 24.954],
                [60.149, 24.958],
                [60.148, 24.960],
                [60.146, 24.959],
                [60.146, 24.955],
            ]),
        },
        {
            name: 'Särkkä',
            polygon: geoToMap([
                // Large island far south-east
                [60.143, 24.962],
                [60.144, 24.960],
                [60.146, 24.961],
                [60.147, 24.964],
                [60.148, 24.968],
                [60.147, 24.972],
                [60.146, 24.973],
                [60.144, 24.971],
                [60.143, 24.968],
                [60.143, 24.962],
            ]),
        },
        {
            name: 'Valkosaari',
            polygon: geoToMap([
                [60.162, 24.955],
                [60.163, 24.954],
                [60.164, 24.955],
                [60.163, 24.957],
                [60.162, 24.955],
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
        {
            name: 'Mustikkamaa',
            label: true,
            polygon: geoToMap([
                // Island just south of Kulosaari
                [60.185, 24.985],
                [60.187, 24.983],
                [60.188, 24.986],
                [60.188, 24.990],
                [60.187, 24.992],
                [60.185, 24.991],
                [60.184, 24.988],
                [60.185, 24.985],
            ]),
        },
        {
            name: 'Suomenlinna',
            label: true,
            polygon: geoToMap([
                // Fortress island south of Helsinki
                [60.146, 24.980],
                [60.148, 24.978],
                [60.150, 24.980],
                [60.151, 24.984],
                [60.150, 24.988],
                [60.148, 24.990],
                [60.146, 24.988],
                [60.145, 24.984],
                [60.146, 24.980],
            ]),
        },
        {
            name: 'Lighthouse Island',
            polygon: geoToMap([
                // Tiny island W of Suomenlinna
                [60.150, 24.968],
                [60.151, 24.967],
                [60.152, 24.968],
                [60.152, 24.970],
                [60.151, 24.971],
                [60.150, 24.970],
                [60.150, 24.968],
            ]),
        },
        {
            name: 'Korkeasaari',
            label: true,
            polygon: geoToMap([
                // Zoo island south of Mustikkamaa
                [60.182, 24.986],
                [60.183, 24.984],
                [60.184, 24.985],
                [60.184, 24.989],
                [60.183, 24.992],
                [60.182, 24.993],
                [60.181, 24.991],
                [60.181, 24.988],
                [60.182, 24.986],
            ]),
        },
        {
            name: 'Possusaari',
            label: true,
            polygon: geoToMap([
                // Small mysterious island — top-right corner of map
                [60.200, 24.991],
                [60.201, 24.990],
                [60.203, 24.991],
                [60.204, 24.993],
                [60.203, 24.996],
                [60.201, 24.997],
                [60.200, 24.995],
                [60.200, 24.991],
            ]),
        },
    ];

    // Swedish names for all districts (Finland is officially bilingual)
    const SWEDISH_NAMES = {
        'lauttasaari': 'Drumsö',
        'jatkasaari': 'Busholmen',
        'ruoholahti': 'Gräsviken',
        'kamppi': 'Kampen',
        'punavuori': 'Rödbergen',
        'eira': 'Eira',
        'ullanlinna': 'Ulrikasborg',
        'kaivopuisto': 'Brunnsparken',
        'kaartinkaupunki': 'Gardesstaden',
        'kluuvi': 'Gloet',
        'kruununhaka': 'Kronohagen',
        'katajanokka': 'Skatudden',
        'kallio': 'Berghäll',
        'hakaniemi': 'Hagnäs',
        'sornainen': 'Sörnäs',
        'kalasatama': 'Fiskehamnen',
        'sompasaari': 'Sompaholmen',
        'merihaka': 'Havshagen',
        'hernesaari': 'Ärtholmen',
        'kaskisaari': 'Granö',
        'lehtisaari': 'Lövö',
        'kuusisaari': 'Granholmen',
        'toolo': 'Tölö',
        'kulosaari': 'Brändö',
        // Islands and other labels
        'Seurasaari': 'Fölisön',
        'Suomenlinna': 'Sveaborg',
        'Mustikkamaa': 'Blåbärslandet',
        'Korkeasaari': 'Högholmen',
        'Harakka': 'Skata',
        'Töölönlahti': 'Tölöviken',
        'Munkkiniemi': 'Munksnäs',
    };

    // Southern forest tip of Lauttasaari
    const lauttasaariForest = geoToMap([
        [60.158, 24.880],   // NW
        [60.156, 24.886],   // N
        [60.154, 24.889],   // NE
        [60.152, 24.888],   // E (Vattuniemi)
        [60.149, 24.884],   // SE tip
        [60.149, 24.879],   // S
        [60.152, 24.879],   // SW (follows concave bay)
        [60.156, 24.879],   // W (inner corner)
        [60.158, 24.880],   // close
    ]);

    return {
        districts,
        coastline,
        lauttasaariIsland,
        lauttasaariForest,
        jatkasaariIsland,
        kaskisaariIsland,
        lehtisaariIsland,
        kuusisaariIsland,
        kulosaariIsland,
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
        SWEDISH_NAMES,
    };
})();
