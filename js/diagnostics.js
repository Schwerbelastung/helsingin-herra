// Diagnostics Tool - Property Distribution Analysis
// Run this in the console to check game balance for 1+3 rivals

const PropertyDiagnostics = (() => {

    function analyzeDistribution() {
        if (!GameState || !GameState.properties) {
            console.log('❌ Game not loaded. Start a game first.');
            return;
        }

        const props = GameState.properties;
        const playerCapital = GameState.money;

        // Price brackets
        const brackets = [
            { min: 0, max: 200000, label: 'Ultra-cheap (0-200K)' },
            { min: 200000, max: 1000000, label: 'Cheap (200K-1M)' },
            { min: 1000000, max: 5000000, label: 'Mid (1M-5M)' },
            { min: 5000000, max: 20000000, label: 'Expensive (5M-20M)' },
            { min: 20000000, max: Infinity, label: 'Ultra-expensive (20M+)' },
        ];

        console.log('\n📊 PROPERTY DISTRIBUTION ANALYSIS\n');
        console.log(`Total Properties: ${props.length}`);
        console.log(`Player Starting Capital: €${UI.formatMoney(playerCapital)}\n`);

        const distribution = {};
        let cheapCount = 0;

        for (const bracket of brackets) {
            const count = props.filter(p => p.price >= bracket.min && p.price < bracket.max).length;
            const pct = ((count / props.length) * 100).toFixed(1);
            distribution[bracket.label] = count;

            console.log(`${bracket.label}: ${count} (${pct}%)`);
            if (bracket.max <= 5000000) cheapCount += count;
        }

        console.log(`\n💰 AFFORDABLE ANALYSIS\n`);
        const affordableAtStart = props.filter(p => p.price <= playerCapital).length;
        console.log(`Properties affordable at start (≤€${UI.formatMoney(playerCapital)}): ${affordableAtStart}`);
        console.log(`Cheap properties total (≤€5M): ${cheapCount}`);

        // Estimate for 4 players
        console.log(`\n🎮 EARLY-GAME FAIRNESS CHECK (1 Player + 3 Rivals)\n`);
        const avgNeededPerPlayer = Math.ceil(cheapCount / 4);
        console.log(`If divided equally: ~${avgNeededPerPlayer} cheap properties per player`);
        console.log(`First player (you) advantage: Can buy ~${affordableAtStart} properties immediately`);

        const rivalsWill = cheapCount - affordableAtStart;
        console.log(`Left for 3 rivals: ~${rivalsWill} cheap properties`);
        console.log(`Per rival average: ~${Math.ceil(rivalsWill / 3)}`);

        if (cheapCount >= 10 && cheapCount < 20) {
            console.log('\n⚠️  CONCERN: Limited cheap properties (< 20)');
            console.log('Player advantage in first turn could be significant.');
        } else if (cheapCount < 10) {
            console.log('\n🚨 PROBLEM: Very few cheap properties (< 10)');
            console.log('Game balance severely compromised for early game.');
        } else if (cheapCount >= 20) {
            console.log('\n✅ GOOD: Plenty of cheap properties for balanced gameplay');
        }

        // By type breakdown
        console.log(`\n📂 CHEAP PROPERTIES BY TYPE\n`);
        const types = {};
        props.filter(p => p.price <= 5000000).forEach(p => {
            types[p.type] = (types[p.type] || 0) + 1;
        });

        for (const [type, count] of Object.entries(types).sort()) {
            console.log(`  ${type}: ${count}`);
        }

        // By district
        console.log(`\n🗺️  CHEAP PROPERTIES BY DISTRICT\n`);
        const districts = {};
        props.filter(p => p.price <= 5000000).forEach(p => {
            districts[p.district] = (districts[p.district] || 0) + 1;
        });

        const sortedDistricts = Object.entries(districts).sort((a, b) => b[1] - a[1]);
        for (const [district, count] of sortedDistricts) {
            console.log(`  ${district}: ${count}`);
        }

        console.log('\n💡 RECOMMENDATION:');
        if (cheapCount < 15) {
            console.log('Consider adding more budget-friendly properties (under €5M).');
            console.log('This ensures all 4 players have viable early-game options.');
        } else {
            console.log('Property distribution looks balanced for 1+3 rival games.');
        }
    }

    function propertysByPriceRange(min, max) {
        const props = GameState.properties.filter(p => p.price >= min && p.price < max);
        console.log(`\nProperties between €${UI.formatMoney(min)} - €${UI.formatMoney(max)} (${props.length} total):`);
        props.forEach(p => {
            console.log(`  ${p.name} (${p.type}) - €${UI.formatMoney(p.price)}`);
        });
        return props;
    }

    return {
        analyzeDistribution,
        propertysByPriceRange,
    };
})();

// Usage: PropertyDiagnostics.analyzeDistribution()
