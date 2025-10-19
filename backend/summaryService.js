// backend/summaryService.js

// A simple list of known localities to help with analysis.
const PUNE_LOCALITIES = ['wakad', 'baner', 'kharadi', 'punawale', 'mamurdi', 'ravet', 'shivajinagar', 'mundhwa'];
const MUMBAI_LOCALITIES = ['chembur', 'mulund', 'andheri', 'ghatkopar', 'sewri', 'dombivli'];

function generateSummary(results, filters) {
    const count = results.length;

    // Handle the "no results" case with a more helpful message [cite: 54]
    if (count === 0) {
        const bhkInfo = filters.bhk ? `${filters.bhk}BHK ` : '';
        const cityInfo = filters.city ? ` in ${filters.city}` : '';
        return `I couldn't find any ${bhkInfo}properties matching your criteria${cityInfo}. You could try adjusting your budget or searching in a different area.`;
    }

    const bhkInfo = filters.bhk ? `${filters.bhk}BHK` : 'properties';
    const cityInfo = filters.city ? ` in ${filters.city}` : '';

    // --- Analyze Localities to find common areas ---
    const localityCounts = {};
    const relevantLocalities = filters.city === 'pune' ? PUNE_LOCALITIES : MUMBAI_LOCALITIES;

    results.forEach(project => {
        const address = (project.address.fullAddress || '').toLowerCase();
        relevantLocalities.forEach(loc => {
            if (address.includes(loc)) {
                localityCounts[loc] = (localityCounts[loc] || 0) + 1;
            }
        });
    });

    // Get the top 2 most frequent localities
    const topLocalities = Object.entries(localityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1)); // Capitalize

    let localitySentence = '';
    if (topLocalities.length > 1) {
        localitySentence = ` Most of them are located around ${topLocalities.join(' and ')}.`;
    } else if (topLocalities.length === 1) {
        localitySentence = ` They are primarily concentrated in the ${topLocalities[0]} area.`;
    }

    // --- Construct the final, expanded summary ---
    let summary = `Great! I found ${count} matching ${bhkInfo}${cityInfo}.`;
    summary += localitySentence;

    return summary;
}

module.exports = { generateSummary };