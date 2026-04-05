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
    maintenanceTier: 0, // 0 = none, 1-5 = tier level
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
    lastSpecialEventTurn: -5, // turn when last special event triggered (cooldown: 4 months)
    specialEventMultiplier: 1.0, // dynamic easter egg chance multiplier (halved on proc, doubled if dry year)
    specialEventThisYear: false, // tracks if any special event fired this calendar year
    specialEventOccurrences: {}, // tracks how many times each special event has fired (max 3, 1 for Nokia)
    lastSpecialEventId: null, // ID of the last special event that fired (prevent back-to-back repeats)
    usedSpecialArticleIndices: {}, // tracks which article variant was last used per special event
    lastOfferTurn: -10, // turn when last rival offer was shown (cooldown: 2 turns)
    lastAuctionTurn: -10, // turn when last auction occurred (cooldown: 6 turns)
    auctionThisYear: false, // only one auction per calendar year
    lastQuipTurn: -6, // turn when last rival quip was shown (cooldown: 4 turns)
    totalRevenueEarned: 0,
    financeHistory: [], // { turn, revenue, maintenance, loanPayment, staffSalaries, netIncome, netWorth, cash }
    victoryScreenShown: false, // track if victory screen has been shown this game
};

// Undo snapshot — stores state before last player action
let undoSnapshot = null;

// Easter egg cheat cycle — shuffled queue so all events appear before any repeats
let easterEggQueue = [];

const Game = (() => {

    function start(capital, difficulty, mode, rivalCount, target, playerName, playerGender) {
        // Set starting money
        GameState.money = capital === 'wealthy' ? 2000000 : 200000;
        GameState.playerName = playerName || 'The Tycoon of Helsinki';
        GameState.playerGender = playerGender || 'male';
        GameState.difficulty = difficulty;
        GameState.mode = mode;
        GameState.staff = [];
        GameState.maintenanceTier = 0;
        GameState.financeHistory = [];
        GameState.yearlyLog = [];
        GameState.usedFillerIndices = [];
        GameState.usedRivalFillerIndices = {};
        GameState.nokiaHasOccurred = false;
        GameState.lastSpecialEventTurn = -5;
        GameState.specialEventMultiplier = 1.0;
        GameState.specialEventThisYear = false;
        GameState.specialEventOccurrences = {};
        GameState.lastSpecialEventId = null;
        GameState.usedSpecialArticleIndices = {};
        GameState.lastOfferTurn = -10;
        GameState.lastAuctionTurn = -10;
        GameState.auctionThisYear = false;
        GameState.lastQuipTurn = -6;
        GameState.victoryScreenShown = false;

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

        // Restore sound if Finnish Silence was active last turn
        if (GameState.silenceUntilNextTurn) {
            GameState.silenceUntilNextTurn = false;
            Sound.restoreAll();
        }

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

                // Check if this action completed a district monopoly for the rival
                const rivalObj = GameState.rivals.find(r => r.shortName === a.rival);
                if (rivalObj) {
                    // Find the property that was bought
                    const boughtProp = GameState.properties.find(p => p.name === a.property);
                    if (boughtProp) {
                        const monopolyOwner = Economy.checkDistrictMonopoly(boughtProp, GameState);
                        if (monopolyOwner === rivalObj.id) {
                            logYearlyEvent('district_takeover', `${a.rival} completed a monopoly in ${a.district || 'Helsinki'}`, {
                                meta: {
                                    type: 'rival',
                                    rival: rivalObj.id,
                                    rivalName: a.rival,
                                    district: boughtProp.district,
                                    districtName: a.district || 'Helsinki',
                                }
                            });
                        }
                    }
                }
            }
        }

        // 2b. Check for rival bankruptcies
        for (const rival of GameState.rivals) {
            if (rival.netWorth <= 0 && !rival.bankrupted) {
                rival.bankrupted = true;
                Sound.playBankrupt();
                UI.setNewsText(`📉 ${rival.name} has gone bankrupt and is out of the game.`);
                logYearlyEvent('rival_bankrupt', `${rival.shortName} went bankrupt`);
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

            // Unlock achievement immediately for this easter egg
            Achievements.onEasterEgg(event.id);

            // Play event sound and show Swedish newspaper
            if (event.id === 'finnish_silence') {
                Sound.silenceAll();
                GameState.silenceUntilNextTurn = true;
                MapRenderer.triggerAdvisorAction('finnish_silence');
                // Show a special "nothing to report" HS newspaper immediately
                const silencePaper = Newspaper.generateSilencePaper(GameState);
                UI.showNewspaperPrompt(silencePaper, null);
            } else if (event.id === 'swedish_invasion') {
                Sound.playSwedishAnthem();
                // Show HBL special edition
                const hblPaper = Newspaper.generateSwedishPaper(GameState);
                UI.showNewspaperPrompt(null, hblPaper);
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

        // Refresh staff panel if open (to show updated salary scaling)
        const staffPanel = document.getElementById('staff-panel');
        if (staffPanel && !staffPanel.classList.contains('hidden')) {
            UI.updateStaffPanel();
        }

        // 6b. Newspaper: show prompt in January, auto-dismiss in March
        if (GameState.month === 0 && GameState.turn > 1) {
            // January — generate year-in-review for the year that just ended
            const reviewYear = GameState.year - 1;
            const paper = Newspaper.generateYearlyPaper(GameState, GameState.yearlyLog, reviewYear);
            // If Swedish invasion is active, also generate HBL
            const swedishActive = GameState.activeEvents.some(e => e.id === 'swedish_invasion');
            const hblPaper = swedishActive ? Newspaper.generateSwedishPaper(GameState) : null;
            UI.showNewspaperPrompt(paper, hblPaper);
            // Clear yearly log for new year
            GameState.yearlyLog = GameState.yearlyLog.filter(e => e.year >= GameState.year);
            // Adjust special event probability for the new year
            if (GameState.specialEventThisYear) {
                // Had an event last year — reset to baseline
                GameState.specialEventMultiplier = 1.0;
            } else {
                // Dry year — double the chances (capped at 2x)
                GameState.specialEventMultiplier = Math.min(2.0, GameState.specialEventMultiplier * 2);
            }
            GameState.specialEventThisYear = false;
            GameState.auctionThisYear = false;
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
            if (netWorth >= GameState.winTarget && !GameState.victoryScreenShown) {
                GameState.gameOver = true;
                GameState.victoryScreenShown = true;
                Achievements.checkWin(GameState);
                Sound.playVictory();
                UI.showWinScreen();
            }
            // Check if a rival reached the target first
            for (const rival of GameState.rivals) {
                if (rival.netWorth >= GameState.winTarget) {
                    GameState.gameOver = true;
                    Sound.playBankrupt();
                    UI.setNewsText(`GAME OVER: ${rival.name} reached the target first!`);
                    alert(`Game Over!\n\n${rival.name} reached the goal of €${UI.formatMoney(GameState.winTarget)}.\nYou came in 2nd place.\nFinal turn: ${GameState.turn}`);
                    break;
                }
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

        // 15. Maybe show a rival quip (~1-2 per year, 4-turn cooldown, not in first 3 months)
        if (!GameState.gameOver && GameState.rivals.length > 0 && GameState.turn >= 3) {
            const turnsSinceQuip = GameState.turn - GameState.lastQuipTurn;
            if (turnsSinceQuip >= 4 && Math.random() < 0.14) {
                const rival = GameState.rivals[Math.floor(Math.random() * GameState.rivals.length)];
                const quip = Rivals.getRandomQuip(rival.id);
                if (quip) {
                    GameState.lastQuipTurn = GameState.turn;
                    setTimeout(() => UI.showRivalQuip(rival, quip), 1200);
                }
            }
        }

        // 16. Check for auction or rival offer (not both same turn; none in first 6 months)
        if (!GameState.gameOver && GameState.rivals.length > 0 && GameState.turn >= 6) {
            const auction = Rivals.generateAuction(GameState);
            if (auction) {
                GameState.lastAuctionTurn = GameState.turn;
                GameState.auctionThisYear = true;
                startAuction(auction);
            } else if (GameState.turn - GameState.lastOfferTurn >= 2) {
                const offer = Rivals.generateOffer(GameState);
                if (offer) {
                    pendingOffer = offer;
                    GameState.lastOfferTurn = GameState.turn;
                    // Show as prominent popup with sound
                    setTimeout(() => {
                        Sound.playOffer();
                        UI.showOfferDialog(offer);
                    }, 800);
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

    // === PLAYER-INITIATED OFFERS ===

    function processPlayerOffer(property, rival, offerPrice, pctOfMarket) {
        // Costs 1 action
        if (GameState.actionsRemaining <= 0) return;
        GameState.actionsRemaining--;
        UI.updateHUD(GameState);

        const accepted = Rivals.evaluatePlayerOffer(rival, property, offerPrice, pctOfMarket, GameState);
        const quip = Rivals.getPlayerOfferQuip(rival.id, accepted);

        if (accepted) {
            // Transfer property to player
            property.owner = 'player';
            rival.money += offerPrice;
            rival.propertiesOwned = Math.max(0, rival.propertiesOwned - 1);
            GameState.money -= offerPrice;

            // Update rival net worth
            const rivalProps = GameState.properties.filter(p => p.owner === rival.id);
            rival.netWorth = rival.money + rivalProps.reduce((s, p) => s + p.price, 0);

            Sound.playBuy();
            UI.setNewsText(`${rival.shortName} accepted! Bought ${property.name} for €${UI.formatMoney(offerPrice)}.`);
            UI.addLogAction(`Bought ${property.name} from ${rival.shortName} for €${UI.formatMoney(offerPrice)}`);
            logYearlyEvent('deal', `${GameState.playerName} bought ${property.name} from ${rival.shortName} for €${UI.formatMoney(offerPrice)}.`);
        } else {
            Sound.playClick();
            UI.setNewsText(`${rival.shortName} declined your offer for ${property.name}.`);
            UI.addLogAction(`${rival.shortName} declined offer for ${property.name}`);
        }

        // Show rival quip
        UI.showRivalQuip(rival, quip);

        // Refresh map and panels
        MapRenderer.render();
        UI.hidePropertyPanel();
        UI.updateHUD(GameState);
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

        // Allow bidding with loans: can afford if cash + available credit covers it
        const availableCredit = Economy.getAvailableCredit(GameState);
        const totalBuyingPower = GameState.money + availableCredit;
        if (totalBuyingPower < nextBid) {
            UI.setNewsText(GameState.playerName + " can't afford to raise — not even with a loan!");
            return;
        }

        // Disable buttons during rival animation
        const raiseBtn = document.getElementById('auction-raise');
        const dropoutBtn = document.getElementById('auction-dropout');
        if (raiseBtn) raiseBtn.disabled = true;
        if (dropoutBtn) dropoutBtn.disabled = true;

        Sound.playAuctionBid();
        a.playerBid = nextBid;
        a.currentBid = nextBid;
        a.leader = 'player';
        a.round++;

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

        // Update round info (but NOT rival cards — those animate one by one)
        const roundNum = document.getElementById('auction-round-num');
        const bidAmount = document.getElementById('auction-bid-amount');
        const bidLeader = document.getElementById('auction-bid-leader');
        if (roundNum) roundNum.textContent = a.round + 1;

        // Animate rival results one at a time
        UI.animateRivalResults(results, () => {
            // After all rivals have acted, update final state
            bidAmount.textContent = `€${UI.formatMoney(a.currentBid)}`;
            if (a.leader === 'player') {
                bidLeader.textContent = GameState.playerName + ' is leading!';
                bidLeader.style.color = '#44ff44';
            } else {
                const leader = a.bidders.find(b => b.rival.id === a.leader);
                bidLeader.textContent = leader ? `${leader.rival.shortName} is leading` : '';
                bidLeader.style.color = leader ? leader.rival.color : '';
            }

            const nextRaiseBid = a.currentBid + a.increment;
            if (raiseBtn) {
                const needsLoan = nextRaiseBid > GameState.money;
                raiseBtn.textContent = `RAISE €${UI.formatMoney(nextRaiseBid)}${needsLoan ? ' (LOAN)' : ''}`;
            }

            const activeRivals = a.bidders.filter(b => b.active);
            if (a.round >= a.maxRounds || activeRivals.length === 0) {
                setTimeout(() => finishAuction(), 800);
            } else {
                // Re-enable buttons
                if (raiseBtn) raiseBtn.disabled = false;
                if (dropoutBtn) dropoutBtn.disabled = false;
            }
        }, 900);
    }

    function auctionPlayerDropout() {
        if (!activeAuction || activeAuction.finished) return;
        const a = activeAuction;
        a.playerIn = false;
        Sound.playClick();

        // Disable buttons immediately to prevent double-clicks
        const raiseBtn = document.getElementById('auction-raise');
        const dropoutBtn = document.getElementById('auction-dropout');
        if (raiseBtn) raiseBtn.disabled = true;
        if (dropoutBtn) dropoutBtn.disabled = true;

        // Mark player card as dropped
        const playerCard = document.getElementById('auction-player-card');
        if (playerCard) {
            playerCard.className = 'auction-participant dropped';
            playerCard.querySelector('.auction-participant-status').textContent = 'OUT';
        }

        // Animate remaining rounds one at a time, with per-rival stagger
        function animateNextRound() {
            if (a.round >= a.maxRounds) {
                resolveDropoutWinner();
                return;
            }

            // If only 0-1 active rivals remain, end immediately — no useless extra bid
            const preActiveRivals = a.bidders.filter(b => b.active);
            if (preActiveRivals.length <= 1) {
                resolveDropoutWinner();
                return;
            }

            a.round++;
            const results = Rivals.processAuctionRound(a);

            // Update current bid to highest active rival
            for (const r of results) {
                if (r.action === 'raise' && r.bid > a.currentBid) {
                    a.currentBid = r.bid;
                    a.leader = r.rival.id;
                }
            }

            // Update round number
            const roundNum = document.getElementById('auction-round-num');
            if (roundNum) roundNum.textContent = a.round + 1;

            // Animate rival results one at a time, then proceed
            UI.animateRivalResults(results, () => {
                // Update bid display after all rivals acted
                const bidAmount = document.getElementById('auction-bid-amount');
                const bidLeader = document.getElementById('auction-bid-leader');
                if (bidAmount) bidAmount.textContent = `€${UI.formatMoney(a.currentBid)}`;
                if (a.leader) {
                    const leader = a.bidders.find(b => b.rival.id === a.leader);
                    if (bidLeader && leader) {
                        bidLeader.textContent = `${leader.rival.shortName} is leading`;
                        bidLeader.style.color = leader.rival.color;
                    }
                }

                // Check if auction should end (0 or 1 active rival)
                const activeRivals = a.bidders.filter(b => b.active);
                if (activeRivals.length <= 1) {
                    setTimeout(() => resolveDropoutWinner(), 600);
                    return;
                }

                // Bump bid for next round
                a.currentBid += a.increment;

                // Continue to next round after pause
                setTimeout(animateNextRound, 500);
            }, 900);
        }

        function resolveDropoutWinner() {
            const activeRivals = a.bidders.filter(b => b.active);
            if (activeRivals.length > 0) {
                a.leader = activeRivals[0].rival.id;
                a.currentBid = activeRivals[0].lastBid || a.currentBid;
            } else {
                // All rivals dropped — the last one to have bid highest wins
                // Find the bidder with the highest lastBid
                let bestBidder = null;
                let bestBid = 0;
                for (const b of a.bidders) {
                    if (b.lastBid && b.lastBid > bestBid) {
                        bestBid = b.lastBid;
                        bestBidder = b;
                    }
                }
                if (bestBidder) {
                    a.leader = bestBidder.rival.id;
                    a.currentBid = bestBid;
                }
            }
            finishAuction();
        }

        // Start animating after a brief pause
        setTimeout(animateNextRound, 800);
    }

    function finishAuction() {
        if (!activeAuction) return;
        const a = activeAuction;
        a.finished = true;

        Sound.stopAuctionMusic();

        if (a.leader === 'player' && a.playerIn) {
            // Player wins — auto-loan if needed
            let loanMsg = '';
            if (GameState.money < a.currentBid) {
                const shortfall = a.currentBid - GameState.money;
                Economy.takeLoan(GameState, shortfall);
                loanMsg = ` (took €${UI.formatMoney(shortfall)} loan to cover the bid)`;
            }
            GameState.money -= a.currentBid;
            a.property.owner = 'player';
            Sound.playAuctionWin();
            if (autopilotActive) {
                autopilotQuote(AUTOPILOT_AUCTION_WIN_QUOTES);
                MapRenderer.setAutopilotBanner(`Won auction: ${a.property.name} for €${UI.formatMoney(a.currentBid)}`);
            }
            UI.showAuctionResult(a, true, `${GameState.playerName} won ${a.property.name} for €${UI.formatMoney(a.currentBid)}!${loanMsg}`);
            UI.setNewsText(`Won auction: ${a.property.name} for €${UI.formatMoney(a.currentBid)}!${loanMsg}`);
            UI.addLogAction(`Won auction: ${a.property.name} for €${UI.formatMoney(a.currentBid)}${loanMsg}`);
            logYearlyEvent('auction', `${GameState.playerName} won a heated bidding war for ${a.property.name}, paying €${UI.formatMoney(a.currentBid)}${loanMsg}`, { winnerId: 'player' });
        } else if (a.leader) {
            // A rival wins
            const winner = a.bidders.find(b => b.rival.id === a.leader);
            if (winner) {
                a.property.owner = winner.rival.id;
                winner.rival.money -= a.currentBid;
                winner.rival.propertiesOwned++;
            }
            Sound.playAuctionLose();
            if (autopilotActive) {
                autopilotQuote(AUTOPILOT_AUCTION_LOSE_QUOTES);
                MapRenderer.setAutopilotBanner(`Lost auction: ${a.property.name}`);
            }
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
        const unowned = GameState.properties.filter(p => p.owner === null && !p.easterEgg);
        if (unowned.length === 0) { UI.setNewsText('No properties available for auction!'); return; }

        // Calculate the max anyone (player or rivals) could afford
        const playerCredit = Economy.getAvailableCredit(GameState);
        const playerBudget = GameState.money + playerCredit;
        const rivalBudgets = GameState.rivals.map(rival => {
            const ownedValue = GameState.properties
                .filter(p => p.owner === rival.id)
                .reduce((s, p) => s + p.price, 0);
            return rival.money + Math.floor(ownedValue * 0.5);
        });
        const maxBudget = Math.max(playerBudget, ...rivalBudgets);
        // Allow properties up to ~120% of the richest participant's budget (barely too expensive is ok)
        const priceLimit = Math.floor(maxBudget * 1.2);

        const affordable = unowned.filter(p => p.price <= priceLimit);
        if (affordable.length === 0) { UI.setNewsText('No affordable properties for auction!'); return; }

        // Force-build an auction: pick a random affordable property, include ALL rivals as bidders
        const prop = affordable[Math.floor(Math.random() * affordable.length)];
        const startBid = Math.floor(prop.price * 0.60);
        const increment = Math.floor(prop.price * 0.08);
        const bidders = GameState.rivals.map(rival => {
            const ownedValue = GameState.properties
                .filter(p => p.owner === rival.id)
                .reduce((s, p) => s + p.price, 0);
            const budget = rival.money + Math.floor(ownedValue * 0.5);
            const maxBid = Math.max(startBid, Math.floor(budget * 0.8));
            return { rival, maxBid, active: true, lastBid: 0 };
        });
        const auction = {
            property: prop, startBid, increment,
            currentBid: startBid, round: 0, maxRounds: 5,
            bidders, playerIn: true, playerBid: 0,
            leader: null, finished: false,
        };
        GameState.lastAuctionTurn = GameState.turn;
        GameState.auctionThisYear = true;
        startAuction(auction);
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
            'finnish_silence',
        ];
        // Refill queue with a fresh shuffle when empty
        if (easterEggQueue.length === 0) {
            easterEggQueue = [...options].sort(() => Math.random() - 0.5);
        }
        const pick = easterEggQueue.shift();
        const easterStatusEl = document.getElementById('cheat-easter-status');
        if (easterStatusEl) {
            easterStatusEl.textContent = easterEggQueue.length === 0
                ? 'Full cycle complete — reshuffling next time'
                : `${easterEggQueue.length} remaining in cycle`;
        }

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
            finnish_silence: '...',
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
            Achievements.onEasterEgg('polar_bears');
            UI.showPendingAchievements();
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

        // Unlock achievement immediately
        Achievements.onEasterEgg(pick);

        // Log for newspaper year-in-review
        logYearlyEvent(event.special ? 'special_event' : 'event', event.name);

        // Play appropriate sound and trigger event-specific UI
        if (pick === 'swedish_invasion') {
            Sound.playSwedishAnthem();
            const hblPaper = Newspaper.generateSwedishPaper(GameState);
            UI.showNewspaperPrompt(null, hblPaper);
        } else if (pick === 'finnish_silence') {
            Sound.silenceAll();
            GameState.silenceUntilNextTurn = true;
            MapRenderer.triggerAdvisorAction('finnish_silence');
            const silencePaper = Newspaper.generateSilencePaper(GameState);
            UI.showNewspaperPrompt(silencePaper, null);
        } else {
            Sound.playEventSpecial();
        }
        UI.showEventNotification(event);
        if (pick === 'nokia_comeback') {
            UI.showNokiaAnnouncement();
        }
        UI.updateHUD(GameState);
        MapRenderer.render();
        UI.setNewsText(cheatMessages[pick]);
        UI.showPendingAchievements();
    }

    function buyProperty(property) {
        const isFree = UI.isFreeBuyMode();
        if (GameState.actionsRemaining <= 0) {
            Sound.playEventNegative();
            UI.setNewsText('⚠️ OUT OF ACTIONS! End your turn to continue.');
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

        // Check if player now owns entire district (monopoly)
        const monopolyOwner = Economy.checkDistrictMonopoly(property, GameState);
        if (monopolyOwner === 'player') {
            logYearlyEvent('district_takeover', `${GameState.playerName} completed a monopoly in ${property.districtName || property.district}`, {
                meta: {
                    type: 'player',
                    district: property.district,
                    districtName: property.districtName || property.district,
                    playerName: GameState.playerName,
                }
            });
        }

        Sound.playBuy();
        MapRenderer.triggerAdvisorAction('buy');
        Achievements.onBuy();
        UI.updateHUD(GameState);
        UI.showPropertyPanel(property);
        UI.setNewsText(`Bought ${property.name} for €${UI.formatMoney(property.price)}!`);
        UI.addLogAction(`Bought ${property.name} for €${UI.formatMoney(property.price)}`);
        logYearlyEvent('player_buy', `${GameState.playerName} acquired ${property.name} in ${property.districtName || property.district} for €${UI.formatMoney(property.price)}`);
        if (Math.random() < 0.33) {
            const quirk = Properties.getRandomQuirk(property.type);
            setTimeout(() => UI.showQuirkPopup(quirk), 600);
        }
        MapRenderer.render();
    }

    function sellProperty(property) {
        if (GameState.actionsRemaining <= 0) {
            Sound.playEventNegative();
            UI.setNewsText('⚠️ OUT OF ACTIONS! End your turn to continue.');
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
            Sound.playEventNegative();
            UI.setNewsText('⚠️ OUT OF ACTIONS! End your turn to continue.');
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
        MapRenderer.render();
    }

    function repairProperty(property) {
        if (GameState.actionsRemaining <= 0) {
            Sound.playEventNegative();
            UI.setNewsText('⚠️ OUT OF ACTIONS! End your turn to continue.');
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
        MapRenderer.render();
    }

    // === SAVE / LOAD ===
    const AUTOSAVE_KEY = 'helsinkiTycoon_autosave';
    const MANUAL_SAVE_KEY = 'helsinkiTycoon_manual';

    function buildSaveData() {
        return {
            version: '0.16.3',
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
            usedSpecialArticleIndices: GameState.usedSpecialArticleIndices,
            lastOfferTurn: GameState.lastOfferTurn,
            lastAuctionTurn: GameState.lastAuctionTurn,
            auctionThisYear: GameState.auctionThisYear,
            lastQuipTurn: GameState.lastQuipTurn,
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
            GameState.usedSpecialArticleIndices = data.usedSpecialArticleIndices || {};
            GameState.lastOfferTurn = data.lastOfferTurn != null ? data.lastOfferTurn : -10;
            GameState.lastAuctionTurn = data.lastAuctionTurn != null ? data.lastAuctionTurn : -10;
            GameState.auctionThisYear = data.auctionThisYear || false;
            GameState.lastQuipTurn = data.lastQuipTurn != null ? data.lastQuipTurn : -6;
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

    function cheatBuyDistrict(districtId) {
        const targets = GameState.properties.filter(p => p.owner === null && !p.easterEgg && p.district === districtId);
        UI.clearDistrictBuyMode();
        if (targets.length === 0) {
            UI.setNewsText('No unowned properties in that district!');
            return;
        }
        for (const prop of targets) {
            prop.owner = 'player';
            Achievements.onBuy();
        }
        Sound.playBuy();
        MapRenderer.triggerAdvisorAction('buy');
        UI.updateHUD(GameState);
        const district = HelsinkiDistricts.districts.find(d => d.id === districtId);
        const districtName = district ? district.name : districtId;
        UI.setNewsText(`Bought ${targets.length} properties in ${districtName} for free!`);
        UI.addLogAction(`Cheat: bought ${targets.length} properties in ${districtName}`);
        MapRenderer.render();
    }

    // === AI AUTOPILOT ===
    let autopilotActive = false;
    let autopilotTimer = null;
    let autopilotActionCount = 0;

    const AUTOPILOT_ACTION_QUOTES = [
        "See? THIS is how you build an empire.",
        "Another brilliant move, if I do say so myself.",
        "The mustache knows best.",
        "You couldn't have done that. I mean, literally.",
        "I should charge consulting fees for this.",
        "Watch and learn. Mostly learn.",
        "Every decision I make is a masterpiece.",
        "This is almost too easy. Almost.",
        "I'd tip my hat, but I need both hands for deal-making.",
        "The portfolio grows. The legend grows.",
        "Don't take notes — you won't understand them anyway.",
        "They should teach this at university. The course? Me.",
    ];

    const AUTOPILOT_OFFER_ACCEPT_QUOTES = [
        "A deal that benefits ME? I'll take it.",
        "The mustache senses profit. Deal!",
        "I've never met a good deal I didn't like.",
        "This practically sells itself. Because I'm selling it.",
        "Pleasure doing business. The pleasure is all mine.",
    ];

    const AUTOPILOT_OFFER_DECLINE_QUOTES = [
        "Nice try. The mustache isn't fooled.",
        "I didn't become an advisor by accepting BAD deals.",
        "Hard pass. I have standards. MONOCLE standards.",
        "They'll have to do better than that.",
        "Declined with extreme prejudice and mild amusement.",
    ];

    const AUTOPILOT_AUCTION_WIN_QUOTES = [
        "SOLD! To the magnificent gentleman with the top hat!",
        "Was there ever any doubt? No. No there was not.",
        "Another property for the collection!",
        "I love the sound of a gavel. Especially when I win.",
        "The rivals never stood a chance.",
    ];

    const AUTOPILOT_AUCTION_LOSE_QUOTES = [
        "Pfft. I didn't want it anyway.",
        "I let them have it. Strategy. You wouldn't understand.",
        "Overpaying is THEIR problem now.",
        "A tactical retreat. Very different from losing.",
        "The mustache lives to bid another day.",
    ];

    function autopilotQuote(quotes) {
        MapRenderer.setAdvisorQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    function autopilotPeriodicRemark() {
        autopilotActionCount++;
        if (autopilotActionCount % 4 === 0) {
            autopilotQuote(AUTOPILOT_ACTION_QUOTES);
        }
    }

    const AUTOPILOT_QUOTES = [
        "Step aside — I'LL handle this!",
        "Finally! You've made the right decision: letting ME play.",
        "Sit back, relax, and watch a MASTER at work.",
        "The mustache takes the wheel!",
        "I've been waiting for this moment my entire career.",
        "You won't regret this. Well... probably not.",
        "At last! The tycoon becomes the advisor, and the advisor becomes the TYCOON!",
        "Don't touch anything. I mean it. NOTHING.",
        "Time to show you how a REAL monopoly man operates.",
        "I have a monocle AND a top hat. I'm literally more qualified than you.",
    ];

    const AUTOPILOT_STOP_QUOTES = [
        "Fine. Take the reins back. See if I care.",
        "You're making a mistake. But sure, go ahead.",
        "The mustache is disappointed, but not surprised.",
        "Back to watching. Back to JUDGING.",
        "I was just getting started!",
        "You'll be back. They always come back.",
    ];

    function startAutopilot() {
        if (autopilotActive) return;
        autopilotActive = true;
        autopilotActionCount = 0;
        Sound.playClick();
        const quote = AUTOPILOT_QUOTES[Math.floor(Math.random() * AUTOPILOT_QUOTES.length)];
        MapRenderer.setAdvisorQuote(quote);
        UI.setNewsText('AI Autopilot engaged — the advisor takes over!');
        UI.addLogAction('AI Autopilot activated');
        scheduleAutopilot(1500);
    }

    function stopAutopilot() {
        if (!autopilotActive) return;
        autopilotActive = false;
        if (autopilotTimer) { clearTimeout(autopilotTimer); autopilotTimer = null; }
        const quote = AUTOPILOT_STOP_QUOTES[Math.floor(Math.random() * AUTOPILOT_STOP_QUOTES.length)];
        MapRenderer.setAdvisorQuote(quote);
        UI.setNewsText('AI Autopilot disengaged — you\'re back in control.');
        UI.addLogAction('AI Autopilot deactivated');
        UI.clearAutopilotUI();
    }

    function isAutopilot() { return autopilotActive; }

    function scheduleAutopilot(delay) {
        if (autopilotTimer) clearTimeout(autopilotTimer);
        autopilotTimer = setTimeout(autopilotTick, delay);
    }

    function autopilotTick() {
        autopilotTimer = null;
        if (!autopilotActive || GameState.gameOver) {
            if (GameState.gameOver) stopAutopilot();
            return;
        }

        // 1. Handle pending offer
        if (pendingOffer) {
            autopilotHandleOffer();
            scheduleAutopilot(2000);
            return;
        }

        // 2. Handle active auction
        if (activeAuction && activeAuction.finished) {
            // Auction ended — close the dialog automatically
            closeAuction();
            scheduleAutopilot(1500);
            return;
        }
        if (activeAuction && !activeAuction.finished) {
            autopilotHandleAuction();
            scheduleAutopilot(2000);
            return;
        }

        // 3. Take actions if available
        if (GameState.actionsRemaining > 0) {
            const acted = autopilotChooseAction();
            if (acted) {
                scheduleAutopilot(1500);
            } else {
                MapRenderer.setAutopilotBanner('Ending turn — nothing worth doing');
                endTurn();
                scheduleAutopilot(2500);
            }
            return;
        }

        // 4. No actions left — end turn
        MapRenderer.setAutopilotBanner(`Ending turn ${GameState.turn}`);
        endTurn();
        scheduleAutopilot(2500);
    }

    function autopilotHandleOffer() {
        if (!pendingOffer) return;
        const offer = pendingOffer;
        if (offer.type === 'buy') {
            if (offer.premium >= 15) {
                MapRenderer.setAutopilotBanner(`Accepting offer: selling ${offer.property.name} at +${offer.premium}%`);
                UI.addLogAction(`AI accepted sell offer: ${offer.property.name} at +${offer.premium}%`);
                autopilotQuote(AUTOPILOT_OFFER_ACCEPT_QUOTES);
                acceptOffer();
            } else {
                MapRenderer.setAutopilotBanner(`Declining offer: ${offer.property.name} (only +${offer.premium}%)`);
                UI.addLogAction(`AI declined sell offer: ${offer.property.name} (only +${offer.premium}%)`);
                autopilotQuote(AUTOPILOT_OFFER_DECLINE_QUOTES);
                declineOffer();
            }
        } else {
            if (offer.discount >= 10 && GameState.money >= offer.price) {
                MapRenderer.setAutopilotBanner(`Accepting offer: buying ${offer.property.name} at -${offer.discount}%`);
                UI.addLogAction(`AI accepted buy offer: ${offer.property.name} at -${offer.discount}%`);
                autopilotQuote(AUTOPILOT_OFFER_ACCEPT_QUOTES);
                acceptOffer();
            } else {
                MapRenderer.setAutopilotBanner(`Declining offer: ${offer.property.name}`);
                UI.addLogAction(`AI declined buy offer: ${offer.property.name}`);
                autopilotQuote(AUTOPILOT_OFFER_DECLINE_QUOTES);
                declineOffer();
            }
        }
    }

    function autopilotHandleAuction() {
        if (!activeAuction || activeAuction.finished) return;
        const a = activeAuction;
        const nextBid = a.currentBid + a.increment;
        const availableCredit = Economy.getAvailableCredit(GameState);
        const totalBuyingPower = GameState.money + availableCredit;

        const maxWillingBid = a.property.price * 0.9;
        const cashReserve = GameState.money * 0.2;
        if (nextBid <= maxWillingBid && totalBuyingPower >= nextBid + cashReserve) {
            MapRenderer.setAutopilotBanner(`Raising bid to €${UI.formatMoney(nextBid)}`);
            UI.addLogAction(`AI raises auction bid to €${UI.formatMoney(nextBid)}`);
            auctionPlayerRaise();
        } else {
            MapRenderer.setAutopilotBanner('Dropping out of auction');
            UI.addLogAction('AI drops out of auction');
            auctionPlayerDropout();
        }
    }

    function autopilotChooseAction() {
        const playerProps = GameState.properties.filter(p => p.owner === 'player');
        const money = GameState.money;

        // Priority 1: Repair severely damaged properties (condition < 50%)
        const damaged = playerProps
            .filter(p => p.condition < 50)
            .sort((a, b) => a.condition - b.condition);
        for (const prop of damaged) {
            const cost = Properties.getRepairCost(prop);
            if (cost > 0 && money >= cost) {
                MapRenderer.setAutopilotBanner(`Repairing ${prop.name} (${Math.round(prop.condition)}%)`);
                autopilotPeriodicRemark();
                repairProperty(prop);
                return true;
            }
        }

        // Priority 2: Upgrade properties with best ROI
        const upgradeable = playerProps
            .filter(p => {
                const cost = Properties.getUpgradeCost(p);
                return cost !== null && money >= cost;
            })
            .map(p => {
                const cost = Properties.getUpgradeCost(p);
                const estGain = Math.max(1000, p.revenue * 0.15);
                return { prop: p, cost, roi: estGain / cost };
            })
            .sort((a, b) => b.roi - a.roi);
        if (upgradeable.length > 0 && upgradeable[0].roi > 0.01) {
            const u = upgradeable[0];
            MapRenderer.setAutopilotBanner(`Upgrading ${u.prop.name} (Lv${u.prop.upgradeLevel + 1})`);
            autopilotPeriodicRemark();
            upgradeProperty(u.prop);
            return true;
        }

        // Priority 3: Buy best available property
        const netWorth = Economy.calculateNetWorth(GameState);
        const reserve = Math.max(20000, netWorth * 0.1);
        const budget = money - reserve;
        if (budget > 0) {
            const available = GameState.properties
                .filter(p => p.owner === null && !p.easterEgg && p.price <= budget)
                .map(p => ({
                    prop: p,
                    roi: p.revenue / p.price,
                }))
                .sort((a, b) => b.roi - a.roi);
            if (available.length > 0 && available[0].roi > 0.003) {
                const pick = available[0];
                MapRenderer.setAutopilotBanner(`Buying ${pick.prop.name} (€${UI.formatMoney(pick.prop.price)})`);
                autopilotPeriodicRemark();
                buyProperty(pick.prop);
                return true;
            }
        }

        // Priority 4: Repair moderately damaged properties (condition < 75%)
        const moderate = playerProps
            .filter(p => p.condition < 75 && p.condition >= 50)
            .sort((a, b) => a.condition - b.condition);
        for (const prop of moderate) {
            const cost = Properties.getRepairCost(prop);
            if (cost > 0 && money >= cost) {
                MapRenderer.setAutopilotBanner(`Repairing ${prop.name} (${Math.round(prop.condition)}%)`);
                autopilotPeriodicRemark();
                repairProperty(prop);
                return true;
            }
        }

        return false; // nothing worth doing
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
        processPlayerOffer,
        auctionPlayerRaise,
        auctionPlayerDropout,
        closeAuction,
        cheatBiddingWar,
        cheatRivalOffer,
        cheatEasterEgg,
        cheatBuyDistrict,
        startAutopilot,
        stopAutopilot,
        isAutopilot,
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
