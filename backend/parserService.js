// backend/parserService.js

// This function now takes the list of all projects to check against
function parseQuery(query, allProjects) {
  const lowerCaseQuery = query.toLowerCase();

  // --- NEW: Project Name Extraction ---
  // We prioritize this. If the query matches a project name, we assume that's the main filter.
  const projectName = extractProjectName(lowerCaseQuery, allProjects);

  const bhk = extractBHK(lowerCaseQuery);
  const city = extractCity(lowerCaseQuery);
  const budget = extractBudget(lowerCaseQuery);

  return { bhk, city, budget, projectName };
}

function extractProjectName(query, allProjects) {
  // Find the first project whose name is included in the user's query.
  const foundProject = allProjects.find(p =>
    query.includes((p.projectName || '').toLowerCase())
  );
  // Return the actual project name if found, otherwise null.
  return foundProject ? foundProject.projectName : null;
}

// --- No changes to the functions below ---
function extractBHK(query) {
  const bhkMatch = query.match(/(\d+\.?\d*)\s*bhk/);
  return bhkMatch ? parseFloat(bhkMatch[1]) : null;
}

function extractCity(query) {
  const cities = ['pune', 'mumbai', 'bangalore', 'delhi', 'chennai'];
  const foundCity = cities.find(city => query.includes(city));
  return foundCity || null;
}

function extractBudget(query) {
  const budgetMatch = query.match(/(?:under|below|upto|less than)\s*([\d.]+)\s*(cr|lakh|lac)/);
  if (budgetMatch) {
    const amount = parseFloat(budgetMatch[1]);
    const unit = budgetMatch[2];
    if (unit === 'cr') return { max: amount * 10000000 };
    if (unit === 'lakh' || unit === 'lac') return { max: amount * 100000 };
  }
  return null;
}

module.exports = { parseQuery };