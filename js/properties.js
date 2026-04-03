// Helsinki Tycoon - Property System
const Properties = (() => {

    // Real Helsinki businesses and property templates
    // Revenue is 3x realistic for gameplay pacing (ROI ~3-6% monthly)
    const NAMED_PROPERTIES = [
        // === RETAIL ===
        { name: 'Stockmann', type: 'retail', district: 'kluuvi', price: 50000000, revenue: 1200000, description: 'Iconic Helsinki department store', lat: 60.170, lon: 24.941 },
        { name: 'Akateeminen Kirjakauppa', type: 'retail', district: 'kluuvi', price: 5000000, revenue: 105000, description: 'Historic academic bookstore', lat: 60.170, lon: 24.940 },
        { name: 'Forum Shopping Centre', type: 'retail', district: 'kamppi', price: 30000000, revenue: 750000, description: 'Major shopping centre in Kamppi', lat: 60.168, lon: 24.930 },
        { name: 'Citycenter', type: 'retail', district: 'kluuvi', price: 25000000, revenue: 600000, description: 'Shopping centre by Railway Station', lat: 60.171, lon: 24.940 },
        { name: 'Kamppi Centre', type: 'retail', district: 'kamppi', price: 35000000, revenue: 840000, description: 'Bus terminal and shopping complex', lat: 60.170, lon: 24.924 },
        { name: 'Finnkino Tennispalatsi', type: 'retail', district: 'kamppi', price: 12000000, revenue: 300000, description: 'Major movie theatre and entertainment complex', lat: 60.171, lon: 24.922 },
        { name: 'Marimekko Flagship', type: 'retail', district: 'kamppi', price: 3000000, revenue: 75000, description: 'Finnish design icon store', lat: 60.170, lon: 24.923 },
        { name: 'Iittala Store', type: 'retail', district: 'kluuvi', price: 2000000, revenue: 54000, description: 'Finnish glassware on Esplanadi', lat: 60.168, lon: 24.943 },
        { name: 'K-Supermarket Kamppi', type: 'retail', district: 'kamppi', price: 1500000, revenue: 45000, description: 'Grocery store in Kamppi', lat: 60.168, lon: 24.923 },
        { name: 'Hakaniemi Market Hall', type: 'retail', district: 'hakaniemi', price: 8000000, revenue: 180000, description: 'Historic indoor market', lat: 60.182, lon: 24.958 },
        { name: 'Old Market Hall', type: 'retail', district: 'kluuvi', price: 10000000, revenue: 210000, description: 'Vanha Kauppahalli on the harbour', lat: 60.167, lon: 24.953 },

        // === RESTAURANTS & CAFES ===
        { name: 'Fazer Café', type: 'restaurant', district: 'kluuvi', price: 4000000, revenue: 90000, description: 'Legendary Finnish café since 1891', lat: 60.170, lon: 24.939 },
        { name: 'Ravintola Savoy', type: 'restaurant', district: 'kluuvi', price: 6000000, revenue: 135000, description: 'Fine dining with Aalto interior', lat: 60.168, lon: 24.943 },
        { name: 'Sea Horse', type: 'restaurant', district: 'punavuori', price: 2500000, revenue: 60000, description: 'Classic Finnish restaurant since 1934', lat: 60.163, lon: 24.921 },
        { name: 'Zetor', type: 'restaurant', district: 'kamppi', price: 2000000, revenue: 54000, description: 'Tractor-themed Finnish restaurant', lat: 60.170, lon: 24.921 },
        { name: 'Café Regatta', type: 'restaurant', district: 'toolo', price: 500000, revenue: 24000, description: 'Cozy seaside café in Töölö', lat: 60.178, lon: 24.915 },
        { name: 'Ravintola Nokka', type: 'restaurant', district: 'katajanokka', price: 3500000, revenue: 84000, description: 'Nordic fine dining on Katajanokka', lat: 60.170, lon: 24.965 },
        { name: 'Bar Loose', type: 'restaurant', district: 'kamppi', price: 800000, revenue: 30000, description: 'Live music bar in Kamppi', lat: 60.168, lon: 24.924 },
        { name: 'Ravintola Elite', type: 'restaurant', district: 'punavuori', price: 3000000, revenue: 66000, description: 'Artists\' restaurant since 1932', lat: 60.165, lon: 24.920 },
        { name: 'Story', type: 'restaurant', district: 'kruununhaka', price: 3000000, revenue: 75000, description: 'Restaurant at the Old Market Hall', lat: 60.168, lon: 24.952 },

        // === HOTELS ===
        { name: 'Hotel Kämp', type: 'hotel', district: 'kluuvi', price: 20000000, revenue: 540000, description: 'Helsinki\'s most prestigious hotel', lat: 60.170, lon: 24.944 },
        { name: 'Hotel Haven', type: 'hotel', district: 'katajanokka', price: 12000000, revenue: 300000, description: 'Boutique hotel by the harbour', lat: 60.168, lon: 24.958 },
        { name: 'Scandic Grand Marina', type: 'hotel', district: 'katajanokka', price: 15000000, revenue: 360000, description: 'Large hotel in converted warehouse', lat: 60.170, lon: 24.968 },
        { name: 'Radisson Blu Plaza', type: 'hotel', district: 'kluuvi', price: 18000000, revenue: 450000, description: 'Hotel next to Railway Station', lat: 60.172, lon: 24.942 },
        { name: 'Hotel St. George', type: 'hotel', district: 'kamppi', price: 16000000, revenue: 390000, description: 'Design hotel on Yrjönkatu', lat: 60.168, lon: 24.928 },
        { name: 'Clarion Hotel Helsinki', type: 'hotel', district: 'jatkasaari', price: 14000000, revenue: 330000, description: 'Modern hotel in Jätkäsaari', lat: 60.158, lon: 24.907 },
        { name: 'Hotel Lilla Roberts', type: 'hotel', district: 'punavuori', price: 10000000, revenue: 255000, description: 'Boutique hotel in art deco building', lat: 60.163, lon: 24.925 },

        // === LANDMARK / SPECIAL ===
        { name: 'Suvilahti Event Space', type: 'landmark', district: 'sornainen', price: 6000000, revenue: 150000, description: 'Former power plant, event venue', lat: 60.188, lon: 24.963 },
        { name: 'Kansallismuseo', type: 'landmark', district: 'toolo', price: 12000000, revenue: 210000, description: 'National Museum of Finland, Art Nouveau castle', lat: 60.177, lon: 24.929 },

        // === OFFICES ===
        { name: 'Citymarket Ruoholahti', type: 'retail', district: 'ruoholahti', price: 8000000, revenue: 180000, description: 'Large hypermarket serving western Helsinki', lat: 60.162, lon: 24.906 },
        { name: 'Salmisaari Office Park', type: 'office', district: 'ruoholahti', price: 12000000, revenue: 270000, description: 'Modern office complex', lat: 60.168, lon: 24.908 },
        { name: 'Ruoholahti Office Tower', type: 'office', district: 'ruoholahti', price: 8000000, revenue: 195000, description: 'Office tower near canal', lat: 60.167, lon: 24.910 },

        // === HERNESAARI ===
        { name: 'Löyly', type: 'restaurant', district: 'hernesaari', price: 5000000, revenue: 120000, description: 'Iconic public sauna and restaurant by the sea', lat: 60.1495, lon: 24.920 },
        { name: 'Hernesaari Heliport', type: 'landmark', district: 'hernesaari', price: 3000000, revenue: 60000, description: 'Helsinki heliport, scenic flights', lat: 60.149, lon: 24.917 },
        { name: 'Hernesaari Warehouse', type: 'office', district: 'hernesaari', price: 2000000, revenue: 45000, description: 'Industrial warehouse space', lat: 60.151, lon: 24.916 },

        // === KASKISAARI ===
        { name: 'Kaskisaari Luxury Villa', type: 'residential', district: 'kaskisaari', price: 5000000, revenue: 60000, description: 'Ultra-exclusive waterfront villa', lat: 60.173, lon: 24.887 },
        { name: 'Kaskisaari Seaside Mansion', type: 'residential', district: 'kaskisaari', price: 8000000, revenue: 90000, description: 'One of Helsinki\'s most expensive addresses', lat: 60.174, lon: 24.890 },

        // === LEHTISAARI ===
        { name: 'Lehtisaari Waterfront Home', type: 'residential', district: 'lehtisaari', price: 2500000, revenue: 36000, description: 'Upscale family home with sea views', lat: 60.180, lon: 24.883 },
        { name: 'Lehtisaari Café', type: 'restaurant', district: 'lehtisaari', price: 400000, revenue: 15000, description: 'Cozy island café', lat: 60.179, lon: 24.886 },
        { name: 'Lehtisaari Corner Shop', type: 'retail', district: 'lehtisaari', price: 300000, revenue: 9000, description: 'Local convenience store', lat: 60.181, lon: 24.884 },

        // === KALASATAMA ===
        { name: 'REDI Shopping Centre', type: 'retail', district: 'kalasatama', price: 15000000, revenue: 300000, description: 'Massive modern shopping mall with tower complex', lat: 60.188, lon: 24.976 },
        { name: 'Kalasatama Tower Apt', type: 'residential', district: 'kalasatama', price: 1200000, revenue: 18000, description: 'Modern high-rise apartment with sea views', lat: 60.190, lon: 24.977 },
        { name: 'Kalasatama Office Hub', type: 'office', district: 'kalasatama', price: 3000000, revenue: 60000, description: 'New-build office space in growing tech area', lat: 60.191, lon: 24.975 },

        // === SOMPASAARI ===
        { name: 'Sompasaari Loft', type: 'residential', district: 'sompasaari', price: 800000, revenue: 12000, description: 'Converted warehouse loft apartment', lat: 60.185, lon: 24.979 },
        { name: 'Sompasaari Bistro', type: 'restaurant', district: 'sompasaari', price: 500000, revenue: 18000, description: 'Waterfront bistro with harbour views', lat: 60.184, lon: 24.980 },

        // === KAIVOPUISTO ===
        { name: 'Kaivopuisto Embassy Row Villa', type: 'residential', district: 'kaivopuisto', price: 6000000, revenue: 72000, description: 'Grand villa near foreign embassies', lat: 60.157, lon: 24.952 },
        { name: 'Café Ursula', type: 'restaurant', district: 'kaivopuisto', price: 1500000, revenue: 36000, description: 'Classic seaside café at the park edge', lat: 60.155, lon: 24.956 },

        // === KUUSISAARI ===
        { name: 'Kuusisaari Private Villa', type: 'residential', district: 'kuusisaari', price: 7000000, revenue: 84000, description: 'One of Helsinki\'s most secluded luxury homes', lat: 60.185, lon: 24.894 },

        // === KULOSAARI ===
        { name: 'Kulosaari Manor', type: 'residential', district: 'kulosaari', price: 6000000, revenue: 72000, description: 'Grand waterfront manor with private garden', lat: 60.193, lon: 24.988 },
        { name: 'Kulosaari Villa', type: 'residential', district: 'kulosaari', price: 4000000, revenue: 48000, description: 'Elegant villa on a quiet tree-lined street', lat: 60.195, lon: 24.986 },
        { name: 'Kulosaari Casino', type: 'restaurant', district: 'kulosaari', price: 2000000, revenue: 45000, description: 'Historic restaurant overlooking the sea', lat: 60.191, lon: 24.990 },

        // === AFFORDABLE / STARTER PROPERTIES ===
        { name: 'R-kioski Kamppi', type: 'retail', district: 'kamppi', price: 60000, revenue: 3600, description: 'Small newspaper and snack kiosk', lat: 60.169, lon: 24.925 },
        { name: 'R-kioski Sörnäinen', type: 'retail', district: 'sornainen', price: 45000, revenue: 2700, description: 'Corner kiosk near the metro', lat: 60.187, lon: 24.965 },
        { name: 'R-kioski Hakaniemi', type: 'retail', district: 'hakaniemi', price: 55000, revenue: 3300, description: 'Kiosk by Hakaniemi square', lat: 60.183, lon: 24.960 },
        { name: 'Kallio Pizza', type: 'restaurant', district: 'kallio', price: 120000, revenue: 7200, description: 'Popular neighborhood pizzeria', lat: 60.184, lon: 24.949 },
        { name: 'Punavuori Barber', type: 'retail', district: 'punavuori', price: 80000, revenue: 4800, description: 'Hipster barbershop on Iso Roobertinkatu', lat: 60.162, lon: 24.924 },
        { name: 'Kallio Vinyl Bar', type: 'restaurant', district: 'kallio', price: 150000, revenue: 9000, description: 'Trendy vinyl record bar', lat: 60.183, lon: 24.951 },
        { name: 'Lauttasaari Gym', type: 'retail', district: 'lauttasaari', price: 180000, revenue: 9000, description: 'Neighborhood fitness studio', lat: 60.163, lon: 24.874 },
        { name: 'Lauttasaari Pizzeria', type: 'restaurant', district: 'lauttasaari', price: 200000, revenue: 10500, description: 'Popular island pizzeria on Lauttasaarentie', lat: 60.164, lon: 24.885 },
        { name: 'Lauttasaari S-Market', type: 'retail', district: 'lauttasaari', price: 350000, revenue: 15000, description: 'Grocery store serving the island', lat: 60.158, lon: 24.888 },
        { name: 'Kamppi Laundromat', type: 'retail', district: 'kamppi', price: 70000, revenue: 4200, description: 'Self-service laundromat', lat: 60.167, lon: 24.926 },
        { name: 'Sörnäinen Kebab', type: 'restaurant', district: 'sornainen', price: 90000, revenue: 5400, description: 'Late-night kebab shop', lat: 60.186, lon: 24.962 },
        { name: 'Hakaniemi Flower Shop', type: 'retail', district: 'hakaniemi', price: 65000, revenue: 3600, description: 'Small flower shop by the market', lat: 60.181, lon: 24.961 },
        { name: 'Kruununhaka Antiques', type: 'retail', district: 'kruununhaka', price: 110000, revenue: 5400, description: 'Antique shop on a quiet street', lat: 60.173, lon: 24.955 },
        { name: 'Töölö Bakery', type: 'restaurant', district: 'toolo', price: 130000, revenue: 7800, description: 'Artisan bakery near Töölöntori', lat: 60.177, lon: 24.925 },
        { name: 'Jätkäsaari Food Truck Spot', type: 'restaurant', district: 'jatkasaari', price: 35000, revenue: 2400, description: 'Food truck parking permit', lat: 60.153, lon: 24.900 },
        { name: 'Kallio Tattoo Studio', type: 'retail', district: 'kallio', price: 95000, revenue: 5700, description: 'Popular tattoo parlour', lat: 60.182, lon: 24.948 },
        { name: 'Eira Massage Studio', type: 'retail', district: 'eira', price: 100000, revenue: 5400, description: 'Wellness studio near the park', lat: 60.156, lon: 24.928 },

        // === EASTER EGGS ===
        { name: 'Schwerbelastung\'s Penthouse', type: 'residential', district: 'jatkasaari', price: 300000, revenue: 15000, description: 'A mysterious developer\'s luxury penthouse with a suspiciously good Wi-Fi setup', lat: 60.150, lon: 24.899, color: '#cc44ff', easterEgg: true },
        { name: 'Sharetribe Office', type: 'office', district: 'kaartinkaupunki', price: 500000, revenue: 24000, description: 'Marketplace platform company HQ in the heart of Helsinki', lat: 60.166, lon: 24.938, color: '#ff8800', easterEgg: true },
    ];

    // Templates for procedural generation (revenue is 3x realistic for gameplay pacing)
    const RESIDENTIAL_TEMPLATES = [
        { template: 'Art Nouveau apartment in {district}', priceRange: [200000, 600000], revenueRange: [4500, 12000] },
        { template: 'Penthouse in {district}', priceRange: [500000, 2000000], revenueRange: [9000, 30000] },
        { template: 'Studio apartment in {district}', priceRange: [80000, 200000], revenueRange: [1800, 4500] },
        { template: 'Family apartment in {district}', priceRange: [250000, 500000], revenueRange: [5400, 10500] },
        { template: 'Seaside apartment in {district}', priceRange: [350000, 800000], revenueRange: [7500, 15000] },
        { template: 'Renovated flat in {district}', priceRange: [180000, 450000], revenueRange: [3600, 9000] },
        { template: 'Tower apartment in {district}', priceRange: [150000, 350000], revenueRange: [3000, 7500] },
        { template: 'Loft in {district}', priceRange: [300000, 700000], revenueRange: [6000, 13500] },
    ];

    const SHOP_TEMPLATES = [
        { template: 'Kiosk on {street}', priceRange: [30000, 80000], revenueRange: [1500, 4500] },
        { template: 'Boutique on {street}', priceRange: [150000, 400000], revenueRange: [4500, 10500] },
        { template: 'Corner shop in {district}', priceRange: [100000, 250000], revenueRange: [3000, 7500] },
        { template: 'Grocery store in {district}', priceRange: [200000, 500000], revenueRange: [6000, 12000] },
    ];

    const OFFICE_TEMPLATES = [
        { template: 'Coworking space in {district}', priceRange: [300000, 800000], revenueRange: [9000, 21000] },
        { template: 'Startup hub in {district}', priceRange: [400000, 1000000], revenueRange: [12000, 27000] },
        { template: 'Office floor in {district}', priceRange: [500000, 1500000], revenueRange: [15000, 36000] },
    ];

    // Street names per district for procedural generation
    const DISTRICT_STREETS = {
        kamppi: ['Fredrikinkatu', 'Annankatu', 'Yrjönkatu', 'Eerikinkatu'],
        kluuvi: ['Aleksanterinkatu', 'Keskuskatu', 'Mikonkatu', 'Pohjoisesplanadi'],
        punavuori: ['Iso Roobertinkatu', 'Bulevardi', 'Uudenmaankatu', 'Albertinkatu'],
        kallio: ['Hämeentie', 'Fleminginkatu', 'Helsinginkatu', 'Vaasankatu'],
        toolo: ['Runeberginkatu', 'Museokatu', 'Arkadiankatu', 'Töölönkatu'],
        kruununhaka: ['Snellmaninkatu', 'Mariankatu', 'Kirkkokatu', 'Sofiankatu'],
        eira: ['Laivurinkatu', 'Pietarinkatu', 'Tehtaankatu'],
        ullanlinna: ['Neitsytpolku', 'Kapteeninkatu', 'Kasarmikatu'],
        hakaniemi: ['Siltasaarenkatu', 'Hämeentie', 'Toinen linja'],
        katajanokka: ['Luotsikatu', 'Vyökatu', 'Kanavakatu'],
        jatkasaari: ['Tyynenmerenkatu', 'Välimerenkatu', 'Atlantinkatu'],
        lauttasaari: ['Lauttasaarentie', 'Isokaari', 'Heikkiläntie'],
        ruoholahti: ['Itämerenkatu', 'Porkkalankatu'],
        sornainen: ['Sörnäisten rantatie', 'Kuriiritie'],
        merihaka: ['Haapaniemenkatu', 'Merihaka'],
        kaartinkaupunki: ['Kasarmikatu', 'Fabianinkatu', 'Korkeavuorenkatu'],
        hernesaari: ['Hernesaarenkatu', 'Hernesaarenranta'],
        kaskisaari: ['Kaskisaarentie'],
        lehtisaari: ['Lehtisaarentie'],
        kalasatama: ['Kalasatamankatu', 'Työpajankatu', 'Leonkatu'],
        sompasaari: ['Sompasaarenlaituri', 'Sompasaarenaukio'],
        kaivopuisto: ['Itäinen Puistotie', 'Ehrenströmintie', 'Kalliolinnantie'],
        kuusisaari: ['Kuusisaarentie'],
        kulosaari: ['Hopeasalmentie', 'Kulosaaren puistotie', 'Svinhufvudintie'],
    };

    function randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Districts with waterfront access (for seaside apartments)
    const SEASIDE_DISTRICTS = [
        'katajanokka', 'jatkasaari', 'hernesaari', 'kaskisaari', 'lehtisaari',
        'sompasaari', 'kaivopuisto', 'eira', 'lauttasaari', 'kalasatama',
        'kuusisaari', 'kulosaari', 'merihaka', 'ruoholahti', 'kaartinkaupunki',
    ];

    // Point-in-polygon test (ray casting)
    function pointInPolygon(px, py, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            const intersect = ((yi > py) !== (yj > py))
                && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Generate a random position inside a district polygon, spread across it
    function randomPointInDistrict(district, spreadX, spreadY) {
        const [cx, cy] = district.center;
        // Compute polygon bounding box to scale spread for larger districts
        const poly = district.polygon;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const [px, py] of poly) {
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
        }
        const polyW = maxX - minX;
        const polyH = maxY - minY;
        // Use the larger of the passed spread or 70% of the polygon extent
        const sx = Math.max(spreadX, polyW * 0.7);
        const sy = Math.max(spreadY, polyH * 0.7);
        // Try up to 20 times to find a point inside the polygon
        for (let attempt = 0; attempt < 20; attempt++) {
            const x = cx + (Math.random() - 0.5) * sx;
            const y = cy + (Math.random() - 0.5) * sy;
            if (pointInPolygon(x, y, district.polygon)) {
                return [x, y];
            }
        }
        // Fallback: use center with small jitter
        return [cx + (Math.random() - 0.5) * 6, cy + (Math.random() - 0.5) * 4];
    }

    function generateProperties() {
        const properties = [];

        // Add all named properties
        for (const np of NAMED_PROPERTIES) {
            const district = HelsinkiDistricts.districts.find(d => d.id === np.district);
            if (!district) continue;

            const x = HelsinkiDistricts.lonToX(np.lon);
            const y = HelsinkiDistricts.latToY(np.lat);

            const prop = {
                id: np.name.toLowerCase().replace(/\s+/g, '_'),
                name: np.name,
                type: np.type,
                district: np.district,
                districtName: district.name,
                x, y,
                basePrice: np.price,
                price: np.price,
                baseRevenue: np.revenue,
                revenue: np.revenue,
                description: np.description,
                condition: 100,
                upgradeLevel: 1,
                maxUpgrade: 5,
                owner: null, // null = available, 'player', or rival name
                tenantSatisfaction: 80,
            };
            if (np.color) prop.color = np.color;
            if (np.easterEgg) prop.easterEgg = true;
            properties.push(prop);
        }

        // Generate procedural residential properties
        // Hernesaari has no residential real estate (yet)
        const noResidential = ['hernesaari'];
        for (const district of HelsinkiDistricts.districts) {
            if (noResidential.includes(district.id)) continue;

            const count = district.propertyDensity === 'high' ? 4 :
                         district.propertyDensity === 'medium' ? 3 : 2;

            // Exclusive villa-only islands — no apartments, towers, lofts
            const villaOnly = ['kaskisaari', 'kuusisaari', 'kulosaari'];

            for (let i = 0; i < count; i++) {
                // Filter templates based on district character
                let available = RESIDENTIAL_TEMPLATES;
                if (villaOnly.includes(district.id)) {
                    available = available.filter(t => t.template.startsWith('Seaside') || t.template.startsWith('Renovated') || t.template.startsWith('Family'));
                } else if (!SEASIDE_DISTRICTS.includes(district.id)) {
                    available = available.filter(t => !t.template.startsWith('Seaside'));
                }
                const template = available[Math.floor(Math.random() * available.length)];
                const name = template.template.replace('{district}', district.name);
                const price = randomInRange(template.priceRange[0], template.priceRange[1]);
                const revenue = randomInRange(template.revenueRange[0], template.revenueRange[1]);

                // Random position inside district polygon
                const [x, y] = randomPointInDistrict(district, 30, 20);

                properties.push({
                    id: `res_${district.id}_${i}`,
                    name,
                    type: 'residential',
                    district: district.id,
                    districtName: district.name,
                    x, y,
                    basePrice: price,
                    price,
                    baseRevenue: revenue,
                    revenue,
                    description: `Residential property in ${district.name}`,
                    condition: randomInRange(60, 100),
                    upgradeLevel: 1,
                    maxUpgrade: 5,
                    owner: null,
                    tenantSatisfaction: randomInRange(60, 90),
                });
            }

            // Generate a shop or two per district
            const streets = DISTRICT_STREETS[district.id] || [district.name];
            if (district.propertyDensity !== 'low') {
                const shopTemplate = SHOP_TEMPLATES[Math.floor(Math.random() * SHOP_TEMPLATES.length)];
                const street = streets[Math.floor(Math.random() * streets.length)];
                const shopName = shopTemplate.template.replace('{street}', street).replace('{district}', district.name);
                const price = randomInRange(shopTemplate.priceRange[0], shopTemplate.priceRange[1]);
                const revenue = randomInRange(shopTemplate.revenueRange[0], shopTemplate.revenueRange[1]);

                const [shopX, shopY] = randomPointInDistrict(district, 25, 15);
                properties.push({
                    id: `shop_${district.id}_0`,
                    name: shopName,
                    type: 'retail',
                    district: district.id,
                    districtName: district.name,
                    x: shopX,
                    y: shopY,
                    basePrice: price,
                    price,
                    baseRevenue: revenue,
                    revenue,
                    description: `Shop in ${district.name}`,
                    condition: randomInRange(65, 100),
                    upgradeLevel: 1,
                    maxUpgrade: 5,
                    owner: null,
                    tenantSatisfaction: randomInRange(60, 90),
                });
            }

            // Office for select districts
            if (['ruoholahti', 'kamppi', 'kluuvi', 'sornainen', 'jatkasaari', 'hernesaari', 'kalasatama', 'sompasaari'].includes(district.id)) {
                const offTemplate = OFFICE_TEMPLATES[Math.floor(Math.random() * OFFICE_TEMPLATES.length)];
                const officeName = offTemplate.template.replace('{district}', district.name);
                const price = randomInRange(offTemplate.priceRange[0], offTemplate.priceRange[1]);
                const revenue = randomInRange(offTemplate.revenueRange[0], offTemplate.revenueRange[1]);

                const [offX, offY] = randomPointInDistrict(district, 25, 15);
                properties.push({
                    id: `office_${district.id}_0`,
                    name: officeName,
                    type: 'office',
                    district: district.id,
                    districtName: district.name,
                    x: offX,
                    y: offY,
                    basePrice: price,
                    price,
                    baseRevenue: revenue,
                    revenue,
                    description: `Office space in ${district.name}`,
                    condition: randomInRange(70, 100),
                    upgradeLevel: 1,
                    maxUpgrade: 5,
                    owner: null,
                    tenantSatisfaction: randomInRange(65, 90),
                });
            }
        }

        // Enforce minimum spacing between all properties
        enforceSpacing(properties, 14);

        return properties;
    }

    // Push overlapping properties apart so they're all clickable
    function enforceSpacing(properties, minDist) {
        const maxPasses = 20;
        for (let pass = 0; pass < maxPasses; pass++) {
            let moved = false;
            for (let i = 0; i < properties.length; i++) {
                for (let j = i + 1; j < properties.length; j++) {
                    const a = properties[i];
                    const b = properties[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist && dist > 0) {
                        // Push apart along the line between them
                        const overlap = (minDist - dist) / 2;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        // Only move procedural properties (named ones stay put)
                        const aIsNamed = !a.id.startsWith('res_') && !a.id.startsWith('shop_') && !a.id.startsWith('office_');
                        const bIsNamed = !b.id.startsWith('res_') && !b.id.startsWith('shop_') && !b.id.startsWith('office_');
                        if (aIsNamed && bIsNamed) continue; // both named, skip
                        if (!aIsNamed && !bIsNamed) {
                            // both procedural — move both
                            a.x -= nx * overlap;
                            a.y -= ny * overlap;
                            b.x += nx * overlap;
                            b.y += ny * overlap;
                        } else if (aIsNamed) {
                            // only move b
                            b.x += nx * overlap * 2;
                            b.y += ny * overlap * 2;
                        } else {
                            // only move a
                            a.x -= nx * overlap * 2;
                            a.y -= ny * overlap * 2;
                        }
                        moved = true;
                    } else if (dist === 0) {
                        // Exactly same position — nudge randomly
                        b.x += (Math.random() - 0.5) * minDist;
                        b.y += (Math.random() - 0.5) * minDist;
                        moved = true;
                    }
                }
            }
            if (!moved) break;
        }
    }

    function getUpgradeCost(property) {
        if (property.upgradeLevel >= property.maxUpgrade) return null;
        return Math.floor(property.basePrice * 0.1 * property.upgradeLevel);
    }

    function getRepairCost(property) {
        const damage = 100 - property.condition;
        return Math.floor(property.basePrice * 0.001 * damage);
    }

    function upgradeProperty(property) {
        if (property.upgradeLevel >= property.maxUpgrade) return false;
        const oldRevenue = property.revenue;
        property.upgradeLevel++;
        const newRevenue = Math.floor(property.baseRevenue * (1 + (property.upgradeLevel - 1) * 0.2));
        // Ensure at least €1000 increase so the change is visible
        property.revenue = Math.max(newRevenue, oldRevenue + 1000);
        property.price = Math.floor(property.basePrice * (1 + (property.upgradeLevel - 1) * 0.15));
        return true;
    }

    function repairProperty(property) {
        property.condition = 100;
        return true;
    }

    function degradeCondition(property) {
        const degradeAmount = Math.random() * 3 + 1; // 1-4% per month
        property.condition = Math.max(0, property.condition - degradeAmount);
        // Condition affects revenue
        const conditionMultiplier = 0.5 + (property.condition / 100) * 0.5;
        property.revenue = Math.floor(property.baseRevenue * (1 + (property.upgradeLevel - 1) * 0.2) * conditionMultiplier);
    }

    return {
        NAMED_PROPERTIES,
        generateProperties,
        getUpgradeCost,
        getRepairCost,
        upgradeProperty,
        repairProperty,
        degradeCondition,
    };
})();
