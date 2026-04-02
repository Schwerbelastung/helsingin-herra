// Helsinki Tycoon - Seasons System
const Seasons = (() => {
    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function getCurrentSeason(month) {
        // month is 0-indexed (0 = January)
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    function getMonthName(month) {
        return MONTHS[month % 12];
    }

    // Revenue modifiers by property type and season
    function getRevenueModifier(propertyType, season) {
        const modifiers = {
            hotel: { winter: 0.7, spring: 0.9, summer: 1.4, autumn: 0.85 },
            restaurant: { winter: 0.8, spring: 1.0, summer: 1.3, autumn: 0.9 },
            retail: { winter: 1.1, spring: 0.95, summer: 1.0, autumn: 0.95 }, // Xmas boost in winter
            residential: { winter: 1.0, spring: 1.0, summer: 1.0, autumn: 1.0 }, // Stable
            office: { winter: 1.0, spring: 1.0, summer: 0.9, autumn: 1.05 }, // Summer holidays reduce office
            landmark: { winter: 0.6, spring: 0.9, summer: 1.5, autumn: 0.8 },
        };
        return (modifiers[propertyType] && modifiers[propertyType][season]) || 1.0;
    }

    return {
        MONTHS,
        getCurrentSeason,
        getMonthName,
        getRevenueModifier,
    };
})();
