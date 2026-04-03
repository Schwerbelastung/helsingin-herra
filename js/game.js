// Helsinki Tycoon - Game State & Turn Management

// Global game state
const GameState = {
    money: 50000,
    month: 0, // 0 = January
    year: 2024,
    turn: 1,
    actionsRemaining: 4,
    actionsPerTurn: 4,
    difficulty: 'normal',
    mode: 'campaign',
    properties: [],
    rivals: [],
    activeEvents: [],
    staff: [], // hired staff IDs, e.g. ['maintenance', 'manager']
    loanAmount: 0,
    loanInterestRate: 0.05, // 5% annual
    winTarget: 50000000,
    playerName: 'The Tycoon of Helsinki',
    playerGender: 'male', // 'male' or 'female'
    yearlyLog: [], // { type, text, month } entries for newspaper generation
    usedFillerIndices: [], // track which filler stories have been shown
    usedRivalFillerIndices: {}, // track which rival filler stories have been shown per rival
    gameOver: false,
    nokiaHasOccurred: false, // Nokia Comeback can only trigger once per campaign
    lastSpecialEventTurn: -3, // turn when last special event triggered (cooldown: 2 months)
    specialEventMultiplier: 1.0, // dynamic easter egg chance multiplier (halved on proc, doubled if dry year)
    specialEventThisYear: false, // tracks if any special event fired this calendar year
    specialEventOccurrences: {}, // tracks how many times each special event has fired (max 3, 1 for Nokia)
    lastSpecialEventId: null, // ID of the last special event that fired (prevent back-to-back repeats)
    totalRevenueEarned: 0,
    financeHistory: [], // { turn, revenue, maintenance, loanPayment, staffSalaries, netIncome, netWorth, cash }
};

// Undo snapshot — stores state before last player action
let undoSnapshot = null;

const Game = (() => {

    function start(capital, difficulty, mode, rivalCount, target, playerName, playerGender) {
        // Set starting money
        GameState.money = capital === 'wealthy' ? 2000000 : 200000;
        GameState.playerName = playerName || 'The Tycoon of Helsinki';
        GameState.playerGender = playerGender || 'male';
        GameState.difficulty = difficulty;
        GameState.mode = mode;
        GameState.staff = [];
        GameState.financeHistory = [];
        GameState.yearlyLog = [];
        GameState.usedFillerIndices = [];
        GameState.usedRivalFillerIndices = {};
        GameState.nokiaHasOccurred = false;
        GameState.lastSpecialEventTurn = -3;
        GameState.specialEventMultiplier = 1.0;
        GameState.specialEventThisYear = false;
        GameState.specialEventOccurrences = {};
        GameState.lastSpecialEventId = null;

        // Difficulty settings
        const diffSettings = {
            easy: { actionsPerTurn: 5, interestRate: 0.03 },
            normal: { actionsPerTurn: 4, interestRate: 0.05 },
            hard: { actionsPerTurn: 3, interestRate: 0.08 },
        };
        const settings = diffSettings[difficulty] || diffSettings.normal;
        GameState.actionsPerTurn = settings.actionsPerTurn;
        GameState.actionsRemaining = settings.actionsPerTurn;
        GameState.loanInterestRate = settings.interestRate;

        // Win targets
        if (mode === 'campaign') {
            GameState.winTarget = target || 50000000;
        }

        // Generate properties
        GameState.properties = Properties.generateProperties();

        // Init rivals
        GameState.rivals = Rivals.initRivals(difficulty, GameState.money, rivalCount != null ? rivalCount : 3);

        // Update UI
        const season = Seasons.getCurrentSeason(GameState.month);
        MapRenderer.setSeason(season);
        UI.updateHUD(GameState);
        MapRenderer.render();

        // Start ambient music
        Sound.setSeason(season);
        Sound.startMusic();

        UI.setNewsText(`Tervetuloa, ${GameState.playerName}! Start building your real estate empire. Click on properties to buy them.`);

        // Show day 1 newspaper
        const day1Paper = Newspaper.generateDay1Paper(GameState);
        UI.showNewspaperPrompt(day1Paper);
    }

    function logYearlyEvent(type, text, extra) {
        const entry = { type, text, month: GameState.month, year: GameState.year };
        if (extra) Object.assign(entry, extra);
        GameState.yearlyLog.push(entry);
    }

    function endTurn() {
        if (GameState.gameOver) return;

        Sound.playEndTurn();

        // 1. Process monthly finances (staff salary deducted here)
        const financeSummary = Economy.processMonthlyFinances(GameState);
        GameState.totalRevenueEarned += Math.max(0, financeSummary.revenue);

        // 1b. Process staff effects
        const staffResults = Staff.processStaffEffects(GameState);

        // 2. Process rival turns
        const allRivalActions = [];
        for (const rival of GameState.rivals) {
            const actions = Rivals.processRivalTurn(rival, GameState);
            allRivalActions.push(...actions);
        }
        if (allRivalActions.length > 0) {
            Sound.playRivalAction();
            for (const a of allRivalActions) {
                logYearlyEvent('rival_buy', `${a.rival} bought ${a.property} in ${a.district || 'Helsinki'}`);
            }
        }

        // 3. Tick existing events
        Events.tickEvents(GameState);

        // 4. Check for new events
        const newEvents = Events.checkEvents(GameState);
        for (const event of newEvents) {
            GameState.activeEvents.push(event);

            // Nokia Comeback: show press release dialog, mark as occurred
            if (event.id === 'nokia_comeback') {
                GameState.nokiaHasOccurred = true;
                UI.showNokiaAnnouncement();
            }

            // Log event for newspaper
            logYearlyEvent(event.special ? 'special_event' : 'event', event.name);

            // Track special event cooldown and dynamic probability
            if (event.special) {
                GameState.lastSpecialEventTurn = GameState.turn;
                GameState.specialEventMultiplier *= 0.5; // halve chances for rest of year
                GameState.specialEventThisYear = true;
                // Track occurrence count (max 3 per event per playthrough)
                if (!GameState.specialEventOccurrences) GameState.specialEventOccurrences = {};
                GameState.specialEventOccurrences[event.id] = (GameState.specialEventOccurrences[event.id] || 0) + 1;
                GameState.lastSpecialEventId = event.id;
            }

            // Play event sound
            if (event.id === 'swedish_invasion') {
                Sound.playSwedishAnthem();
            } else if (event.special) {
                Sound.playEventSpecial();
            } else if (event.positive) {
                Sound.playEventPositive();
            } else {
                Sound.playEventNegative();
            }

            // Apply immediate costs
            if (event.immediateCost) {
                GameState.money -= event.immediateCost;
            }

            // Apply value modifier to affected districts (or all if global)
            if (event.valueModifier) {
                for (const prop of GameState.properties) {
                    if (event.global || (event.affectedDistricts && event.affectedDistricts.includes(prop.district))) {
                        prop.price = Math.floor(prop.price * (1 + event.valueModifier));
                    }
                }
            }
        }

        // 5. Record financial history
        GameState.financeHistory.push({
            turn: GameState.turn,
            revenue: financeSummary.revenue,
            maintenance: financeSummary.maintenance,
            loanPayment: financeSummary.loanPayment,
            staffSalaries: financeSummary.staffSalaries,
            netIncome: financeSummary.netIncome,
            netWorth: Economy.calculateNetWorth(GameState),
            cash: GameState.money,
        });
        if (GameState.financeHistory.length > 120) GameState.financeHistory.shift();

        // 6. Advance time
        const prevMonth = GameState.month;
        GameState.month = (GameState.month + 1) % 12;
        if (GameState.month === 0) GameState.year++;
        GameState.turn++;
        GameState.actionsRemaining = GameState.actionsPerTurn + Staff.getActionsBonus(GameState);

        // 6b. Newspaper: show prompt in January, auto-dismiss in March
        if (GameState.month === 0 && GameState.turn > 1) {
            // January — generate year-in-review for the year that just ended
            const reviewYear = GameState.year - 1;
            const paper = Newspaper.generateYearlyPaper(GameState, GameState.yearlyLog, reviewYear);
            UI.showNewspaperPrompt(paper);
            // Clear yearly log for new year
            GameState.yearlyLog = GameState.yearlyLog.filter(e => e.year >= GameState.year);
            // Adjust special event probability for the new year
            if (GameState.specialEventThisYear) {
                // Had an event last year — reset to baseline
                GameState.specialEventMultiplier = 1.0;
            } else {
                // Dry year — double the chances (capped at 4x)
                GameState.specialEventMultiplier = Math.min(4.0, GameState.specialEventMultiplier * 2);
            }
            GameState.specialEventThisYear = false;
        } else if (GameState.month === 2) {
            // March — auto-dismiss if still showing
            UI.hideNewspaperPrompt();
        }

        // 7. Update season visuals and music
        const season = Seasons.getCurrentSeason(GameState.month);
        MapRenderer.setSeason(season);
        Sound.setSeason(season);

        // 8. Show turn summary
        UI.showTurnSummary({
            ...financeSummary,
            rivalActions: allRivalActions,
            newEvents,
            staffResults,
        });

        // 9. Check win condition
        if (GameState.mode === 'campaign') {
            const netWorth = Economy.calculateNetWorth(GameState);
            if (netWorth >= GameState.winTarget) {
                GameState.gameOver = true;
                Achievements.checkWin(GameState);
                Sound.playVictory();
                UI.showWinScreen();
            }
        }

        // 10. Check bankruptcy
        if (GameState.money < -100000) {
            GameState.gameOver = true;
            Sound.playBankrupt();
            UI.setNewsText('GAME OVER: You have gone bankrupt!');
            alert('Game Over!\n\nYou have gone bankrupt.\nFinal turn: ' + GameState.turn);
        }

        // 11. Check achievements
        Achievements.check(GameState);

        // 12. Update display
        UI.updateHUD(GameState);
        MapRenderer.render();

        // 13. Show achievement notifications
        UI.showPendingAchievements();

        // 14. Clear undo (can't undo after ending turn)
        undoSnapshot = null;
        const undoBtn = document.getElementById('btn-undo');
        if (undoBtn) undoBtn.disabled = true;

        // 15. Check for auction or rival offer (not both same turn)
        if (!GameState.gameOver && GameState.rivals.length > 0) {
            const auction = Rivals.generateAuction(GameState);
            if (auction) {
                startAuction(auction);
            } else {
                const offer = Rivals.generateOffer(GameState);
                if (offer) {
                    pendingOffer = offer;
                    UI.showOfferDialog(offer);
                }
            }
        }

        // 16. Auto-save
        autoSave();
    }

    // === UNDO SYSTEM ===
    function saveUndoSnapshot() {
        undoSnapshot = {
            money: GameState.money,
            actionsRemaining: GameState.actionsRemaining,
            properties: GameState.properties.map(p => ({
                id: p.id, owner: p.owner, price: p.price, revenue: p.revenue,
                condition: p.condition, upgradeLevel: p.upgradeLevel,
            })),
        };
        const btn = document.getElementById('btn-undo');
        if (btn) btn.disabled = false;
    }

    function undo() {
        if (!undoSnapshot) return false;
        GameState.money = undoSnapshot.money;
        GameState.actionsRemaining = undoSnapshot.actionsRemaining;
        for (const snap of undoSnapshot.properties) {
            const prop = GameState.properties.find(p => p.id === snap.id);
            if (prop) {
                prop.owner = snap.owner;
                prop.price = snap.price;
                prop.revenue = snap.revenue;
                prop.condition = snap.condition;
                prop.upgradeLevel = snap.upgradeLevel;
            }
        }
        undoSnapshot = null;
        const btn = document.getElementById('btn-undo');
        if (btn) btn.disabled = true;
        Sound.playClick();
        UI.updateHUD(GameState);
        UI.hidePropertyPanel();
        UI.setNewsText('Action undone.');
        UI.addLogAction('Undid last action');
        MapRenderer.render();
        return true;
    }

    // === OFFER SYSTEM ===
    let pendingOffer = null;

    function acceptOffer() {
        if (!pendingOffer) return;
        const offer = pendingOffer;
        pendingOffer = null;

        if (offer.type === 'buy') {
            // Rival buys player's property
            GameState.money += offer.price;
            offer.property.owner = offer.rival.id;
            offer.rival.money -= offer.price;
            offer.rival.propertiesOwned++;
            Sound.playSell();
            UI.setNewsText(`Sold ${offer.property.name} to ${offer.rival.shortName} for €${UI.formatMoney(offer.price)}!`);
            UI.addLogAction(`Sold ${offer.property.name} to ${offer.rival.shortName} for €${UI.formatMoney(offer.price)} (+${offer.premium}% premium)`);
        } else {
            // Player buys rival's property
            if (GameState.money < offer.price) {
                UI.setNewsText(GameState.playerName + " can't afford this property right now!");
                document.getElementById('offer-overlay').classList.add('hidden');
                return;
            }
            GameState.money -= offer.price;
            offer.property.owner = 'player';
            offer.rival.money += offer.price;
            offer.rival.propertiesOwned--;
            Sound.playBuy();
            UI.setNewsText(`Bought ${offer.property.name} from ${offer.rival.shortName} for €${UI.formatMoney(offer.price)}!`);
            UI.addLogAction(`Bought ${offer.property.name} from ${offer.rival.shortName} for €${UI.formatMoney(offer.price)} (${offer.discount}% discount)`);
        }

        document.getElementById('offer-overlay').classList.add('hidden');
        UI.updateHUD(GameState);
        MapRenderer.render();
    }

    function declineOffer() {
        if (!pendingOffer) return;
        const name = pendingOffer.rival.shortName;
        pendingOffer = null;
        document.getElementById('offer-overlay').classList.add('hidden');
        Sound.playClick();
        UI.setNewsText(`${GameState.playerName} declined ${name}'s offer.`);
    }

    // === AUCTION / BIDDING WAR ===
    let activeAuction = null;

    function startAuction(auction) {
        activeAuction = auction;
        // Pause normal music, start auction music
        Sound.stopMusic();
        Sound.playAuctionStart();
        setTimeout(() => Sound.startAuctionMusic(), 800);
        // Show the auction UI
        UI.showAuctionDialog(auction);
    }

    function auctionPlayerRaise() {
        if (!activeAuction || activeAuction.finished) return;
        const a = activeAuction;
        const nextBid = a.currentBid + a.increment;

        if (GameState.money < nextBid) {
            UI.setNewsText(GameState.playerName + " can't afford to raise!");
            return;
        }

        Sound.playAuctionBid();
        a.playerBid = nextBid;
        a.currentBid = nextBid;
        a.leader = 'player';
        a.round++;

        if (a.round >= a.maxRounds) {
            // Process final rival responses then end
            const results = Rivals.processAuctionRound(a);
            // Check if a rival outbid us in the final round
            for (const r of results) {
                if (r.action === 'raise' && r.bid > a.currentBid) {
                    a.currentBid = r.bid;
                    a.leader = r.rival.id;
                }
            }
            UI.updateAuctionRound(a, results);
            setTimeout(() => finishAuction(), 1200);
            return;
        }

        // Rivals respond
        const results = Rivals.processAuctionRound(a);

        // Check if any rival raised above us
        let highestRivalBid = 0;
        let highestRivalBidder = null;
        for (const r of results) {
            if (r.action === 'raise' && r.bid > highestRivalBid) {
                highestRivalBid = r.bid;
                highestRivalBidder = r.rival;
            }
        }

        if (highestRivalBid > a.currentBid) {
            a.currentBid = highestRivalBid;
            a.leader = highestRivalBidder.id;
        }

        // Check if all rivals dropped
        const activeRivals = a.bidders.filter(b => b.active);
        if (activeRivals.length === 0) {
            UI.updateAuctionRivals(a, results);
            setTimeout(() => finishAuction(), 800);
            return;
        }

        // Play rival sounds with delays for drama
        let delay = 300;
        for (const r of results) {
            setTimeout(() => {
                if (r.action === 'raise') Sound.playAuctionRivalBid();
                else Sound.playAuctionDropout();
            }, delay);
            delay += 400;
        }

        UI.updateAuctionRound(a, results);
    }

    function auctionPlayerDropout() {
        if (!activeAuction || activeAuction.finished) return;
        const a = activeAuction;
        a.playerIn = false;
        Sound.playClick();

        // Simulate remaining rounds without player
        while (a.round < a.maxRounds) {
            a.round++;
            const results = Rivals.processAuctionRound(a);
            // Update current bid to highest active rival
            for (const r of results) {
                if (r.action === 'raise' && r.bid > a.currentBid) {
                    a.currentBid = r.bid;
                    a.leader = r.rival.id;
                }
            }
            a.currentBid += a.increment;
            const activeRivals = a.bidders.filter(b => b.active);
            if (activeRivals.length <= 1) break;
        }

        // Determine winner among remaining rivals
        const activeRivals = a.bidders.filter(b => b.active);
        if (activeRivals.length > 0) {
            a.leader = activeRivals[0].rival.id;
            a.currentBid = activeRivals[0].lastBid || a.currentBid;
        }

        finishAuction();
    }

    function finishAuction() {
        if (!activeAuction) return;
        const a = activeAuction;
        a.finished = true;

        Sound.stopAuctionMusic();

        if (a.leader === 'player' && a.playerIn) {
            // Player wins!
            GameState.money -= a.currentBid;
            a.property.owner = 'player';
            Sound.playAuctionWin();
            UI.showAuctionResult(a, true, `${GameState.playerName} won ${a.property.name} for €${UI.formatMoney(a.currentBid)}!`);
            UI.setNewsText(`Won auction: ${a.property.name} for €${UI.formatMoney(a.currentBid)}!`);
            UI.addLogAction(`Won auction: ${a.property.name} for €${UI.formatMoney(a.currentBid)}`);
            logYearlyEvent('auction', `${GameState.playerName} won a heated bidding war for ${a.property.name}, paying €${UI.formatMoney(a.currentBid)}`, { winnerId: 'player' });
        } else if (a.leader) {
            // A rival wins
            const winner = a.bidders.find(b => b.rival.id === a.leader);
            if (winner) {
                a.property.owner = winner.rival.id;
                winner.rival.money -= a.currentBid;
                winner.rival.propertiesOwned++;
            }
            Sound.playAuctionLose();
            const winnerName = winner ? winner.rival.shortName : 'Unknown';
            UI.showAuctionResult(a, false, `${winnerName} won ${a.property.name} for €${UI.formatMoney(a.currentBid)}.`);
            logYearlyEvent('auction', `${winnerName} outbid the competition for ${a.property.name}, paying €${UI.formatMoney(a.currentBid)}`, { winnerId: winner ? winner.rival.id : null });
            UI.setNewsText(`${winnerName} won the auction for ${a.property.name}.`);
            UI.addLogAction(`${winnerName} won auction: ${a.property.name} for €${UI.formatMoney(a.currentBid)}`);
        } else {
            // Nobody bid — property stays unowned
            Sound.playAuctionLose();
            UI.showAuctionResult(a, false, `No bidders — ${a.property.name} remains unsold.`);
        }

        UI.updateHUD(GameState);
        MapRenderer.render();
    }

    function closeAuction() {
        activeAuction = null;
        document.getElementById('auction-overlay').classList.add('hidden');
        // Resume normal music
        Sound.startMusic();
    }

    // === CHEAT TRIGGERS ===
    function cheatBiddingWar() {
        if (GameState.rivals.length === 0) { UI.setNewsText('No rivals to bid against!'); return; }
        // Force-generate an auction (ignore the 3% chance)
        const unowned = GameState.properties.filter(p => p.owner === null && !p.easterEgg);
        if (unowned.length === 0) { UI.setNewsText('No properties available for auction!'); return; }
        // Temporarily override Math.random to guarantee auction generation
        const origRandom = Math.random;
        Math.random = () => 0; // always passes the 3% check and maximizes rival interest
        const auction = Rivals.generateAuction(GameState);
        Math.random = origRandom;
        if (auction) {
            startAuction(auction);
        } else {
            UI.setNewsText('Could not generate auction — rivals may not be interested in remaining properties.');
        }
    }

    function cheatRivalOffer() {
        if (GameState.rivals.length === 0) { UI.setNewsText('No rivals!'); return; }
        const origRandom = Math.random;
        Math.random = () => 0;
        const offer = Rivals.generateOffer(GameState);
        Math.random = origRandom;
        if (offer) {
            pendingOffer = offer;
            UI.showOfferDialog(offer);
        } else {
            UI.setNewsText('No offer could be generated — need player or rival properties.');
        }
    }

    function cheatEasterEgg() {
        const options = [
            'polar_bears', 'alien_invasion',
            'tonttu_invasion', 'moose_rush_hour', 'nokia_comeback',
            'northern_lights', 'rubber_duck', 'angry_bird', 'swedish_invasion',
        ];
        // Remove any already active
        const available = options.filter(id => !GameState.activeEvents.some(e => e.id === id));
        if (available.length === 0) {
            UI.setNewsText('All easter eggs are already active!');
            return;
        }
        const pick = available[Math.floor(Math.random() * available.length)];

        const cheatMessages = {
            polar_bears: 'BREAKING: Polar bears spotted swimming near the coastline! Check the shores of Helsinki!',
            alien_invasion: 'ALERT: Unidentified flying objects detected over Helsinki! Look up — and hold onto your properties!',
            tonttu_invasion: 'Pssst... tiny red hats have been spotted on rooftops across Helsinki. Look at your properties!',
            moose_rush_hour: 'TRAFFIC UPDATE: A herd of moose is stampeding down Mannerheimintie! Find the main road!',
            nokia_comeback: 'TECH NEWS: Nokia announces return to mobile phones! Office values surge in tech districts!',
            northern_lights: 'Look up... the sky over Helsinki is glowing. A rare aurora borealis illuminates the night.',
            rubber_duck: 'HARBOUR MYSTERY: Something large and yellow has appeared in South Harbour. What could it be?',
            angry_bird: 'EYEWITNESS: Something red, round, and very angry just launched across the Helsinki sky!',
            swedish_invasion: 'BREAKING: Swedish flags spotted across Helsinki! District signs are being replaced... Du gamla, du fria!',
        };

        // Check if seasonal cheat is out of season
        const currentSeason = Seasons.getCurrentSeason(GameState.month);
        const seasonalWarnings = {
            polar_bears: 'winter',
            tonttu_invasion: 'winter',
            northern_lights: 'winter',
        };
        const winterHints = [
            'Something stirs in the cold... but it\'s not cold enough yet.',
            'The conditions aren\'t right. Perhaps when Helsinki freezes over...',
            'Nothing happens. Some things only reveal themselves in the darkest months.',
            'You feel a strange anticipation... but the season is wrong.',
            'Not yet. Wait for the frost and the long nights.',
        ];
        if (seasonalWarnings[pick] && currentSeason !== seasonalWarnings[pick]) {
            UI.setNewsText(winterHints[Math.floor(Math.random() * winterHints.length)]);
            return;
        }

        if (pick === 'polar_bears') {
            MapRenderer.forcePolarBears();
            UI.setNewsText(cheatMessages.polar_bears);
            return;
        }

        // Find template from EVENT_POOL
        const template = Events.EVENT_POOL.find(e => e.id === pick);
        if (!template) return;

        const event = { ...template, remainingDuration: template.duration };

        // Assign random district if needed
        if (template.randomDistrict) {
            const districts = HelsinkiDistricts.districts;
            event.affectedDistricts = [districts[Math.floor(Math.random() * districts.length)].id];
        }

        // Apply immediate value modifier effects (alien invasion, etc.)
        if (event.valueModifier) {
            for (const prop of GameState.properties) {
                if (event.global || (event.affectedDistricts && event.affectedDistricts.includes(prop.district))) {
                    prop.price = Math.floor(prop.price * (1 + event.valueModifier));
                }
            }
        }

        GameState.activeEvents.push(event);
        Sound.playEventSpecial();
        UI.showEventNotification(event);
        if (pick === 'nokia_comeback') {
            UI.showNokiaAnnouncement();
        }
        UI.updateHUD(GameState);
        MapRenderer.render();
        UI.setNewsText(cheatMessages[pick]);
    }

    function buyProperty(property) {
        const isFree = UI.isFreeBuyMode();
        if (GameState.actionsRemaining <= 0) {
            UI.setNewsText('No actions remaining this turn!');
            return;
        }
        if (property.owner !== null) {
            UI.setNewsText('This property is already owned!');
            return;
        }
        if (!isFree && GameState.money < property.price) {
            UI.setNewsText('Not enough money to buy ' + property.name + '!');
            return;
        }

        saveUndoSnapshot();
        if (!isFree) {
            GameState.money -= property.price;
        } else {
            UI.clearFreeBuyMode();
        }
        property.owner = 'player';
        GameState.actionsRemaining--;

        Sound.playBuy();
        MapRenderer.triggerAdvisorAction('buy');
        Achievements.onBuy();
        UI.updateHUD(GameState);
        UI.showPropertyPanel(property);
        UI.setNewsText(`Bought ${property.name} for €${UI.formatMoney(property.price)}!`);
        UI.addLogAction(`Bought ${property.name} for €${UI.formatMoney(property.price)}`);
        logYearlyEvent('player_buy', `${GameState.playerName} acquired ${property.name} in ${property.districtName || property.district} for €${UI.formatMoney(property.price)}`);
        MapRenderer.render();
    }

    function sellProperty(property) {
        if (GameState.actionsRemaining <= 0) {
            UI.setNewsText('No actions remaining this turn!');
            return;
        }
        if (property.owner !== 'player') return;

        saveUndoSnapshot();
        const sellPrice = Math.floor(property.price * 0.85); // 15% transaction fee
        GameState.money += sellPrice;
        property.owner = null;
        GameState.actionsRemaining--;

        Sound.playSell();
        MapRenderer.triggerAdvisorAction('sell');
        Achievements.onSell();
        UI.updateHUD(GameState);
        UI.hidePropertyPanel();
        UI.setNewsText(`Sold ${property.name} for €${UI.formatMoney(sellPrice)}.`);
        UI.addLogAction(`Sold ${property.name} for €${UI.formatMoney(sellPrice)}`);
        logYearlyEvent('player_sell', `${GameState.playerName} sold ${property.name} in ${property.districtName || property.district} for €${UI.formatMoney(sellPrice)}`);
        MapRenderer.render();
    }

    function upgradeProperty(property) {
        if (GameState.actionsRemaining <= 0) {
            UI.setNewsText('No actions remaining this turn!');
            return;
        }
        const cost = Properties.getUpgradeCost(property);
        if (!cost || GameState.money < cost) {
            UI.setNewsText('Cannot upgrade — not enough money or already max level.');
            return;
        }

        saveUndoSnapshot();
        const revBefore = property.revenue;
        GameState.money -= cost;
        Properties.upgradeProperty(property);
        GameState.actionsRemaining--;
        const revGain = property.revenue - revBefore;

        Sound.playUpgrade();
        MapRenderer.triggerAdvisorAction('upgrade');
        Achievements.onUpgrade();
        UI.updateHUD(GameState);
        UI.showPropertyPanel(property);
        const revStr = UI.formatMoneyPrecise(revGain);
        UI.setNewsText(`Upgraded ${property.name} to level ${property.upgradeLevel}! Revenue +€${revStr}/mo`);
        UI.addLogAction(`Upgraded ${property.name} to Lv.${property.upgradeLevel} (revenue +€${revStr}/mo)`);
    }

    function repairProperty(property) {
        if (GameState.actionsRemaining <= 0) {
            UI.setNewsText('No actions remaining this turn!');
            return;
        }
        const cost = Properties.getRepairCost(property);
        if (GameState.money < cost) {
            UI.setNewsText('Not enough money for repairs!');
            return;
        }

        saveUndoSnapshot();
        GameState.money -= cost;
        Properties.repairProperty(property);
        GameState.actionsRemaining--;

        Sound.playRepair();
        MapRenderer.triggerAdvisorAction('repair');
        UI.updateHUD(GameState);
        UI.showPropertyPanel(property);
        UI.setNewsText(`Repaired ${property.name} to perfect condition!`);
        UI.addLogAction(`Repaired ${property.name}`);
    }

    // === SAVE / LOAD ===
    const AUTOSAVE_KEY = 'helsinkiTycoon_autosave';
    const MANUAL_SAVE_KEY = 'helsinkiTycoon_manual';

    function buildSaveData() {
        return {
            version: '0.15.2',
            savedAt: Date.now(),
            money: GameState.money,
            month: GameState.month,
            year: GameState.year,
            turn: GameState.turn,
            actionsRemaining: GameState.actionsRemaining,
            actionsPerTurn: GameState.actionsPerTurn,
            difficulty: GameState.difficulty,
            mode: GameState.mode,
            loanAmount: GameState.loanAmount,
            loanInterestRate: GameState.loanInterestRate,
            winTarget: GameState.winTarget,
            gameOver: GameState.gameOver,
            totalRevenueEarned: GameState.totalRevenueEarned,
            properties: GameState.properties.map(p => ({
                id: p.id,
                name: p.name,
                type: p.type,
                district: p.district,
                districtName: p.districtName,
                x: p.x,
                y: p.y,
                basePrice: p.basePrice,
                price: p.price,
                baseRevenue: p.baseRevenue,
                revenue: p.revenue,
                description: p.description,
                condition: p.condition,
                upgradeLevel: p.upgradeLevel,
                maxUpgrade: p.maxUpgrade,
                owner: p.owner,
                tenantSatisfaction: p.tenantSatisfaction,
                ...(p.color ? { color: p.color } : {}),
                ...(p.easterEgg ? { easterEgg: true } : {}),
            })),
            rivals: GameState.rivals.map(r => ({
                id: r.id,
                name: r.name,
                shortName: r.shortName,
                color: r.color,
                strategy: r.strategy,
                description: r.description,
                preferredTypes: r.preferredTypes,
                preferredDistricts: r.preferredDistricts,
                aggressiveness: r.aggressiveness,
                startingCapitalMultiplier: r.startingCapitalMultiplier,
                money: r.money,
                propertiesOwned: r.propertiesOwned,
                netWorth: r.netWorth,
            })),
            activeEvents: GameState.activeEvents.map(e => ({ ...e })),
            staff: [...GameState.staff],
            financeHistory: GameState.financeHistory.map(h => ({ ...h })),
            playerName: GameState.playerName,
            playerGender: GameState.playerGender,
            yearlyLog: GameState.yearlyLog,
            usedFillerIndices: GameState.usedFillerIndices,
            usedRivalFillerIndices: GameState.usedRivalFillerIndices,
            nokiaHasOccurred: GameState.nokiaHasOccurred,
            lastSpecialEventTurn: GameState.lastSpecialEventTurn,
            specialEventMultiplier: GameState.specialEventMultiplier,
            specialEventThisYear: GameState.specialEventThisYear,
            specialEventOccurrences: GameState.specialEventOccurrences,
            lastSpecialEventId: GameState.lastSpecialEventId,
        };
    }

    function writeSave(key) {
        try {
            localStorage.setItem(key, JSON.stringify(buildSaveData()));
            return true;
        } catch (err) {
            console.error('Save failed:', err);
            return false;
        }
    }

    function restoreFromSave(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return false;
            const data = JSON.parse(raw);

            GameState.money = data.money;
            GameState.month = data.month;
            GameState.year = data.year;
            GameState.turn = data.turn;
            GameState.actionsRemaining = data.actionsRemaining;
            GameState.actionsPerTurn = data.actionsPerTurn;
            GameState.difficulty = data.difficulty;
            GameState.mode = data.mode;
            GameState.loanAmount = data.loanAmount;
            GameState.loanInterestRate = data.loanInterestRate;
            GameState.winTarget = data.winTarget;
            GameState.gameOver = data.gameOver;
            GameState.totalRevenueEarned = data.totalRevenueEarned;
            GameState.properties = data.properties;
            GameState.rivals = data.rivals;
            GameState.activeEvents = data.activeEvents || [];
            GameState.staff = data.staff || [];
            GameState.playerName = data.playerName || 'The Tycoon of Helsinki';
            GameState.playerGender = data.playerGender || 'male';
            GameState.yearlyLog = data.yearlyLog || [];
            GameState.usedFillerIndices = data.usedFillerIndices || [];
            GameState.usedRivalFillerIndices = data.usedRivalFillerIndices || {};
            GameState.nokiaHasOccurred = data.nokiaHasOccurred || false;
            GameState.lastSpecialEventTurn = data.lastSpecialEventTurn || -3;
            GameState.specialEventMultiplier = data.specialEventMultiplier || 1.0;
            GameState.specialEventThisYear = data.specialEventThisYear || false;
            GameState.specialEventOccurrences = data.specialEventOccurrences || {};
            GameState.lastSpecialEventId = data.lastSpecialEventId || null;
            GameState.financeHistory = data.financeHistory || [];

            // Update visuals
            const season = Seasons.getCurrentSeason(GameState.month);
            MapRenderer.setSeason(season);
            Sound.setSeason(season);
            Sound.startMusic();
            UI.updateHUD(GameState);
            MapRenderer.render();

            return true;
        } catch (err) {
            console.error('Load failed:', err);
            return false;
        }
    }

    // Auto-save (called every end-of-turn)
    function autoSave() {
        writeSave(AUTOSAVE_KEY);
    }

    // Manual save (player-triggered)
    function saveGame() {
        return writeSave(MANUAL_SAVE_KEY);
    }

    // Load manual save (go back in time)
    function loadGame() {
        if (restoreFromSave(MANUAL_SAVE_KEY)) {
            const netWorth = Economy.calculateNetWorth(GameState);
            UI.setNewsText(`Manual save loaded — Turn ${GameState.turn}, ${Seasons.getMonthName(GameState.month)} ${GameState.year}. Net worth: €${UI.formatMoney(netWorth)}.`);
            return true;
        }
        return false;
    }

    // Load auto-save (continue from last turn)
    function loadAutoSave() {
        if (restoreFromSave(AUTOSAVE_KEY)) {
            const netWorth = Economy.calculateNetWorth(GameState);
            UI.setNewsText(`Auto-save loaded — Turn ${GameState.turn}, ${Seasons.getMonthName(GameState.month)} ${GameState.year}. Net worth: €${UI.formatMoney(netWorth)}.`);
            return true;
        }
        return false;
    }

    function deleteSave() {
        localStorage.removeItem(MANUAL_SAVE_KEY);
    }

    function deleteAutoSave() {
        localStorage.removeItem(AUTOSAVE_KEY);
    }

    function getSaveInfo(key) {
        try {
            const raw = localStorage.getItem(key || MANUAL_SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            return {
                turn: data.turn,
                month: data.month,
                year: data.year,
                money: data.money,
                savedAt: data.savedAt,
            };
        } catch {
            return null;
        }
    }

    function getAutoSaveInfo() {
        return getSaveInfo(AUTOSAVE_KEY);
    }

    function getManualSaveInfo() {
        return getSaveInfo(MANUAL_SAVE_KEY);
    }

    return {
        start,
        endTurn,
        buyProperty,
        sellProperty,
        upgradeProperty,
        repairProperty,
        undo,
        acceptOffer,
        declineOffer,
        auctionPlayerRaise,
        auctionPlayerDropout,
        closeAuction,
        cheatBiddingWar,
        cheatRivalOffer,
        cheatEasterEgg,
        autoSave,
        saveGame,
        loadGame,
        loadAutoSave,
        deleteSave,
        deleteAutoSave,
        getAutoSaveInfo,
        getManualSaveInfo,
        logYearlyEvent,
    };
})();
