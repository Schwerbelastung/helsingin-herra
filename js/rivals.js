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

    const RIVAL_QUIPS = {
        nalle: [
            "I trust you're not finding Helsinki too... competitive?",
            "Another month, another district. You really should keep up.",
            "My grandfather built half of Eira. I intend to rebuild the rest.",
            "The market rewards decisiveness. Something to consider.",
            "I see you've been busy. In the wrong districts, naturally.",
            "Perhaps you'd feel more comfortable investing in Vantaa?",
            "A Wahlroos does not negotiate. We simply acquire.",
            "My monocle costs more than your portfolio. Just an observation.",
            "The view from Eira is magnificent. You should visit sometime — as a tourist.",
            "Banks exist to serve men like me. And to frustrate men like you.",
            "I've made more money this morning than you've made this year.",
            "Do let me know when you're ready to sell. I'll give you a fair price.",
            "Helsinki deserves better than piecemeal ownership. That's why I'm here.",
            "You have ambition, I'll grant you that. Ambition is cheap, of course.",
            "My properties appreciate while yours... fluctuate.",
            "The Wahlroos family has been Finnish since before Finland was Finland.",
            "I once lost a million euros and called it a Tuesday.",
            "Leverage is a tool. In your hands, it seems more like a liability.",
            "I've been buying property since before you knew what interest rates were.",
            "Remarkable. You managed to hold onto that building through the recession.",
            "My accountant handles sums you'd consider winning the lottery.",
            "Helsinki's best addresses are filling up. For you, at least.",
            "I don't worry about competitors. I worry about being bored.",
            "You really should hire a better advisor. No offence to... whoever that is.",
            "A tip: the best deals happen at 6am. I assume you're still asleep then.",
            "My lawyer plays golf with your banker. Something to keep in mind.",
            "I've given more to charity this year than you'll earn in a decade.",
            "The peninsula is mine, eventually. These things take time.",
            "I notice you didn't bid. Wise. Sometimes.",
            "Every empire starts small. Mine started significantly larger than yours.",
            "The Esplanade is not for everyone. The prices ensure that.",
            "You show promise. A dangerous thing, promise, without capital.",
            "I had a dream last night that you almost beat me. Very amusing.",
            "Risto thinks long-term. Hjallis thinks about sports. I think about legacy.",
            "Do you know what the best hedge against inflation is? More property.",
            "I once bought an entire street by accident. Kept it, naturally.",
            "The market is a mirror. It reflects what you're worth.",
            "I find your optimism charming. Financially unwarranted, but charming.",
            "My summer cottage is larger than your entire portfolio. Approximately.",
            "Patience is a virtue I've cultivated alongside my net worth.",
            "You're improving. Still far behind, but improvement is noted.",
            "The harbour view adds 30% to valuation. I knew this in 1987.",
            "I've outlasted three recessions. Have you seen one yet?",
            "Katajanokka has always appreciated. Funny how few people noticed.",
            "I don't compete. I acquire. There's a distinction.",
            "The board at my bank doesn't question my decisions. A fine arrangement.",
            "My children's inheritance is already larger than your net worth.",
            "Helsinki is a small city with large ambitions. Like you, in a way.",
            "Goodnight. I'll be reviewing acquisition targets. Don't stay up.",
            "I had that one earmarked. You got lucky. That won't happen twice.",
        ],
        hjallis: [
            "Hei hei! Hope you're having as much fun as I am!",
            "Life's too short for boring investments. I stick to restaurants.",
            "I was at Hartwall Arena last night. My building, my event, my food stalls.",
            "You like Formula One? I used to race. Now I just buy the venues.",
            "My tenants are always happy. Happy people eat out. That's my philosophy.",
            "Jokerit might be gone but the Helsinki spirit? Very much alive.",
            "Come for a drink sometime! I own the bar.",
            "I made a deal on a handshake this morning. Old school, works every time.",
            "Business is like sport. You have to enjoy it or what's the point?",
            "The best restaurant in Helsinki? I own it. Come by, I'll get you a table.",
            "My buildings have better music than yours. That's a fact.",
            "I heard you almost got that place on Fredrikinkatu. Almost!",
            "Helsinki nightlife is my business. Literally.",
            "People don't invest in joy enough. I invest in nothing else.",
            "I was at three different openings last night. All mine.",
            "You should see the queue outside my Kallio bar on a Friday. Beautiful.",
            "No hard feelings about that property, right? Let's grab a beer.",
            "The energy in this city is incredible. I bottle it and sell it.",
            "I never read financial reports before 11am. Bad for the morning mood.",
            "My accountant says I'm 'aggressively undiversified.' I say I'm focused.",
            "You can't put a price on atmosphere. But I try to anyway.",
            "I shook hands with the mayor again this morning. Good man.",
            "Punavuori is the heart of Helsinki nightlife. And mostly mine.",
            "When I retire, I want a street named after me. Hjalliksenkatu has a ring.",
            "I don't do offices. Too quiet. People are miserable.",
            "My restaurant in Kamppi did 400 covers on Saturday. Not bad, right?",
            "Speed, food, music — that's all life needs. And I provide all three.",
            "I bought that building for the rooftop. Imagine the summer parties.",
            "You have to speculate to accumulate! That's what my dad said.",
            "I nearly bought a boat instead of that property. Glad I didn't.",
            "The press always writes about Nalle. I just work and have fun.",
            "Cheers! Whatever you're drinking, drink it at one of my places.",
            "I love this city. Every street corner has a story. Usually one of mine.",
            "I missed a deal last month because I was at a rally in Estonia. Worth it.",
            "My venues run themselves. That's the secret — great people.",
            "You look tired. Come to my sauna bar in Sörnäinen. Fixed me right up.",
            "I shook hands on three deals this week. Not a single spreadsheet involved.",
            "Risto would put an office there. I put a jazz bar. Helsinki thanks me.",
            "Sport teaches you to move fast and lose gracefully. Good business lessons.",
            "I have a great feeling about Kallio this year. My gut is never wrong.",
            "If it's not fun, why bother? I ask myself this every morning.",
            "I gave my staff a sauna bonus this quarter. Morale is excellent.",
            "Helsinki in summer? Unbeatable. Helsinki in winter? Also unbeatable.",
            "I almost went into politics. Glad I didn't — too much paperwork.",
            "My daughter says I work too much. I invited her to my rooftop party. Problem solved.",
            "The key is to buy what people love. People love to eat, drink, and laugh.",
            "I was the underdog once. Now I own the arena. Keep going!",
            "You missed the opening last week. Great band. One of mine.",
            "Sörnäinen is changing fast. I knew it five years ago. Just saying.",
            "First one there wins. That's what motorsport taught me. And real estate.",
        ],
        risto: [
            "Interesting positioning. Not optimal, but interesting.",
            "I've been modelling district growth trajectories. The data is compelling.",
            "Every office I buy increases productivity in this city. Measurable impact.",
            "The fundamentals here are strong. I ran the numbers twice.",
            "I think about risk-adjusted returns the way others think about weather.",
            "Long-term compounding is the only strategy worth discussing.",
            "I restructured Nokia. This market is considerably more straightforward.",
            "My portfolio has a Sharpe ratio you wouldn't believe.",
            "Have you stress-tested your investments? I have a model, if you need one.",
            "The office market is inefficient. That's where opportunities hide.",
            "I sleep well because I understand my risk exposure.",
            "Helsinki is growing. The north is underdeveloped. The model is clear.",
            "I don't react to market noise. I react to signals.",
            "This city's tech ecosystem is undervalued. I'm correcting that.",
            "I read three reports this morning before you finished breakfast.",
            "Aggressiveness without data is just gambling. Nalle doesn't see this.",
            "Every acquisition I make improves the urban tech infrastructure here.",
            "I mapped all remaining office vacancies by district last quarter.",
            "I don't speculate. I calculate.",
            "The yield on my Ruoholahti properties is 6.2%. Consistently.",
            "I enjoy complexity. Real estate is, at its core, quite solvable.",
            "My due diligence took two weeks. Worth every hour.",
            "Board meetings. Financial modelling. Sauna. Repeat. Good life.",
            "I turned Nokia around with patience and data. Same tools apply here.",
            "Helsinki's startup density is rising. Office demand follows. Simple chain.",
            "I have a simulation that predicts district appreciation within 3% accuracy.",
            "Emotional decisions are expensive. I've measured this.",
            "The marginal value of an additional property depends on portfolio correlation.",
            "I'd explain my strategy but it would take longer than this turn allows.",
            "Compounding interest and compounding ownership. Both work the same way.",
            "I review my positions every Sunday morning. Over coffee. Alone.",
            "You made a reasonable choice there. Suboptimal, but reasonable.",
            "Every building I acquire improves my weighted average yield.",
            "I was on the Nokia board when it felt impossible. This feels very possible.",
            "Patience is a competitive advantage most people underestimate.",
            "I don't celebrate acquisitions. I note them and move on.",
            "The market will catch up to where I'm positioned. It always does.",
            "I enjoy this. Not in the way Hjallis enjoys things — more quietly.",
            "My children are learning to read spreadsheets. Early start matters.",
            "I almost made an impulsive purchase last month. I ran the model again. Didn't.",
            "Helsinki's digital infrastructure investment will lift the east side. I'm there already.",
            "I have no interest in hotels. Too cyclical. Too dependent on emotion.",
            "A calm mind beats a fast one in real estate. I've verified this.",
            "I built software systems that scaled globally. Property scales nicely too.",
            "I'm not competing. I'm executing a plan.",
            "The variance in my monthly returns is 0.4%. I find that satisfying.",
            "You're ahead this month. The model says that changes.",
            "I gave a lecture on compounding returns last week. Your portfolio was an example.",
            "The best time to buy in Ruoholahti was five years ago. Second best: now.",
            "I don't get excited. But if I did, my Jätkäsaari position would warrant it.",
        ],
    };

    function getRandomQuip(rivalId) {
        const quips = RIVAL_QUIPS[rivalId];
        if (!quips) return null;
        return quips[Math.floor(Math.random() * quips.length)];
    }

    function initRivals(difficulty, playerStartingMoney, count) {
        const difficultyMods = {
            easy: { capitalMod: 0.5, aggressivenessMod: 0.7 },
            normal: { capitalMod: 1.0, aggressivenessMod: 1.0 },
            hard: { capitalMod: 1.5, aggressivenessMod: 1.3 },
        };
        const mod = difficultyMods[difficulty] || difficultyMods.normal;
        const numRivals = Math.max(0, Math.min(RIVAL_PROFILES.length, count ?? RIVAL_PROFILES.length));

        // Shuffle profiles so fewer-than-max games get random rivals
        const shuffled = [...RIVAL_PROFILES].sort(() => Math.random() - 0.5);

        return shuffled.slice(0, numRivals).map(profile => {
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
        if (rival.preferredTypes.includes(prop.type)) score += 30;
        if (rival.preferredDistricts.includes(prop.district)) score += 20;
        score += (prop.revenue / prop.price) * 1000;
        return score;
    }

    function generateAuction(gameState) {
        // Cooldowns: 6-month gap and max one per calendar year
        if (gameState.turn - gameState.lastAuctionTurn < 6) return null;
        if (gameState.auctionThisYear) return null;

        // 7% chance per turn
        if (Math.random() > 0.07) return null;

        const activeRivals = gameState.rivals.filter(r => true); // all rivals can participate (loans allowed)
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

        // Prefer properties with multi-rival interest for exciting auctions
        const multiRival = candidates.filter(c => c.interestedRivals.length >= 2);
        const pool = multiRival.length > 0 ? multiRival : candidates;

        // Weighted random pick — properties with more rival interest are more likely
        const totalWeight = pool.reduce((s, c) => s + c.totalInterest, 0);
        let roll = Math.random() * totalWeight;
        let chosen = pool[0];
        for (const c of pool) {
            roll -= c.totalInterest;
            if (roll <= 0) { chosen = c; break; }
        }

        // Starting bid = 65% of market value
        const startBid = Math.floor(chosen.prop.price * 0.65);
        // Bid increment = 8% of base price
        const increment = Math.floor(chosen.prop.price * 0.08);

        // Determine each rival's max willingness to pay
        // Rivals can take loans: budget = cash + up to 50% of their net worth in credit
        const bidders = chosen.interestedRivals.map(({ rival, score }) => {
            const desire = Math.min(1, score / 50);
            const maxWilling = Math.floor(chosen.prop.price * (1 + rival.aggressiveness * 0.4 * desire));
            // Loan budget: rival's current cash + 50% of their owned property value
            const ownedValue = (gameState.properties || [])
                .filter(p => p.owner === rival.id)
                .reduce((s, p) => s + p.price, 0);
            const loanCapacity = Math.floor(ownedValue * 0.5);
            const budget = rival.money + loanCapacity;
            return {
                rival,
                maxBid: Math.min(maxWilling, Math.floor(budget * 0.8)),
                active: true,
                lastBid: 0,
            };
        }).filter(b => b.maxBid >= startBid);

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

            if (Math.random() < stayChance && nextBid <= b.maxBid) {
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
        getRandomQuip,
    };
})();
