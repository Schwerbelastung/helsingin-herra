// Helsinki Tycoon - Achievement System (persistent across games)
const Achievements = (() => {
    const STORAGE_KEY = 'helsinkiTycoon_achievements';

    const ACHIEVEMENT_DEFS = [
        // Getting started
        { id: 'first_purchase', name: 'First Steps', desc: 'Buy your first property', icon: '🏠', category: 'Getting Started' },
        { id: 'first_sale', name: 'The Art of the Deal', desc: 'Sell a property', icon: '💰', category: 'Getting Started' },
        { id: 'first_upgrade', name: 'Home Improvement', desc: 'Upgrade a property', icon: '🔨', category: 'Getting Started' },

        // Property milestones
        { id: 'own_5', name: 'Landlord', desc: 'Own 5 properties at once', icon: '🏘', category: 'Property Milestones' },
        { id: 'own_15', name: 'Real Estate Mogul', desc: 'Own 15 properties at once', icon: '🏙', category: 'Property Milestones' },
        { id: 'own_30', name: 'Empire Builder', desc: 'Own 30 properties at once', icon: '👑', category: 'Property Milestones' },

        // Money milestones
        { id: 'cash_1m', name: 'Millionaire', desc: 'Have €1M cash on hand', icon: '💵', category: 'Wealth' },
        { id: 'cash_10m', name: 'Multi-Millionaire', desc: 'Have €10M cash on hand', icon: '💎', category: 'Wealth' },
        { id: 'worth_50m', name: 'Helsinki Tycoon', desc: 'Reach €50M net worth', icon: '🏆', category: 'Wealth' },
        { id: 'worth_100m', name: 'Untouchable', desc: 'Reach €100M net worth', icon: '⭐', category: 'Wealth' },
        { id: 'worth_200m', name: 'Helsingin Herra', desc: 'Reach €200M net worth', icon: '🌟', category: 'Wealth' },

        // Districts
        { id: 'buy_kallio', name: 'Hipster Investor', desc: 'Buy a property in Kallio', icon: '🎸', category: 'Exploration' },
        { id: 'buy_eira', name: 'High Society', desc: 'Buy a property in Eira', icon: '🥂', category: 'Exploration' },
        { id: 'buy_kaskisaari', name: 'Island Life', desc: 'Buy a property on an island district', icon: '🏝', category: 'Exploration' },

        // Types
        { id: 'own_all_types', name: 'Diversified Portfolio', desc: 'Own at least one of every property type', icon: '📊', category: 'Strategy' },
        { id: 'max_upgrade', name: 'Fully Loaded', desc: 'Upgrade a property to level 5', icon: '🔝', category: 'Strategy' },
        { id: 'perfect_condition', name: 'Pristine Empire', desc: 'Have 10+ properties all above 90% condition', icon: '✨', category: 'Strategy' },

        // Economy
        { id: 'take_loan', name: 'Leverage', desc: 'Take your first bank loan', icon: '🏦', category: 'Economy' },
        { id: 'repay_loan', name: 'Debt Free', desc: 'Fully repay a loan', icon: '🎉', category: 'Economy' },
        { id: 'revenue_100k', name: 'Cash Flow', desc: 'Earn €100K+ revenue in a single month', icon: '📈', category: 'Economy' },
        { id: 'revenue_1m', name: 'Money Printer', desc: 'Earn €1M+ revenue in a single month', icon: '🖨', category: 'Economy' },

        // Staff
        { id: 'hire_staff', name: 'Team Player', desc: 'Hire your first staff member', icon: '👤', category: 'Staff' },
        { id: 'full_staff', name: 'Full House', desc: 'Hire all 4 staff types', icon: '👥', category: 'Staff' },

        // Campaign
        { id: 'win_easy', name: 'Warm-Up', desc: 'Win a campaign on Easy', icon: '🟢', category: 'Campaign' },
        { id: 'win_normal', name: 'Contender', desc: 'Win a campaign on Normal', icon: '🟡', category: 'Campaign' },
        { id: 'win_hard', name: 'Master Tycoon', desc: 'Win a campaign on Hard', icon: '🔴', category: 'Campaign' },
        { id: 'speed_run', name: 'Speed Runner', desc: 'Win a campaign in 60 turns or less', icon: '⚡', category: 'Campaign' },

        // Milestones
        { id: 'easter_egg', name: 'Easter Egg Hunter', desc: 'Buy an easter egg property', icon: '🥚', category: 'Milestones' },
        { id: 'play_50_turns', name: 'Dedicated', desc: 'Play 50 turns in a single game', icon: '🕐', category: 'Milestones' },
        { id: 'play_100_turns', name: 'Marathon Runner', desc: 'Play 100 turns in a single game', icon: '🏃', category: 'Milestones' },

        // Strange Events — one for each easter egg event
        { id: 'seen_aliens', name: 'Close Encounter', desc: 'Witness an alien invasion', icon: '👽', category: 'Strange Events' },
        { id: 'seen_tonttu', name: 'Tonttu Whisperer', desc: 'Witness the tonttu invasion', icon: '🎅', category: 'Strange Events' },
        { id: 'seen_moose', name: 'Moose Crossing', desc: 'Witness the great moose stampede', icon: '🫎', category: 'Strange Events' },
        { id: 'seen_nokia', name: 'Connecting People', desc: 'Witness Nokia\'s triumphant return', icon: '📱', category: 'Strange Events' },
        { id: 'seen_aurora', name: 'Aurora Borealis', desc: 'See the northern lights over Helsinki', icon: '🌌', category: 'Strange Events' },
        { id: 'seen_duck', name: 'Quack!', desc: 'Spot the giant rubber duck', icon: '🦆', category: 'Strange Events' },
        { id: 'seen_bird', name: 'Bird Spotter', desc: 'See something red fly across the sky', icon: '🐦', category: 'Strange Events' },
        { id: 'seen_sweden', name: 'Du Gamla, Du Fria', desc: 'Survive the Swedish invasion', icon: '🇸🇪', category: 'Strange Events' },
    ];

    let unlocked = {}; // { achievementId: timestamp }
    let pendingNotifications = []; // achievements just unlocked, waiting to be shown

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            unlocked = raw ? JSON.parse(raw) : {};
            // Migrate old survive_aliens → seen_aliens
            if (unlocked['survive_aliens'] && !unlocked['seen_aliens']) {
                unlocked['seen_aliens'] = unlocked['survive_aliens'];
            }
            delete unlocked['survive_aliens'];
        } catch {
            unlocked = {};
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
        } catch { /* ignore */ }
    }

    function unlock(id) {
        if (unlocked[id]) return; // already unlocked
        const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
        if (!def) return;
        unlocked[id] = Date.now();
        save();
        pendingNotifications.push(def);
    }

    function isUnlocked(id) {
        return !!unlocked[id];
    }

    function getAll() {
        return ACHIEVEMENT_DEFS.map(def => ({
            ...def,
            unlocked: !!unlocked[def.id],
            unlockedAt: unlocked[def.id] || null,
        }));
    }

    function getUnlockedCount() {
        return Object.keys(unlocked).length;
    }

    function getTotalCount() {
        return ACHIEVEMENT_DEFS.length;
    }

    function popNotification() {
        return pendingNotifications.shift() || null;
    }

    function resetAll() {
        unlocked = {};
        save();
    }

    // Check game state and unlock applicable achievements
    function check(gameState) {
        const playerProps = gameState.properties.filter(p => p.owner === 'player');
        const propCount = playerProps.length;

        // Property milestones
        if (propCount >= 1) unlock('first_purchase');
        if (propCount >= 5) unlock('own_5');
        if (propCount >= 15) unlock('own_15');
        if (propCount >= 30) unlock('own_30');

        // Money milestones
        if (gameState.money >= 1000000) unlock('cash_1m');
        if (gameState.money >= 10000000) unlock('cash_10m');
        const netWorth = Economy.calculateNetWorth(gameState);
        if (netWorth >= 50000000) unlock('worth_50m');
        if (netWorth >= 100000000) unlock('worth_100m');
        if (netWorth >= 200000000) unlock('worth_200m');

        // Revenue
        if (gameState.financeHistory.length > 0) {
            const last = gameState.financeHistory[gameState.financeHistory.length - 1];
            if (last.revenue >= 100000) unlock('revenue_100k');
            if (last.revenue >= 1000000) unlock('revenue_1m');
        }

        // District-specific
        if (playerProps.some(p => p.district === 'kallio')) unlock('buy_kallio');
        if (playerProps.some(p => p.district === 'eira')) unlock('buy_eira');
        if (playerProps.some(p => ['kaskisaari', 'kuusisaari', 'kulosaari', 'lehtisaari'].includes(p.district))) unlock('buy_kaskisaari');

        // All types
        const types = new Set(playerProps.map(p => p.type));
        if (types.size >= 6) unlock('own_all_types');

        // Max upgrade
        if (playerProps.some(p => p.upgradeLevel >= 5)) unlock('max_upgrade');

        // Pristine condition
        if (propCount >= 10 && playerProps.every(p => p.condition >= 90)) unlock('perfect_condition');

        // Loan
        if (gameState.loanAmount > 0) unlock('take_loan');
        if (gameState.totalRevenueEarned > 0 && gameState.loanAmount === 0 && isUnlocked('take_loan')) unlock('repay_loan');

        // Staff
        if (gameState.staff.length >= 1) unlock('hire_staff');
        if (gameState.staff.length >= 4) unlock('full_staff');

        // Turn milestones
        if (gameState.turn >= 50) unlock('play_50_turns');
        if (gameState.turn >= 100) unlock('play_100_turns');

        // Strange events — check active events for each easter egg
        const activeIds = new Set(gameState.activeEvents.map(e => e.id));
        if (activeIds.has('alien_invasion')) unlock('seen_aliens');
        if (activeIds.has('tonttu_invasion')) unlock('seen_tonttu');
        if (activeIds.has('moose_rush_hour')) unlock('seen_moose');
        if (activeIds.has('nokia_comeback')) unlock('seen_nokia');
        if (activeIds.has('northern_lights')) unlock('seen_aurora');
        if (activeIds.has('rubber_duck')) unlock('seen_duck');
        if (activeIds.has('angry_bird')) unlock('seen_bird');
        if (activeIds.has('swedish_invasion')) unlock('seen_sweden');

        // Easter eggs
        if (playerProps.some(p => p.easterEgg)) unlock('easter_egg');
    }

    // Called when player wins
    function checkWin(gameState) {
        if (gameState.difficulty === 'easy') unlock('win_easy');
        if (gameState.difficulty === 'normal') unlock('win_normal');
        if (gameState.difficulty === 'hard') unlock('win_hard');
        if (gameState.turn <= 60) unlock('speed_run');
    }

    // Action-specific unlocks
    function onBuy() { unlock('first_purchase'); }
    function onSell() { unlock('first_sale'); }
    function onUpgrade() { unlock('first_upgrade'); }

    // Init
    load();

    return {
        check,
        checkWin,
        onBuy,
        onSell,
        onUpgrade,
        getAll,
        getUnlockedCount,
        getTotalCount,
        popNotification,
        isUnlocked,
        resetAll,
    };
})();
