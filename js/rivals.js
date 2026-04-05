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
        {
            id: 'peter',
            name: 'Peter Vesterbacka',
            shortName: 'Peter',
            color: '#dd2200',
            strategy: 'harbor',
            description: 'Mighty Eagle. Built Angry Birds, now disrupting real estate. Targets waterfront, offices, and anything tunnel-adjacent to Tallinn.',
            preferredTypes: ['office', 'hotel', 'landmark'],
            preferredDistricts: ['jatkasaari', 'katajanokka', 'hernesaari', 'sompasaari', 'ruoholahti', 'kallio'],
            aggressiveness: 0.7,
            startingCapitalMultiplier: 0.8,
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
        peter: [
            "This isn't just real estate. This is an ecosystem.",
            "I've been thinking about disrupting the property market since my Angry Birds days.",
            "When I built Angry Birds, everyone said it was impossible. Then five billion downloads. Think about that.",
            "Real estate is the next big platform. I'm here to launch it.",
            "My red hoodie has closed more deals than your entire portfolio.",
            "Helsinki is the new Silicon Valley. I've been saying this for years.",
            "The tunnel to Tallinn will make all of this worth ten times more. Just wait.",
            "You know what Angry Birds taught me? Aim high, especially when you're behind.",
            "I wear this hoodie to every meeting. It filters out people who judge by appearance.",
            "We should be thinking bigger. Always bigger.",
            "This city has the DNA of a tech superpower. I'm here to unlock it.",
            "I have 23 pitches in my inbox right now. One of them will change everything.",
            "Property values here are nothing compared to what they'll be when the tunnel opens.",
            "I left Rovio to do something even more disruptive. That thing is this.",
            "The best thing about Helsinki is that everyone thinks it's a small city. It's not. It's the world.",
            "In Silicon Valley, nobody asks how big you want to be. They just know: bigger.",
            "My morning routine: coffee, map review, call with investors. In that order.",
            "I pitched this city to 40 global investors last quarter. They're all interested.",
            "You buy properties. I build legacies.",
            "Angry Birds has been downloaded more times than there are people on Earth. I think about scale like that.",
            "The harbour is the key. Connect the harbour to the tunnel to Tallinn. Done. Value explodes.",
            "I don't invest in square metres. I invest in visions.",
            "At Rovio we said: if you can't go global, go home. Same applies here.",
            "This hoodie was on the cover of Wired. The properties I buy will be on the cover of Forbes.",
            "I met the President of China in this hoodie. He was impressed. Or polite. Hard to tell.",
            "Helsinki has 3,000 saunas and the best startup ecosystem in the Nordics. Coincidence? No.",
            "Everyone laughed at Angry Birds. Now I laugh all the way to the property register.",
            "I'm not playing the long game. I'm playing the infinite game.",
            "The best investment I ever made? Saying yes. To everything. Always.",
            "People told me mobile gaming was a fad. The same people now tell me waterfront property is too expensive.",
            "I pitch Helsinki to the world every single week. You're welcome.",
            "My portfolio is a startup. It launches every time I acquire something new.",
            "You know what's undervalued? This city. You know what I'm doing about it? This.",
            "Some people read the news. I make the news. And then I buy the building the news is filmed in.",
            "I've shaken hands with twelve tech billionaires this year. Three are now interested in Helsinki.",
            "There's more energy in this city than in any VC-funded startup in the Valley. Trust me.",
            "The tunnel to Tallinn isn't just transport. It's a bridge to a 100-million-person market.",
            "I don't have an office. I have the world.",
            "When you've launched a product that breaks every download record in history, property feels manageable.",
            "I believe in this city the way I believed in mobile gaming in 2009. That worked out.",
            "My phone has 11 apps and 4,000 unread messages. Only the ones about Helsinki get answered.",
            "What's your five-year plan? Mine involves at least one Baltic tunnel.",
            "I hired a team to track every property listing in Helsinki. Not because I want them all. I want the right ones.",
            "Slush is in my calendar. The after-party is at one of my properties.",
            "Finland is the best-kept secret in global real estate. I'm done keeping it secret.",
            "I have a word for people who say Helsinki is too small: wrong.",
            "I still get messages from people who play Angry Birds every day. These are my people.",
            "Every building I buy is a statement. The statement is: Helsinki is world-class.",
            "You know what Angry Birds and Helsinki have in common? Both changed the world and nobody expected it.",
            "The hoodie stays. Everything else is negotiable.",
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

            // District monopoly bonus: prioritize completing a district
            // Check how many properties rival already has in this district
            const rivalPropsInDistrict = gameState.properties.filter(
                p => p.district === prop.district && p.owner === rival.id
            );
            const totalPropsInDistrict = gameState.properties.filter(
                p => p.district === prop.district
            );
            if (totalPropsInDistrict.length > 0) {
                const percentOwned = rivalPropsInDistrict.length / totalPropsInDistrict.length;
                if (percentOwned >= 0.5) { // Already owns half or more
                    score += (percentOwned * 100); // Strong bonus for near-monopoly
                }
            }

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

    function getPropertyThatCompletesDistrict(rival, gameState) {
        // Find a player property that would give rival a district monopoly
        const rivalProps = gameState.properties.filter(p => p.owner === rival.id);
        const districtCounts = {};

        // Count rival's properties per district
        for (const prop of rivalProps) {
            if (!districtCounts[prop.district]) districtCounts[prop.district] = 0;
            districtCounts[prop.district]++;
        }

        // Find districts where rival almost has monopoly
        for (const [districtId, count] of Object.entries(districtCounts)) {
            const propsInDistrict = gameState.properties.filter(p => p.district === districtId);
            if (count >= propsInDistrict.length - 2) { // Needs ≤2 more to monopolize
                const playerPropsInDistrict = propsInDistrict.filter(p => p.owner === 'player');
                if (playerPropsInDistrict.length > 0) {
                    return playerPropsInDistrict[Math.floor(Math.random() * playerPropsInDistrict.length)];
                }
            }
        }
        return null;
    }

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
            // Prioritize properties that complete a district for them (70% priority)
            let prop = null;
            if (Math.random() < 0.7) {
                prop = getPropertyThatCompletesDistrict(rival, gameState);
            }
            if (!prop) {
                prop = playerProps[Math.floor(Math.random() * playerProps.length)];
            }

            const premium = 1.15 + Math.random() * 0.35; // 115% to 150% of value
            const offerPrice = Math.floor(prop.price * premium);
            return {
                type: 'buy',
                rival,
                property: prop,
                price: offerPrice,
                premium: Math.floor((premium - 1) * 100),
            };
        } else if (rivalProps.length > 1) {
            // Rival offers to SELL one of their properties to you
            // Prefer selling from districts where they don't have monopoly
            const districts = {};
            for (const prop of rivalProps) {
                if (!districts[prop.district]) districts[prop.district] = [];
                districts[prop.district].push(prop);
            }

            let prop = null;
            // Find districts where rival doesn't control everything
            const nonMonopolyDistricts = [];
            for (const [districtId, propsInDist] of Object.entries(districts)) {
                const allInDistrict = gameState.properties.filter(p => p.district === districtId);
                if (propsInDist.length < allInDistrict.length) {
                    nonMonopolyDistricts.push(...propsInDist);
                }
            }

            if (nonMonopolyDistricts.length > 0) {
                prop = nonMonopolyDistricts[Math.floor(Math.random() * nonMonopolyDistricts.length)];
            } else {
                prop = rivalProps[Math.floor(Math.random() * rivalProps.length)];
            }

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

    // === PLAYER OFFER QUIPS ===
    const PLAYER_OFFER_ACCEPT_QUIPS = {
        nalle: [
            "A fair price. I accept — reluctantly.",
            "You drive a hard bargain. Fine. It's yours.",
            "I have better prospects lined up. Take it.",
            "The Wahlroos portfolio doesn't need dead weight. Done.",
            "Consider this a gift. I'll make it back by Thursday.",
            "You're overpaying by my standards. But sure.",
            "I'm liquidating selectively. You benefit today.",
            "My accountant will process this. Don't celebrate yet.",
            "Every empire sheds assets strategically. This is strategy.",
            "Acceptable. I was going to flip it anyway.",
            "You caught me in a generous mood. Rare occurrence.",
            "Fine. I have three acquisitions closing this week anyway.",
            "Take it before I change my mind. I don't often sell.",
            "A Wahlroos knows when to hold and when to fold. Today I fold.",
            "That building served its purpose. Now it serves yours.",
            "I'll use the capital for something grander. Deal.",
            "Sold. My next purchase will make this look trivial.",
            "The numbers work. Barely. But they work.",
            "You negotiated adequately. I'll remember that.",
            "Done. Now if you'll excuse me, I have an empire to run.",
        ],
        hjallis: [
            "Sure! I've got my eye on something bigger anyway!",
            "Deal! Let's shake on it — old school!",
            "You want it? It's yours! Life's too short to haggle!",
            "Sold! Come celebrate at my bar tonight!",
            "Why not! I was thinking about switching things up anyway!",
            "That place was fun, but I've got new plans. Take it!",
            "Done deal! First round's on me tonight!",
            "Ha! Good timing — I need cash for a new venue!",
            "You got it! More money for my next big idea!",
            "Shake on it! I never say no to a good offer!",
            "Perfect! I was just telling my team we need to pivot!",
            "Sold! But you have to keep the rooftop bar open. Promise?",
            "It's a deal! Hjallis moves fast — in and out!",
            "Take it! I've got three new projects cooking!",
            "Yeah, why not? Helsinki has plenty of buildings for everyone!",
            "Done! My accountant will be happy for once!",
            "You drive a fair bargain! I respect that. It's yours!",
            "Absolutely! I'll reinvest in something with a better DJ booth!",
            "Sold! Come to the signing — I'll bring champagne!",
            "Great offer! Let's do it! Life is too short for overthinking!",
        ],
        risto: [
            "The numbers are sound. I accept your offer.",
            "I've modelled this scenario. The sale is optimal.",
            "Acceptable. My portfolio correlation improves without it.",
            "The ROI was declining. Your timing is noted.",
            "I'll reinvest the capital more efficiently. Agreed.",
            "After due analysis, I accept. The math works.",
            "That property no longer fits my risk profile. Done.",
            "Sold. I calculated 14 scenarios. This was the best.",
            "Your offer aligns with my divestment schedule. Agreed.",
            "The yield was suboptimal. You're welcome to it.",
            "I accept. My weighted portfolio improves by 0.3%.",
            "Rational offer. Rational acceptance. Transaction complete.",
            "I was planning to rebalance anyway. Good timing.",
            "The opportunity cost of holding was too high. Sold.",
            "My model suggested selling at this price point. Interesting.",
            "Agreed. I'll allocate the proceeds to higher-yield assets.",
            "The data supports this decision. Accepted.",
            "You've priced this within 2% of my internal valuation. Sold.",
            "Efficient transaction. I appreciate the directness.",
            "Sold. I trust you'll maintain the property's fundamentals.",
        ],
        peter: [
            "Sure! I've got bigger visions to fund anyway!",
            "Deal! This frees up capital for the tunnel project!",
            "You want it? Take it! I'm playing a bigger game!",
            "Sold! I need the cash for something that'll change Helsinki forever!",
            "Done! That building was just a stepping stone anyway!",
            "Absolutely! I'll flip these euros into something ten times bigger!",
            "It's yours! I'm pivoting to waterfront — exclusively!",
            "Take it! Every sale funds my master plan!",
            "Shake on it! In five years you'll see why I sold!",
            "Deal! The tunnel to Tallinn needs investors, and now I have cash!",
            "Sold! When I said I'd disrupt this market, I meant it!",
            "Go for it! I have twelve meetings this week about bigger things!",
            "Done! Think of me when the property values double after the tunnel!",
            "Perfect timing! My Angry Birds instincts say: sell now, buy bigger!",
            "Absolutely! You're buying a building — I'm building a future!",
            "Take it! I was going to reinvest in harbour-side anyway!",
            "Deal! Mighty Eagle approves this transaction!",
            "Sold! Now watch what I do with the proceeds!",
            "Yes! Capital reallocation is the hallmark of a disruptor!",
            "It's yours! The hoodie stays, the building goes!",
        ],
    };

    const PLAYER_OFFER_DECLINE_QUIPS = {
        nalle: [
            "Absolutely not. That property is worth far more to me.",
            "You insult me with that offer. No.",
            "A Wahlroos does not sell on demand.",
            "Come back when you have a serious offer. If ever.",
            "That building is part of something larger. The answer is no.",
            "I didn't build this portfolio to dismantle it at your whim.",
            "No. And don't ask again.",
            "My grandfather would roll in his grave. Declined.",
            "The audacity. No.",
            "That property earns more sleeping than your offer suggests.",
            "Not for sale. Not today. Not to you.",
            "I'll sell when I'm good and ready. Which is never.",
            "Your offer reveals how little you understand valuation.",
            "Declined. I have standards, even in real estate.",
            "That's my best performer. You can't afford what it's worth.",
            "No. Try one of Hjallis's bars — he might be desperate enough.",
            "I'd rather burn it than sell it at that price.",
            "Interesting attempt. The answer remains no.",
            "My portfolio is not a menu you can order from.",
            "No deal. Now stop wasting my time.",
        ],
        hjallis: [
            "Nah, sorry! I love that place too much!",
            "Can't do it! That building has great vibes!",
            "No way! The tenants just started a jazz night!",
            "Sorry pal! That one's a keeper!",
            "Not this one! I've got big plans for it!",
            "Haha, nice try! But that's my baby!",
            "Nope! Ask me about a different one maybe!",
            "Can't sell that! The rooftop parties are legendary!",
            "No deal! But no hard feelings — let's grab a beer!",
            "That's below what I'd take. Maybe bump it up?",
            "Love the hustle, but I'm keeping this one!",
            "Not happening! That location is pure gold!",
            "Sorry! I just renovated the kitchen there. Can't let go!",
            "Nah! My gut says hold. And my gut is never wrong!",
            "Not for sale! But I admire the effort!",
            "Ha! You'd have to double that. At least!",
            "Keep your money! That place is my pride and joy!",
            "No way José! That building's got character!",
            "Can't do it! I promised the staff I'd keep it!",
            "Nice offer, but my heart says no! Maybe next time!",
        ],
        risto: [
            "I've run the analysis. Selling would be suboptimal.",
            "No. The risk-adjusted return exceeds your offer significantly.",
            "Declined. My model values this property 40% higher.",
            "The data doesn't support this transaction.",
            "I'll pass. The yield curve on this asset is exceptional.",
            "That offer is below my calculated floor price.",
            "No. This property anchors my district position.",
            "The numbers don't work. I've checked twice.",
            "Declined. Emotional selling destroys portfolios.",
            "My internal valuation is significantly higher. No.",
            "I've stress-tested keeping this asset. It outperforms.",
            "No. The compounding returns alone justify holding.",
            "That's a 23% discount to fair value. Obviously not.",
            "Declined. Try again when the fundamentals change.",
            "The correlation benefits alone make this a hold.",
            "No. And I have the spreadsheet to prove why.",
            "Below threshold. My model requires at least 15% above market.",
            "Selling here would reduce my portfolio Sharpe ratio. No.",
            "I don't make emotional decisions. The math says no.",
            "Not at this price point. Perhaps revisit next quarter.",
        ],
        peter: [
            "No way! That's going to be worth ten times more after the tunnel!",
            "Can't sell! That building is part of my master plan!",
            "Are you kidding? That's prime tunnel-adjacent real estate!",
            "Nope! I see too much potential there. Way too much!",
            "Not a chance! Helsinki needs visionaries who hold, not sell!",
            "Ha! When the tunnel opens, you'll wish you'd offered more!",
            "No deal! That location is going to be transformative!",
            "I'm building something bigger than one transaction. Pass!",
            "That's like asking me to sell Angry Birds in 2010. Not happening!",
            "No! The Mighty Eagle doesn't retreat!",
            "You're thinking small. That property is thinking big. I keep it!",
            "Declined! That building is going to be on the cover of Forbes!",
            "Not for sale! I pitched that location to three investors already!",
            "Come back after the tunnel opens. Then we'll talk. Maybe!",
            "No way! I've got twelve meetings this week about that building!",
            "That's part of my harbour strategy. Non-negotiable!",
            "Ask again in five years when it's worth five times more!",
            "Negative! Angry Birds taught me: hold your best assets!",
            "No! That building connects to something much bigger!",
            "I'd rather build than sell. That's the disruptor's way!",
        ],
    };

    // === PLAYER OFFER EVALUATION ===

    function evaluatePlayerOffer(rival, property, offerPrice, pctOfMarket, gameState) {
        // Calculate property's ROI
        const propROI = property.revenue / property.price;

        // Calculate rival's average ROI across their portfolio
        const rivalProps = gameState.properties.filter(p => p.owner === rival.id);
        let avgROI = 0;
        if (rivalProps.length > 1) {
            const otherProps = rivalProps.filter(p => p !== property);
            avgROI = otherProps.reduce((sum, p) => sum + p.revenue / p.price, 0) / otherProps.length;
        }

        // Base acceptance chance starts at 0%
        let acceptChance = 0;

        // Premium/discount factor: higher offer = more likely to accept
        // At 100% market value: baseline ~30%
        // At 120%: ~55%, at 140%: ~75%
        // At 80%: ~10%, at 60%: ~0%
        acceptChance += (pctOfMarket - 70) * 1.0; // 0% at 70%, 30% at 100%, 50% at 120%

        // ROI comparison: if this property's ROI is below their average, more willing to sell
        if (avgROI > 0 && propROI < avgROI) {
            acceptChance += 15; // Below-average performer, more willing to part with it
        } else if (avgROI > 0 && propROI > avgROI * 1.3) {
            acceptChance -= 20; // Star performer, reluctant to sell
        }

        // Cash pressure: if rival is low on cash relative to their net worth, more likely to sell
        const cashRatio = rival.money / Math.max(1, rival.netWorth);
        if (cashRatio < 0.05) {
            acceptChance += 20; // Very cash-poor
        } else if (cashRatio < 0.15) {
            acceptChance += 10; // Somewhat cash-poor
        } else if (cashRatio > 0.5) {
            acceptChance -= 10; // Cash-rich, no need to sell
        }

        // Aggressiveness: aggressive rivals hold tighter
        acceptChance -= rival.aggressiveness * 15;

        // Never sell their last property
        if (rivalProps.length <= 1) {
            return false;
        }

        // Random factor: ±10%
        acceptChance += (Math.random() - 0.5) * 20;

        // Clamp between 2% and 95%
        acceptChance = Math.max(2, Math.min(95, acceptChance));

        return Math.random() * 100 < acceptChance;
    }

    function getPlayerOfferQuip(rivalId, accepted) {
        const quips = accepted ? PLAYER_OFFER_ACCEPT_QUIPS[rivalId] : PLAYER_OFFER_DECLINE_QUIPS[rivalId];
        if (!quips) return accepted ? "Deal." : "No deal.";
        return quips[Math.floor(Math.random() * quips.length)];
    }

    return {
        RIVAL_PROFILES,
        initRivals,
        processRivalTurn,
        generateOffer,
        generateAuction,
        processAuctionRound,
        getRandomQuip,
        evaluatePlayerOffer,
        getPlayerOfferQuip,
    };
})();
