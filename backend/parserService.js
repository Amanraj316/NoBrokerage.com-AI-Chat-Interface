// backend/parserService.js

function parseQuery(query, allProjects) {
  const lowerCaseQuery = query.toLowerCase();

  const projectName = extractProjectName(lowerCaseQuery, allProjects);
  const bhk = extractBHK(lowerCaseQuery);
  const city = extractCity(lowerCaseQuery);
  const budget = extractBudget(lowerCaseQuery);

  return { bhk, city, budget, projectName };
}

function extractProjectName(query, allProjects) {
  // Gracefully handle if allProjects isn't available
  if (!allProjects) return null;
  
  const foundProject = allProjects.find(p =>
    p && p.projectName && query.includes(p.projectName.toLowerCase())
  );
  return foundProject ? foundProject.projectName : null;
}

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