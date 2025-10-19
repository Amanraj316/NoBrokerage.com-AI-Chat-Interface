// backend/dataService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Helper function to read a single CSV file
function readCsv(filename) {
  const results = [];
  const filePath = path.join(__dirname, '..', 'data', filename);
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

let mergedProjects = [];

async function loadAndMergeData() {
  try {
    const [
      projects,
      addresses,
      configs,
      variants
    ] = await Promise.all([
      readCsv('project.csv'),
      readCsv('ProjectAddress.csv'),
      readCsv('ProjectConfiguration.csv'),
      readCsv('ProjectConfigurationVariant.csv')
    ]);

    // These keys are now corrected based on your log output
    const PROJECT_ID_KEY = 'id';
    const ADDRESS_PROJECT_ID_KEY = 'projectId';
    const CONFIG_PROJECT_ID_KEY = 'projectId';
    const CONFIG_ID_KEY = 'id';
    const VARIANT_CONFIG_ID_KEY = 'configurationId';

    // Create maps for efficient lookups
    const addressMap = new Map(addresses.map(item => [item[ADDRESS_PROJECT_ID_KEY], item]));
    const configMap = new Map();
    configs.forEach(config => {
      const key = config[CONFIG_PROJECT_ID_KEY];
      if (!configMap.has(key)) {
        configMap.set(key, []);
      }
      configMap.get(key).push(config);
    });
    
    const variantMap = new Map();
    variants.forEach(variant => {
      const key = variant[VARIANT_CONFIG_ID_KEY];
      if (!variantMap.has(key)) {
        variantMap.set(key, []);
      }
      variantMap.get(key).push(variant);
    });

    // Merge all the data together
    mergedProjects = projects.map(project => {
      const projectId = project[PROJECT_ID_KEY];
      const projectConfigs = configMap.get(projectId) || [];
      
      const detailedConfigs = projectConfigs.map(config => ({
        ...config,
        variants: variantMap.get(config[CONFIG_ID_KEY]) || [],
      }));

      return {
        ...project,
        address: addressMap.get(projectId) || {},
        configurations: detailedConfigs,
      };
    });

    console.log('All CSV files successfully processed and merged.');
    console.log(`Loaded ${mergedProjects.length} unified projects.`);

  } catch (error) {
    console.error('Failed to load or merge data:', error);
    throw error;
  }
}

function getProjects() {
  return mergedProjects;
}

module.exports = { loadData: loadAndMergeData, getProjects };