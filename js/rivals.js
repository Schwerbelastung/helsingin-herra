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

        return RIVAL_PROFILES.slice(0, numRivals).map(profile => {
            const money = Math.floor(playerStartingMoney * profile.startingCapitalMultiplier * mod.capitalMod);
            return {
                ...profile,
                money,
                aggressiveness: Math.min(1, profile.aggressiveness * mod.aggressivenessMod),
                propertiesOwned: 0,
                netWorth: money, // Start with net worth = cash so scoreboard shows correctly from turn 1
            };
        });
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

    // === RANDOM OFFERS ===
    // After rival turns, there's a chance a rival makes an offer to the player

    function generateOffer(gameState) {
        const activeRivals = gameState.rivals.filter(r => r.netWorth > 0);
        if (activeRivals.length === 0) return null;

        // 8% chance per turn of getting an offer
        if (Math.random() > 0.08) return null;

        const rival = activeRivals[Math.floor(Math.random() * activeRivals.length)];

        // 50/50: buy offer (rival wants to buy your property) or sell offer (rival sells you one of theirs)
        const playerProps = gameState.properties.filter(p => p.owner === 'player');
        const rivalProps = gameState.properties.filter(p => p.owner === rival.id);

        if (Math.random() < 0.5 && playerProps.length > 0) {
            // Rival wants to BUY one of your properties
            const prop = playerProps[Math.floor(Math.random() * playerProps.length)];
            const premium = 1.15 + Math.random() * 0.35; // 115% to 150% of value
            const offerPrice = Math.floor(prop.price * premium);
            return {
                type: 'buy',
                rival,
                property: prop,
                price: offerPrice,
                premium: Math.floor((premium - 1) * 100),
            };
        } else if (rivalProps.length > 0) {
            // Rival offers to SELL one of their properties to you
            const prop = rivalProps[Math.floor(Math.random() * rivalProps.length)];
            const discount = 0.7 + Math.random() * 0.2; // 70% to 90% of value
            const offerPrice = Math.floor(prop.price * discount);
            return {
                type: 'sell',
                rival,
                property: prop,
                price: offerPrice,
                discount: Math.floor((1 - discount) * 100),
            };
        }

        return null;
    }

    // === AUCTION / BIDDING WAR ===

    function scorePropertyForRival(rival, prop) {
        let score = 0;
        if (prop.price > rival.money) return -1;
        if (rival.preferredTypes.includes(prop.type)) score += 30;
        if (rival.preferredDistricts.includes(prop.district)) score += 20;
        score += (prop.revenue / prop.price) * 1000;
        return score;
    }

    function generateAuction(gameState) {
        // 3% chance per turn
        if (Math.random() > 0.03) return null;

        const activeRivals = gameState.rivals.filter(r => r.money > 0);
        if (activeRivals.length === 0) return null;

        const unowned = gameState.properties.filter(p => p.owner === null && !p.easterEgg);
        if (unowned.length === 0) return null;

        // Score each property by how many rivals want it (weighted)
        const candidates = [];
        for (const prop of unowned) {
            let totalInterest = 0;
            const interestedRivals = [];
            for (const rival of activeRivals) {
                const score = scorePropertyForRival(rival, prop);
                if (score > 10) {
                    totalInterest += score;
                    interestedRivals.push({ rival, score });
                }
            }
            if (interestedRivals.length > 0) {
                candidates.push({ prop, totalInterest, interestedRivals });
            }
        }

        if (candidates.length === 0) return null;

        // Weighted random pick — properties with more rival interest are more likely
        const totalWeight = candidates.reduce((s, c) => s + c.totalInterest, 0);
        let roll = Math.random() * totalWeight;
        let chosen = candidates[0];
        for (const c of candidates) {
            roll -= c.totalInterest;
            if (roll <= 0) { chosen = c; break; }
        }

        // Starting bid = 85% of market value
        const startBid = Math.floor(chosen.prop.price * 0.85);
        // Bid increment = 8% of base price
        const increment = Math.floor(chosen.prop.price * 0.08);

        // Determine each rival's max willingness to pay
        const bidders = chosen.interestedRivals.map(({ rival, score }) => {
            // Max bid scales with aggressiveness and how much they want it
            const desire = Math.min(1, score / 50);
            const maxBid = Math.floor(chosen.prop.price * (1 + rival.aggressiveness * 0.4 * desire));
            return {
                rival,
                maxBid: Math.min(maxBid, Math.floor(rival.money * 0.8)), // won't spend >80% of cash
                active: true,
                lastBid: 0,
            };
        }).filter(b => b.maxBid >= startBid); // only rivals who can afford opening bid

        if (bidders.length === 0) return null;

        return {
            property: chosen.prop,
            startBid,
            increment,
            currentBid: startBid,
            round: 0,
            maxRounds: 5,
            bidders,
            playerIn: true,
            playerBid: 0,
            leader: null, // 'player' or rival id
            finished: false,
        };
    }

    function processAuctionRound(auction) {
        // Each active rival decides: bid or drop out
        const results = [];
        const nextBid = auction.currentBid + auction.increment;

        for (const b of auction.bidders) {
            if (!b.active) continue;

            // Probability of staying: depends on how close to their max
            const ratio = nextBid / b.maxBid;
            let stayChance;
            if (ratio < 0.7) stayChance = 0.95;
            else if (ratio < 0.85) stayChance = 0.75;
            else if (ratio < 1.0) stayChance = 0.45;
            else stayChance = 0.1; // over their max, very unlikely to stay

            if (Math.random() < stayChance && nextBid <= b.rival.money * 0.8) {
                b.lastBid = nextBid;
                results.push({ rival: b.rival, action: 'raise', bid: nextBid });
            } else {
                b.active = false;
                results.push({ rival: b.rival, action: 'dropout' });
            }
        }

        return results;
    }

    return {
        RIVAL_PROFILES,
        initRivals,
        processRivalTurn,
        generateOffer,
        generateAuction,
        processAuctionRound,
    };
})();
