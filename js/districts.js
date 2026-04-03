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
            // Large green area north of the city — Keskuspuisto / northern forests
            name: 'Northern Green',
            polygon: geoToMap([
                [60.194, 24.906],
                [60.195, 24.920],
                [60.196, 24.935],
                [60.197, 24.950],
                [60.198, 24.960],
                [60.205, 24.960],
                [60.205, 24.906],
                [60.194, 24.906],
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
            center: geoToMap([[60.160, 24.882]])[0],
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
    ];

    // =========================================================
    // LANDMARKS (for special rendering)
    // =========================================================
    const landmarks = [
        { name: 'Helsinki Cathedral', pos: geoToMap([[60.1695, 24.9527]])[0], district: 'kruununhaka' },
        { name: 'Finlandia Hall', pos: geoToMap([[60.1758, 24.9330]])[0], district: 'toolo' },
        { name: 'Senate Square', pos: geoToMap([[60.1693, 24.9505]])[0], district: 'kruununhaka' },
        { name: 'Railway Station', pos: geoToMap([[60.1713, 24.9414]])[0], district: 'kluuvi' },
        { name: 'Hakaniemi Market', pos: geoToMap([[60.1825, 24.9565]])[0], district: 'hakaniemi' },
        { name: 'Temppeliaukio Church', pos: geoToMap([[60.1750, 24.9250]])[0], district: 'kamppi' },
        { name: 'Allas Sea Pool', pos: geoToMap([[60.1670, 24.9580]])[0], district: 'katajanokka' },
        { name: 'Uspenski Cathedral', pos: geoToMap([[60.1687, 24.9610]])[0], district: 'katajanokka' },
        { name: 'Oodi Library', pos: geoToMap([[60.1740, 24.9385]])[0], district: 'kluuvi' },
        { name: 'Sibelius Monument', pos: geoToMap([[60.1822, 24.9132]])[0], district: 'toolo' },
        { name: 'Hietaniemi Beach', pos: geoToMap([[60.1770, 24.9060]])[0], district: 'toolo' },
        { name: 'Olympic Stadium', pos: geoToMap([[60.1870, 24.9270]])[0], district: 'toolo' },
        { name: 'Linnanmäki', pos: geoToMap([[60.1880, 24.9400]])[0], district: 'kallio' },
        { name: 'Kaivopuisto Observatory', pos: geoToMap([[60.1550, 24.9490]])[0], district: 'kaivopuisto' },
        { name: 'Tähtitorninmäki Observatory', pos: geoToMap([[60.1625, 24.9490]])[0], district: 'kaivopuisto' },
        { name: 'Seurasaari Open-Air Museum', pos: geoToMap([[60.1825, 24.9000]])[0], district: null },
        { name: 'Lauttasaari Beach', pos: geoToMap([[60.1530, 24.880]])[0], district: 'lauttasaari' },
        { name: 'Munkkiniemi DiscGolf Range', pos: geoToMap([[60.1970, 24.9120]])[0], district: 'toolo' },
        { name: 'Kiasma', pos: geoToMap([[60.1730, 24.9360]])[0], district: 'kamppi' },
        { name: 'Helsinki Wheel', pos: geoToMap([[60.167, 24.962]])[0], district: 'katajanokka' },
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
        [60.157, 24.869],   // NW (west shore)
        [60.157, 24.873],   // N centre-west
        [60.156, 24.878],   // N centre-east
        [60.155, 24.883],   // NE
        [60.154, 24.887],   // E
        [60.153, 24.887],   // SE corner
        [60.152, 24.884],   // S
        [60.152, 24.880],   // S
        [60.153, 24.876],   // SW
        [60.154, 24.873],   // W
        [60.155, 24.870],   // W lower
        [60.157, 24.868],   // W tip
        [60.157, 24.869],   // close
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
