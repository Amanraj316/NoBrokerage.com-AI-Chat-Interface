// backend/searchService.js

// Helper function to safely extract the number from a string like "2BHK" or "4.5 BHK"
function extractBhkFromString(bhkString) {
  if (!bhkString) return null;
  const match = bhkString.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

function searchProjects(allProjects, filters) {
  // 1. First, filter by city to reduce the number of projects to check
  let results = [...allProjects];

  // --- NEW: Filter by Project Name FIRST ---
  // If a specific project name was found, this is the most important filter.
  if (filters.projectName) {
    results = results.filter(p => 
      (p.projectName || '').toLowerCase() === filters.projectName.toLowerCase()
    );
  }

  // --- Then, filter the remaining results by city ---
  if (filters.city) {
    results = results.filter(p => 
      p.address.fullAddress && p.address.fullAddress.toLowerCase().includes(filters.city)
    );
  }

  const finalResults = [];

  // 2. Now, iterate over the remaining projects to find matching configurations
  cityFilteredProjects.forEach(project => {
    const matchingConfigs = project.configurations.filter(config => {
      let bhkMatch = true;
      let budgetMatch = true;

      // Check for a BHK match
      if (filters.bhk) {
        const configBhkValue = extractBhkFromString(config.type);
        bhkMatch = configBhkValue === filters.bhk;
      }

      // Check for a budget match
      if (filters.budget && filters.budget.max) {
        budgetMatch = config.variants.some(variant => {
          const price = parseFloat(variant.price);
          return !isNaN(price) && price <= filters.budget.max;
        });
      }

      // A configuration must match all criteria
      return bhkMatch && budgetMatch;
    });

    // 3. If we found any configurations that match...
    if (matchingConfigs.length > 0) {
      // ...add a new version of the project to our results,
      // but with its configurations list ONLY containing the ones that matched.
      finalResults.push({
        ...project,
        configurations: matchingConfigs,
      });
    }
  });

  return finalResults;
}

module.exports = { searchProjects };