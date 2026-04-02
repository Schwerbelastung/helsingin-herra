// Helsinki Tycoon - Economy System
const Economy = (() => {

    function calculateMonthlyRevenue(property, season, activeEvents) {
        let revenue = property.revenue;
        if (property.owner !== 'player' && property.owner !== null) return 0;
        if (property.owner !== 'player') return 0;

        // Season modifiers
        const seasonMod = Seasons.getRevenueModifier(property.type, season);
        revenue *= seasonMod;

        // Event modifiers
        if (activeEvents && activeEvents.length > 0) {
            for (const event of activeEvents) {
                if (event.revenueModifier == null) continue;
                if (event.affectedDistricts && event.affectedDistricts.includes(property.district)) {
                    revenue *= (1 + event.revenueModifier);
                } else if (event.global) {
                    revenue *= (1 + event.revenueModifier);
                }
            }
        }

        // Condition affects revenue
        const conditionMod = 0.5 + (property.condition / 100) * 0.5;
        revenue *= conditionMod;

        return Math.floor(revenue);
    }

    function calculateNetWorth(gameState) {
        let worth = gameState.money;
        for (const prop of gameState.properties) {
            if (prop.owner === 'player') {
                worth += prop.price;
            }
        }
        worth -= gameState.loanAmount || 0;
        return worth;
    }

    function calculateMaintenanceCost(property, season) {
        let cost = Math.floor(property.basePrice * 0.002); // 0.2% of value per month base
        if (season === 'winter') {
            cost = Math.floor(cost * 1.5); // 50% more in winter (heating)
        }
        return cost;
    }

    function processMonthlyFinances(gameState) {
        let totalRevenue = 0;
        let totalMaintenance = 0;
        const season = Seasons.getCurrentSeason(gameState.month);

        for (const prop of gameState.properties) {
            if (prop.owner === 'player') {
                const rev = calculateMonthlyRevenue(prop, season, gameState.activeEvents);
                const maint = calculateMaintenanceCost(prop, season);
                totalRevenue += rev;
                totalMaintenance += maint;

                // Degrade condition
                Properties.degradeCondition(prop);
            }
        }

        // Loan payment (accountant reduces rate)
        let loanPayment = 0;
        if (gameState.loanAmount > 0) {
            const effectiveRate = Math.max(0.01, gameState.loanInterestRate - Staff.getInterestReduction(gameState));
            const monthlyRate = effectiveRate / 12;
            loanPayment = Math.floor(gameState.loanAmount * monthlyRate);
        }

        // Staff salaries
        const staffSalaries = Staff.getTotalSalaries(gameState);

        const netIncome = totalRevenue - totalMaintenance - loanPayment - staffSalaries;
        gameState.money += netIncome;

        return {
            revenue: totalRevenue,
            maintenance: totalMaintenance,
            loanPayment,
            staffSalaries,
            netIncome,
        };
    }

    function canTakeLoan(gameState) {
        return gameState.turn >= 3;
    }

    function getMaxLoan(gameState) {
        return Math.floor(calculateNetWorth(gameState) * 2);
    }

    function getAvailableCredit(gameState) {
        return Math.max(0, getMaxLoan(gameState) - (gameState.loanAmount || 0));
    }

    function takeLoan(gameState, amount) {
        if (!canTakeLoan(gameState)) return false;
        if (amount > getAvailableCredit(gameState)) return false;
        if (amount <= 0) return false;
        gameState.loanAmount += amount;
        gameState.money += amount;
        return true;
    }

    function repayLoan(gameState, amount) {
        if (gameState.loanAmount <= 0) return false;
        const repayAmount = Math.min(amount, gameState.loanAmount, gameState.money);
        gameState.money -= repayAmount;
        gameState.loanAmount -= repayAmount;
        return true;
    }

    return {
        calculateMonthlyRevenue,
        calculateNetWorth,
        calculateMaintenanceCost,
        processMonthlyFinances,
        canTakeLoan,
        getMaxLoan,
        getAvailableCredit,
        takeLoan,
        repayLoan,
    };
})();
