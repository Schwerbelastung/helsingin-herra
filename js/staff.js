// Helsingin Herra - Staff System
const Staff = (() => {

    const MAINTENANCE_TIERS = [
        null, // tier 0 = none
        {
            tier: 1,
            name: 'Maintenance Person (Tier 1)',
            description: 'Repairs 1 property per turn at 50% cost.',
            baseSalary: 2000,
            hireCostBase: 6000, // 3x base salary
            repairsPerTurn: 1,
        },
        {
            tier: 2,
            name: 'Maintenance Person (Tier 2)',
            description: 'Repairs 2 properties per turn at 50% cost.',
            baseSalary: 3000,
            hireCostBase: 9000,
            repairsPerTurn: 2,
        },
        {
            tier: 3,
            name: 'Maintenance Person (Tier 3)',
            description: 'Repairs 3 properties per turn at 50% cost.',
            baseSalary: 4500,
            hireCostBase: 13500,
            repairsPerTurn: 3,
        },
        {
            tier: 4,
            name: 'Maintenance Person (Tier 4)',
            description: 'Repairs 4 properties per turn at 50% cost.',
            baseSalary: 6750,
            hireCostBase: 20250,
            repairsPerTurn: 4,
        },
        {
            tier: 5,
            name: 'Maintenance Person (Tier 5)',
            description: 'Repairs 5 properties per turn at 50% cost.',
            baseSalary: 10125,
            hireCostBase: 30375,
            repairsPerTurn: 5,
        },
    ];

    const STAFF_DEFS = [
        {
            id: 'manager',
            name: 'Property Manager',
            description: '+1 action per turn.',
            baseSalary: 5000,
        },
        {
            id: 'accountant',
            name: 'Accountant',
            description: 'Reduces loan interest rate by 1.5%.',
            baseSalary: 3000,
        },
        {
            id: 'scout',
            name: 'Scout',
            description: 'Reveals the best available deal each turn in the news ticker.',
            baseSalary: 1500,
        },
    ];

    function getDefinitions() {
        return STAFF_DEFS;
    }

    function getDefinition(id) {
        return STAFF_DEFS.find(s => s.id === id);
    }

    function getMaintenanceTierDef(tier) {
        return MAINTENANCE_TIERS[tier] || null;
    }

    function getSalary(staffId, turn) {
        const def = getDefinition(staffId);
        if (!def) return 0;
        const yearsElapsed = Math.floor((turn - 1) / 12);
        return Math.floor(def.baseSalary * Math.pow(1.15, yearsElapsed));
    }

    function getMaintenanceSalary(tier, turn) {
        const def = getMaintenanceTierDef(tier);
        if (!def) return 0;
        const yearsElapsed = Math.floor((turn - 1) / 12);
        return Math.floor(def.baseSalary * Math.pow(1.15, yearsElapsed));
    }

    function getTotalSalaries(gameState) {
        let total = 0;

        // Maintenance worker tier salary
        if (gameState.maintenanceTier) {
            total += getMaintenanceSalary(gameState.maintenanceTier, gameState.turn);
        }

        // Other staff
        for (const id of gameState.staff) {
            total += getSalary(id, gameState.turn);
        }
        return total;
    }

    function getHireCost(staffId, turn) {
        // Hiring costs 3x monthly salary as a one-time fee
        return getSalary(staffId, turn) * 3;
    }

    function getMaintenanceHireCost(tier) {
        const def = getMaintenanceTierDef(tier);
        if (!def) return 0;
        return def.hireCostBase;
    }

    function isHired(gameState, staffId) {
        return gameState.staff.includes(staffId);
    }

    function getMaintenanceTier(gameState) {
        return gameState.maintenanceTier || 0;
    }

    function hire(gameState, staffId) {
        if (isHired(gameState, staffId)) return false;
        const cost = getHireCost(staffId, gameState.turn);
        if (gameState.money < cost) return false;
        gameState.money -= cost;
        gameState.staff.push(staffId);
        return true;
    }

    function hireMaintenanceTier(gameState, tier) {
        if (tier < 1 || tier > 5) return false;
        if (gameState.maintenanceTier === tier) return false; // already hired
        const cost = getMaintenanceHireCost(tier);
        if (gameState.money < cost) return false;
        gameState.money -= cost;
        gameState.maintenanceTier = tier;
        return true;
    }

    function fireMaintenanceTier(gameState) {
        gameState.maintenanceTier = 0;
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

        // Maintenance Person: repair multiple properties based on tier at 50% cost
        const maintenanceTier = getMaintenanceTier(gameState);
        if (maintenanceTier > 0) {
            const tierDef = getMaintenanceTierDef(maintenanceTier);
            const repairsPerTurn = tierDef.repairsPerTurn;
            const damaged = gameState.properties.filter(p => p.owner === 'player' && p.condition < 100);
            let totalRepairCost = 0;
            let repairsCount = 0;

            // Repair up to repairsPerTurn properties
            for (let i = 0; i < Math.min(repairsPerTurn, damaged.length); i++) {
                const prop = damaged[i];
                const fullCost = Properties.getRepairCost(prop);
                const cost = Math.floor(fullCost * 0.5);
                gameState.money -= cost;
                totalRepairCost += cost;
                prop.condition = 100;
                repairsCount++;
            }

            if (repairsCount > 0) {
                const plural = repairsCount > 1 ? `${repairsCount} properties` : 'property';
                results.push(`🔧 Maintenance (Tier ${maintenanceTier}): repaired ${plural} for €${UI.formatMoney(totalRepairCost)}`);
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
                const msg = `🔍 Scout tip: ${best.name} in ${best.districtName} — €${UI.formatMoney(best.price)}, ${roi}% ROI`;
                results.push({ text: msg, scoutProperty: best });
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
        MAINTENANCE_TIERS,
        getMaintenanceTierDef,
        getMaintenanceSalary,
        getMaintenanceHireCost,
        getMaintenanceTier,
        hireMaintenanceTier,
        fireMaintenanceTier,
    };
})();
