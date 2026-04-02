// Helsingin Herra - Staff System
const Staff = (() => {

    const STAFF_DEFS = [
        {
            id: 'maintenance',
            name: 'Maintenance Person',
            description: 'Repairs one random property to 100% each turn at 50% of normal cost.',
            baseSalary: 2000,
            salaryScale: 500, // +€500 per 12 turns
        },
        {
            id: 'manager',
            name: 'Property Manager',
            description: '+1 action per turn.',
            baseSalary: 5000,
            salaryScale: 1000,
        },
        {
            id: 'accountant',
            name: 'Accountant',
            description: 'Reduces loan interest rate by 1.5%.',
            baseSalary: 3000,
            salaryScale: 750,
        },
        {
            id: 'scout',
            name: 'Scout',
            description: 'Reveals the best available deal each turn in the news ticker.',
            baseSalary: 1500,
            salaryScale: 400,
        },
    ];

    function getDefinitions() {
        return STAFF_DEFS;
    }

    function getDefinition(id) {
        return STAFF_DEFS.find(s => s.id === id);
    }

    function getSalary(staffId, turn) {
        const def = getDefinition(staffId);
        if (!def) return 0;
        return def.baseSalary + Math.floor((turn - 1) / 12) * def.salaryScale;
    }

    function getTotalSalaries(gameState) {
        let total = 0;
        for (const id of gameState.staff) {
            total += getSalary(id, gameState.turn);
        }
        return total;
    }

    function getHireCost(staffId, turn) {
        // Hiring costs 3x monthly salary as a one-time fee
        return getSalary(staffId, turn) * 3;
    }

    function isHired(gameState, staffId) {
        return gameState.staff.includes(staffId);
    }

    function hire(gameState, staffId) {
        if (isHired(gameState, staffId)) return false;
        const cost = getHireCost(staffId, gameState.turn);
        if (gameState.money < cost) return false;
        gameState.money -= cost;
        gameState.staff.push(staffId);
        return true;
    }

    function fire(gameState, staffId) {
        const idx = gameState.staff.indexOf(staffId);
        if (idx === -1) return false;
        gameState.staff.splice(idx, 1);
        return true;
    }

    // Apply staff effects at end of turn. Returns summary of what happened.
    function processStaffEffects(gameState) {
        const results = [];

        // Maintenance Person: repair one random property at 50% cost
        if (isHired(gameState, 'maintenance')) {
            const damaged = gameState.properties.filter(p => p.owner === 'player' && p.condition < 90);
            if (damaged.length > 0) {
                const prop = damaged[Math.floor(Math.random() * damaged.length)];
                const fullCost = Properties.getRepairCost(prop);
                const cost = Math.floor(fullCost * 0.5);
                gameState.money -= cost;
                prop.condition = 100;
                results.push(`🔧 Maintenance: repaired ${prop.name} for €${UI.formatMoney(cost)}`);
            }
        }

        // Property Manager: +1 action (applied when resetting actions)
        // Handled in endTurn via getActionsPerTurn()

        // Accountant: interest reduction applied via getEffectiveInterestRate()
        // Handled in economy calculations

        // Scout: find best deal
        if (isHired(gameState, 'scout')) {
            const available = gameState.properties.filter(p => p.owner === null && p.price <= gameState.money);
            if (available.length > 0) {
                // Best ROI
                const best = available.reduce((a, b) => {
                    const roiA = a.price > 0 ? (a.revenue / a.price) : 0;
                    const roiB = b.price > 0 ? (b.revenue / b.price) : 0;
                    return roiB > roiA ? b : a;
                });
                const roi = best.price > 0 ? (best.revenue / best.price * 100).toFixed(1) : '0';
                results.push(`🔍 Scout tip: ${best.name} in ${best.districtName} — €${UI.formatMoney(best.price)}, ${roi}% ROI`);
            }
        }

        return results;
    }

    function getActionsBonus(gameState) {
        return isHired(gameState, 'manager') ? 1 : 0;
    }

    function getInterestReduction(gameState) {
        return isHired(gameState, 'accountant') ? 0.015 : 0;
    }

    return {
        getDefinitions,
        getDefinition,
        getSalary,
        getTotalSalaries,
        getHireCost,
        isHired,
        hire,
        fire,
        processStaffEffects,
        getActionsBonus,
        getInterestReduction,
    };
})();
