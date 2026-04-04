// Helsinki Tycoon - Events System
const Events = (() => {

    const EVENT_POOL = [
        // Positive events (month-specific)
        {
            id: 'vappu',
            name: 'Vappu / May Day Celebrations',
            description: 'Helsinki celebrates Vappu! Restaurants and bars are packed.',
            month: 4, // May (0-indexed)
            chance: 1.0, // Always happens
            duration: 1,
            revenueModifier: 0.2,
            affectedTypes: ['restaurant'],
            global: true,
            positive: true,
        },
        {
            id: 'pride',
            name: 'Helsinki Pride Parade',
            description: 'Pride celebrations boost nightlife in Kamppi and Kallio!',
            month: 5, // June
            chance: 1.0,
            duration: 1,
            revenueModifier: 0.2,
            affectedDistricts: ['kamppi', 'kallio', 'punavuori'],
            positive: true,
        },
        {
            id: 'flow_festival',
            name: 'Flow Festival',
            description: 'Flow Festival fills Suvilahti! Nearby businesses boom.',
            month: 7, // August
            chance: 1.0,
            duration: 1,
            revenueModifier: 0.3,
            affectedDistricts: ['sornainen', 'kallio', 'hakaniemi'],
            positive: true,
        },
        {
            id: 'helsinki_festival',
            name: 'Helsinki Festival',
            description: 'Arts and culture festival across the city.',
            month: 7, // August
            chance: 0.8,
            duration: 1,
            revenueModifier: 0.15,
            global: true,
            positive: true,
        },
        {
            id: 'design_week',
            name: 'Helsinki Design Week',
            description: 'Design Week puts Punavuori in the spotlight!',
            month: 8, // September
            chance: 1.0,
            duration: 1,
            revenueModifier: 0.25,
            affectedDistricts: ['punavuori', 'kamppi', 'kluuvi'],
            positive: true,
        },
        {
            id: 'slush',
            name: 'Slush Conference',
            description: 'Tech startups flood Helsinki. Hotels and offices in high demand!',
            month: 10, // November
            chance: 1.0,
            duration: 1,
            revenueModifier: 0.15,
            affectedTypes: ['hotel', 'office'],
            global: true,
            positive: true,
        },
        {
            id: 'christmas_market',
            name: 'Helsinki Christmas Market',
            description: 'Senate Square Christmas market draws visitors!',
            month: 11, // December
            chance: 1.0,
            duration: 1,
            revenueModifier: 0.25,
            affectedDistricts: ['kruununhaka', 'kluuvi', 'kaartinkaupunki'],
            positive: true,
        },
        {
            id: 'lux_helsinki',
            name: 'Lux Helsinki',
            description: 'Light art festival brightens the dark winter.',
            month: 0, // January
            chance: 0.9,
            duration: 1,
            revenueModifier: 0.1,
            global: true,
            positive: true,
        },

        // City council votes — district-specific, medium duration
        {
            id: 'council_tram_kallio',
            name: 'New Tram Line to Kallio',
            description: 'City council approves a new tram extension! Kallio and Sörnäinen enjoy a transport boom.',
            month: -1,
            chance: 0.04,
            duration: 3,
            revenueModifier: 0.2,
            affectedDistricts: ['kallio', 'sornainen'],
            positive: true,
            councilVote: true,
        },
        {
            id: 'council_construction_kamppi',
            name: 'Major Construction in Kamppi',
            description: 'The city council has approved a large underground expansion project. Kamppi businesses suffer disruption for months.',
            month: -1,
            chance: 0.035,
            duration: 3,
            revenueModifier: -0.25,
            affectedDistricts: ['kamppi'],
            positive: false,
            councilVote: true,
        },
        {
            id: 'council_tech_campus',
            name: 'Tech Campus Approved Near Ruoholahti',
            description: 'A new tech campus breaks ground near Ruoholahti. Office demand in the area surges.',
            month: -1,
            chance: 0.035,
            duration: 4,
            revenueModifier: 0.3,
            affectedDistricts: ['ruoholahti', 'jatkasaari'],
            affectedTypes: ['office'],
            positive: true,
            councilVote: true,
        },
        {
            id: 'council_park_eira',
            name: 'New Waterfront Park in Eira',
            description: 'A new public park and promenade is opened along the Eira waterfront. Residential and retail values rise.',
            month: -1,
            chance: 0.03,
            duration: 4,
            revenueModifier: 0.18,
            affectedDistricts: ['eira', 'ullanlinna', 'kaivopuisto'],
            positive: true,
            councilVote: true,
        },
        {
            id: 'council_road_works_kluuvi',
            name: 'Road Works on Mannerheimintie',
            description: 'Major resurfacing of Mannerheimintie begins. Traffic chaos hits Kluuvi and Kruununhaka.',
            month: -1,
            chance: 0.04,
            duration: 2,
            revenueModifier: -0.2,
            affectedDistricts: ['kluuvi', 'kruununhaka'],
            positive: false,
            councilVote: true,
        },
        {
            id: 'council_cultural_toolo',
            name: 'Cultural District Designation for Töölö',
            description: 'City council grants Töölö official cultural district status. Tourism and retail see a sustained boost.',
            month: -1,
            chance: 0.03,
            duration: 4,
            revenueModifier: 0.15,
            affectedDistricts: ['toolo'],
            positive: true,
            councilVote: true,
        },
        {
            id: 'council_waterfront_jatkasaari',
            name: 'Jätkäsaari Harbour Redevelopment',
            description: 'The city approves a major redevelopment of the Jätkäsaari harbour area. Property values rise across the island.',
            month: -1,
            chance: 0.03,
            duration: 4,
            revenueModifier: 0.22,
            affectedDistricts: ['jatkasaari'],
            positive: true,
            councilVote: true,
        },
        {
            id: 'council_noise_ordinance',
            name: 'Noise Ordinance Hits Kallio Nightlife',
            description: 'A new city noise ordinance clamps down on late-night venues in Kallio and Punavuori. Restaurant and bar revenues dip.',
            month: -1,
            chance: 0.03,
            duration: 2,
            revenueModifier: -0.22,
            affectedDistricts: ['kallio', 'punavuori'],
            affectedTypes: ['restaurant'],
            positive: false,
            councilVote: true,
        },
        {
            id: 'council_heritage_kruununhaka',
            name: 'Heritage Zone Status for Kruununhaka',
            description: 'Kruununhaka is declared a protected heritage zone. Short-term costs rise, but prestige lifts long-term values.',
            month: -1,
            chance: 0.025,
            duration: 3,
            revenueModifier: 0.12,
            affectedDistricts: ['kruununhaka', 'katajanokka'],
            positive: true,
            councilVote: true,
        },
        {
            id: 'council_rezoning_sornainen',
            name: 'Sörnäinen Rezoned for Mixed Use',
            description: 'City council rezones a large block in Sörnäinen for mixed residential and commercial use. Investors rush in.',
            month: -1,
            chance: 0.035,
            duration: 3,
            revenueModifier: 0.2,
            affectedDistricts: ['sornainen', 'hakaniemi'],
            positive: true,
            councilVote: true,
        },

        // Negative events (random, can happen any month)
        {
            id: 'recession',
            name: 'Economic Recession',
            description: 'The economy takes a downturn. Revenue drops across the board.',
            month: -1, // Any month
            chance: 0.05, // 5% per month
            duration: 3,
            revenueModifier: -0.2,
            global: true,
            positive: false,
        },
        {
            id: 'construction',
            name: 'Street Construction',
            description: 'Major construction disrupts a district for months.',
            month: -1,
            chance: 0.08,
            duration: 2,
            revenueModifier: -0.3,
            randomDistrict: true,
            positive: false,
        },
        {
            id: 'pipe_burst',
            name: 'Pipe Burst!',
            description: 'A water pipe bursts in one of your properties! Keep properties well-maintained to prevent this.',
            month: -1,
            chance: 0.06,
            duration: 1,
            costRange: [10000, 50000],
            positive: false,
            playerOnly: true,
            conditionScaled: true, // chance & cost scale with avg condition
        },
        {
            id: 'tenant_dispute',
            name: 'Tenant Dispute',
            description: 'A tenant refuses to pay rent this month.',
            month: -1,
            chance: 0.07,
            duration: 1,
            revenueModifier: -1.0, // Lose all revenue from affected property
            randomProperty: true,
            positive: false,
            playerOnly: true,
        },
        {
            id: 'harsh_winter',
            name: 'Harsh Winter',
            description: 'An exceptionally cold winter drives up heating costs.',
            month: -1, // Only triggers in winter months via code
            chance: 0.15,
            duration: 1,
            maintenanceModifier: 0.5,
            global: true,
            positive: false,
            winterOnly: true,
        },
        {
            id: 'market_crash',
            name: 'Market Crash',
            description: 'Property values plummet across Helsinki! Markets will recover in 6 months.',
            month: -1,
            chance: 0.03,
            duration: 6,
            valueModifier: -0.15,
            recoveryModifier: 1.0, // recover to basePrice
            global: true,
            positive: false,
        },

        // Special events
        {
            id: 'alien_invasion',
            name: 'ALIEN INVASION!',
            description: 'Aliens have landed in Helsinki! Property values crash, but tourist boom will push them above normal in 6 months.',
            month: -1,
            chance: 0.012, // ~1.4% per month
            duration: 6,
            valueModifier: -0.5, // Immediate 50% drop
            recoveryModifier: 1.5, // Recovers to 150%
            randomDistrict: true,
            positive: false,
            special: true,
        },
        {
            id: 'tonttu_invasion',
            name: 'TONTTU INVASION!',
            description: 'Finnish house gnomes have appeared on every rooftop! Residents are delighted — residential revenue soars.',
            month: 11, // December
            chance: 0.10, // 10% chance in December
            duration: 2,
            revenueModifier: 0.4,
            affectedTypes: ['residential'],
            global: true,
            positive: true,
            special: true,
        },
        {
            id: 'moose_rush_hour',
            name: 'MOOSE RUSH HOUR!',
            description: 'A herd of moose is stampeding down Mannerheimintie! Some property damage, but tourists go wild.',
            month: -1,
            chance: 0.014,
            duration: 2,
            revenueModifier: 0.25,
            global: true,
            positive: true,
            special: true,
        },
        {
            id: 'nokia_comeback',
            name: 'NOKIA COMEBACK!',
            description: 'Risto announces Nokia is making phones again! Office property values in tech districts skyrocket.',
            month: -1,
            chance: 0.014,
            duration: 4,
            revenueModifier: 0.5,
            affectedTypes: ['office'],
            affectedDistricts: ['ruoholahti', 'jatkasaari', 'kamppi', 'sornainen'],
            positive: true,
            special: true,
        },
        {
            id: 'northern_lights',
            name: 'NORTHERN LIGHTS OVER HELSINKI!',
            description: 'A rare aurora borealis is visible from Helsinki! Tourists flood the city.',
            month: -1,
            winterOnly: true,
            chance: 0.055,
            duration: 1,
            revenueModifier: 0.3,
            global: true,
            positive: true,
            special: true,
        },
        {
            id: 'rubber_duck',
            name: 'GIANT RUBBER DUCK!',
            description: 'A mysterious giant rubber duck has appeared in South Harbour. Nobody knows where it came from.',
            month: -1,
            chance: 0.017,
            duration: 3,
            revenueModifier: 0.1,
            global: true,
            positive: true,
            special: true,
        },
        {
            id: 'angry_bird',
            name: 'ANGRY BIRD!',
            description: 'Something red and round just flew across the Helsinki skyline at incredible speed!',
            month: -1,
            chance: 0.01,
            duration: 1,
            revenueModifier: 0.05,
            global: true,
            positive: true,
            special: true,
        },
        {
            id: 'swedish_invasion',
            name: 'SWEDISH INVASION!',
            description: 'Sweden has temporarily claimed Helsinki! All district signs have been replaced with Swedish names. Du gamla, du fria...',
            month: -1,
            chance: 0.012,
            duration: 3,
            revenueModifier: 0.15,
            global: true,
            positive: true,
            special: true,
        },
        {
            id: 'finnish_silence',
            name: 'THE FINNISH SILENCE',
            description: 'Nothing happened. The city is quiet. This is fine.',
            month: -1,
            chance: 0.008, // ~1% per month — rare
            duration: 1,
            global: true,
            positive: true,
            special: true,
            silenceEvent: true, // flag for game.js to stop all audio
        },
    ];

    function checkEvents(gameState) {
        const month = gameState.month;
        const season = Seasons.getCurrentSeason(month);
        const newEvents = [];

        for (const template of EVENT_POOL) {
            // Skip if already active
            if (gameState.activeEvents.some(e => e.id === template.id)) continue;

            // Nokia Comeback: once per campaign (unless cheat)
            if (template.id === 'nokia_comeback' && gameState.nokiaHasOccurred) continue;

            // Per-event occurrence cap: max 3 times per playthrough (1 for Nokia, handled above)
            if (template.special && gameState.specialEventOccurrences) {
                const count = gameState.specialEventOccurrences[template.id] || 0;
                if (count >= 3) continue;
            }

            // Special events: no easter eggs in the first 6 months
            if (template.special && gameState.turn < 6) continue;

            // Special events: at least 2 months between procs
            if (template.special && (gameState.turn - gameState.lastSpecialEventTurn) < 3) continue;

            // Check month-specific events
            if (template.month >= 0 && template.month !== month) continue;

            // Winter-only check
            if (template.winterOnly && season !== 'winter') continue;

            // Apply dynamic special event multiplier
            let effectiveChance = template.chance;
            if (template.special && gameState.specialEventMultiplier) {
                effectiveChance *= gameState.specialEventMultiplier;
            }

            // Condition-scaled events: chance & cost depend on avg property condition
            let costMultiplier = 1;
            if (template.conditionScaled) {
                const playerProps = gameState.properties.filter(p => p.owner === 'player');
                if (playerProps.length === 0) continue;
                const avgCondition = playerProps.reduce((s, p) => s + p.condition, 0) / playerProps.length;
                if (avgCondition >= 90) continue; // well-maintained = immune
                // Scale: 0% at 90 condition, full chance at 0 condition
                const scale = 1 - (avgCondition / 90);
                effectiveChance = template.chance * scale;
                costMultiplier = 0.5 + 0.5 * scale; // 50%-100% of max cost range
            }

            // Roll for chance
            if (Math.random() > effectiveChance) continue;

            // Prevent same special event from firing twice in a row — swap to a different one
            let chosen = template;
            if (template.special && gameState.lastSpecialEventId && template.id === gameState.lastSpecialEventId) {
                // Find other eligible special events to swap to
                const alternatives = EVENT_POOL.filter(t =>
                    t.special &&
                    t.id !== template.id &&
                    !gameState.activeEvents.some(e => e.id === t.id) &&
                    !(t.id === 'nokia_comeback' && gameState.nokiaHasOccurred) &&
                    (!gameState.specialEventOccurrences || (gameState.specialEventOccurrences[t.id] || 0) < 3) &&
                    (t.month < 0 || t.month === month) &&
                    (!t.winterOnly || season === 'winter')
                );
                if (alternatives.length > 0) {
                    chosen = alternatives[Math.floor(Math.random() * alternatives.length)];
                }
                // If no alternatives, allow the repeat rather than skipping entirely
            }

            // Create event instance
            const event = { ...chosen, remainingDuration: chosen.duration };

            // Assign random district if needed
            if (template.randomDistrict) {
                const districts = HelsinkiDistricts.districts;
                event.affectedDistricts = [districts[Math.floor(Math.random() * districts.length)].id];
            }

            // Assign random player property if needed
            if (template.randomProperty) {
                const playerProps = gameState.properties.filter(p => p.owner === 'player');
                if (playerProps.length > 0) {
                    event.affectedPropertyId = playerProps[Math.floor(Math.random() * playerProps.length)].id;
                } else {
                    continue; // Skip if player has no properties
                }
            }

            // Apply immediate effects
            if (template.costRange) {
                const baseCost = Math.floor(Math.random() * (template.costRange[1] - template.costRange[0])) + template.costRange[0];
                event.immediateCost = Math.floor(baseCost * costMultiplier);
            }

            newEvents.push(event);
        }

        return newEvents;
    }

    function tickEvents(gameState) {
        // Decrease duration of active events, remove expired ones
        gameState.activeEvents = gameState.activeEvents.filter(event => {
            event.remainingDuration--;
            if (event.remainingDuration <= 0) {
                // Apply recovery effects if any
                if (event.recoveryModifier) {
                    for (const prop of gameState.properties) {
                        if (event.global || (event.affectedDistricts && event.affectedDistricts.includes(prop.district))) {
                            prop.price = Math.floor(prop.basePrice * event.recoveryModifier);
                        }
                    }
                }
                return false;
            }
            return true;
        });
    }

    return {
        EVENT_POOL,
        checkEvents,
        tickEvents,
    };
})();
