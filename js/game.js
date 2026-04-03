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
    gameOver: false,
    totalRevenueEarned: 0,
    financeHistory: [], // { turn, revenue, maintenance, loanPayment, staffSalaries, netIncome, netWorth, cash }
};

// Undo snapshot — stores state before last player action
let undoSnapshot = null;

const Game = (() => {

    function start(capital, difficulty, mode, rivalCount, target) {
        // Set starting money
        GameState.money = capital === 'wealthy' ? 2000000 : 200000;
        GameState.difficulty = difficulty;
        GameState.mode = mode;
        GameState.staff = [];
        GameState.financeHistory = [];

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

        UI.setNewsText('Tervetuloa! Start building your real estate empire. Click on properties to buy them.');
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
        }

        // 3. Tick existing events
        Events.tickEvents(GameState);

        // 4. Check for new events
        const newEvents = Events.checkEvents(GameState);
        for (const event of newEvents) {
            GameState.activeEvents.push(event);

            // Play event sound
            if (event.special) {
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
        GameState.month = (GameState.month + 1) % 12;
        if (GameState.month === 0) GameState.year++;
        GameState.turn++;
        GameState.actionsRemaining = GameState.actionsPerTurn + Staff.getActionsBonus(GameState);

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

        // 15. Check for rival offer
        if (!GameState.gameOver && GameState.rivals.length > 0) {
            const offer = Rivals.generateOffer(GameState);
            if (offer) {
                pendingOffer = offer;
                UI.showOfferDialog(offer);
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
                UI.setNewsText("You can't afford this property right now!");
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
        UI.setNewsText(`You declined ${name}'s offer.`);
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
            version: '0.10.2',
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
        autoSave,
        saveGame,
        loadGame,
        loadAutoSave,
        deleteSave,
        deleteAutoSave,
        getAutoSaveInfo,
        getManualSaveInfo,
    };
})();
