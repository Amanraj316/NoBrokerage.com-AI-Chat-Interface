// backend/searchService.js

function extractBhkFromString(bhkString) {
  if (!bhkString) return null;
  const match = bhkString.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

function searchProjects(allProjects, filters) {
  let filteredProjects = [...allProjects];

  // 1. Prioritize project name filter if it exists
  if (filters.projectName) {
    filteredProjects = filteredProjects.filter(p => 
      p.projectName && p.projectName.toLowerCase() === filters.projectName.toLowerCase()
    );
  }

  // 2. Then, filter by city if specified
  if (filters.city) {
    filteredProjects = filteredProjects.filter(p => 
      p.address.fullAddress && p.address.fullAddress.toLowerCase().includes(filters.city)
    );
  }

  const finalResults = [];

  // 3. Finally, iterate over the narrowed-down projects to find matching configurations
  filteredProjects.forEach(project => {
    const matchingConfigs = project.configurations.filter(config => {
      let bhkMatch = true;
      let budgetMatch = true;

      if (filters.bhk) {
        const configBhkValue = extractBhkFromString(config.type);
        bhkMatch = configBhkValue === filters.bhk;
      }

      if (filters.budget && filters.budget.max) {
        budgetMatch = config.variants.some(variant => {
          const price = parseFloat(variant.price);
          return !isNaN(price) && price <= filters.budget.max;
        });
      }
      return bhkMatch && budgetMatch;
    });

    if (matchingConfigs.length > 0) {
      finalResults.push({
        ...project,
        configurations: matchingConfigs,
      });
    }
  });

  return finalResults;
}

module.exports = { searchProjects };