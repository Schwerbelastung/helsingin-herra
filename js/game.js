// Helsinki Tycoon - Game State & Turn Management

// Global game state
const GameState = {
    money: 50000,
    month: 0, // 0 = January
    year: 2024,
    turn: 1,
    actionsRemaining: 3,
    actionsPerTurn: 3,
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
};

const Game = (() => {

    function start(capital, difficulty, mode, rivalCount, target) {
        // Set starting money
        GameState.money = capital === 'wealthy' ? 2000000 : 200000;
        GameState.difficulty = difficulty;
        GameState.mode = mode;
        GameState.staff = [];

        // Difficulty settings
        const diffSettings = {
            easy: { actionsPerTurn: 4, interestRate: 0.03 },
            normal: { actionsPerTurn: 3, interestRate: 0.05 },
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

        // 5. Advance time
        GameState.month = (GameState.month + 1) % 12;
        if (GameState.month === 0) GameState.year++;
        GameState.turn++;
        GameState.actionsRemaining = GameState.actionsPerTurn + Staff.getActionsBonus(GameState);

        // 6. Update season visuals and music
        const season = Seasons.getCurrentSeason(GameState.month);
        MapRenderer.setSeason(season);
        Sound.setSeason(season);

        // 7. Show turn summary
        UI.showTurnSummary({
            ...financeSummary,
            rivalActions: allRivalActions,
            newEvents,
            staffResults,
        });

        // 8. Check win condition
        if (GameState.mode === 'campaign') {
            const netWorth = Economy.calculateNetWorth(GameState);
            if (netWorth >= GameState.winTarget) {
                GameState.gameOver = true;
                Sound.playVictory();
                UI.showWinScreen();
            }
        }

        // 9. Check bankruptcy
        if (GameState.money < -100000) {
            GameState.gameOver = true;
            Sound.playBankrupt();
            UI.setNewsText('GAME OVER: You have gone bankrupt!');
            alert('Game Over!\n\nYou have gone bankrupt.\nFinal turn: ' + GameState.turn);
        }

        // 10. Update display
        UI.updateHUD(GameState);
        MapRenderer.render();

        // 11. Auto-save
        autoSave();
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

        if (!isFree) {
            GameState.money -= property.price;
        } else {
            UI.clearFreeBuyMode();
        }
        property.owner = 'player';
        GameState.actionsRemaining--;

        Sound.playBuy();
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

        const sellPrice = Math.floor(property.price * 0.85); // 15% transaction fee
        GameState.money += sellPrice;
        property.owner = null;
        GameState.actionsRemaining--;

        Sound.playSell();
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

        const revBefore = property.revenue;
        GameState.money -= cost;
        Properties.upgradeProperty(property);
        GameState.actionsRemaining--;
        const revGain = property.revenue - revBefore;

        Sound.playUpgrade();
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

        GameState.money -= cost;
        Properties.repairProperty(property);
        GameState.actionsRemaining--;

        Sound.playRepair();
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
            version: '0.8.5',
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
