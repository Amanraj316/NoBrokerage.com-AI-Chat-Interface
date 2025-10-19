// backend/parserService.js

function parseQuery(query) {
  const lowerCaseQuery = query.toLowerCase();

  const bhk = extractBHK(lowerCaseQuery);
  const city = extractCity(lowerCaseQuery);
  const budget = extractBudget(lowerCaseQuery);

  return { bhk, city, budget };
}

function extractBHK(query) {
  const bhkMatch = query.match(/(\d+)\s*bhk/);
  if (bhkMatch) {
    return parseInt(bhkMatch[1], 10);
  }
  return null;
}

// In backend/parserService.js

function extractCity(query) {
  const cities = ['pune', 'mumbai', 'bangalore', 'delhi', 'chennai'];
  // The .find() method will check if any of the cities are included in the query
  const foundCity = cities.find(city => query.includes(city));
  // Return the found city, or null if no city was found
  return foundCity || null;
}

function extractBudget(query) {
  // Matches patterns like "under 1.5 cr", "below 80 lakh", "upto 1.2cr"
  const budgetMatch = query.match(/(?:under|below|upto|less than)\s*([\d.]+)\s*(cr|lakh|lac)/);
  if (budgetMatch) {
    const amount = parseFloat(budgetMatch[1]);
    const unit = budgetMatch[2];

    if (unit === 'cr') {
      return { max: amount * 10000000 }; // Convert crores to absolute value
    } else if (unit === 'lakh' || unit === 'lac') {
      return { max: amount * 100000 }; // Convert lakhs to absolute value
    }
  }
  return null;
}

module.exports = { parseQuery };