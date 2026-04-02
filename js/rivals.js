// Helsinki Tycoon - AI Rivals System
const Rivals = (() => {

    const RIVAL_PROFILES = [
        {
            id: 'nalle',
            name: 'Björn "Nalle" Wahlroos',
            shortName: 'Nalle',
            color: '#ff4444',
            strategy: 'premium', // Targets high-value properties
            description: 'Aggressive financier. Targets premium properties and uses heavy leverage.',
            preferredTypes: ['hotel', 'landmark', 'retail'],
            preferredDistricts: ['kluuvi', 'eira', 'ullanlinna', 'katajanokka'],
            aggressiveness: 0.8,
            startingCapitalMultiplier: 1.0,
        },
        {
            id: 'hjallis',
            name: 'Harry "Hjallis" Harkimo',
            shortName: 'Hjallis',
            color: '#4488ff',
            strategy: 'entertainment', // Targets restaurants, bars, event venues
            description: 'Entertainment mogul. Goes for restaurants, bars, and event venues.',
            preferredTypes: ['restaurant', 'landmark'],
            preferredDistricts: ['kamppi', 'kallio', 'punavuori', 'sornainen'],
            aggressiveness: 0.6,
            startingCapitalMultiplier: 0.8,
        },
        {
            id: 'risto',
            name: 'Risto Siilasmaa',
            shortName: 'Risto',
            color: '#44bbff',
            strategy: 'tech', // Targets offices and modern developments
            description: 'Tech visionary. Invests in offices and modern developments.',
            preferredTypes: ['office', 'retail'],
            preferredDistricts: ['ruoholahti', 'jatkasaari', 'kamppi', 'sornainen'],
            aggressiveness: 0.5,
            startingCapitalMultiplier: 0.9,
        },
    ];

    function initRivals(difficulty, playerStartingMoney, count) {
        const difficultyMods = {
            easy: { capitalMod: 0.5, aggressivenessMod: 0.7 },
            normal: { capitalMod: 1.0, aggressivenessMod: 1.0 },
            hard: { capitalMod: 1.5, aggressivenessMod: 1.3 },
        };
        const mod = difficultyMods[difficulty] || difficultyMods.normal;
        const numRivals = Math.max(0, Math.min(RIVAL_PROFILES.length, count ?? RIVAL_PROFILES.length));

        return RIVAL_PROFILES.slice(0, numRivals).map(profile => ({
            ...profile,
            money: Math.floor(playerStartingMoney * profile.startingCapitalMultiplier * mod.capitalMod),
            aggressiveness: Math.min(1, profile.aggressiveness * mod.aggressivenessMod),
            propertiesOwned: 0,
            netWorth: 0,
        }));
    }

    function processRivalTurn(rival, gameState) {
        const actions = [];
        const availableProperties = gameState.properties.filter(p => p.owner === null && !p.easterEgg);

        if (availableProperties.length === 0) return actions;

        // Score each property for this rival
        const scored = availableProperties.map(prop => {
            let score = 0;

            // Can they afford it?
            if (prop.price > rival.money) return { prop, score: -1 };

            // Type preference
            if (rival.preferredTypes.includes(prop.type)) score += 30;

            // District preference
            if (rival.preferredDistricts.includes(prop.district)) score += 20;

            // Value: revenue/price ratio
            score += (prop.revenue / prop.price) * 1000;

            // Condition bonus
            score += prop.condition * 0.1;

            // Random factor
            score += Math.random() * 15;

            return { prop, score };
        }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

        // Try to buy 0-2 properties per turn based on aggressiveness
        const maxBuys = Math.random() < rival.aggressiveness ? 2 : 1;
        let bought = 0;

        for (const { prop } of scored) {
            if (bought >= maxBuys) break;
            if (prop.price > rival.money) continue;

            // Buy it
            prop.owner = rival.id;
            rival.money -= prop.price;
            rival.propertiesOwned++;
            bought++;

            actions.push({
                type: 'buy',
                rival: rival.shortName,
                property: prop.name,
                district: prop.districtName,
            });
        }

        // Collect revenue from owned properties
        const ownedProps = gameState.properties.filter(p => p.owner === rival.id);
        let revenue = 0;
        for (const prop of ownedProps) {
            revenue += Math.floor(prop.revenue * 0.8); // AI gets slightly less efficient revenue
        }
        rival.money += revenue;

        // Update net worth
        rival.netWorth = rival.money;
        for (const prop of ownedProps) {
            rival.netWorth += prop.price;
        }

        return actions;
    }

    return {
        RIVAL_PROFILES,
        initRivals,
        processRivalTurn,
    };
})();
