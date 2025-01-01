const fs = require('fs');
const path = require('path');

function createReportDir(testType, environment) {
  // Create base reports directory
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Create test type directory
  const testTypeDir = path.join(reportsDir, testType);
  if (!fs.existsSync(testTypeDir)) {
    fs.mkdirSync(testTypeDir);
  }

  // Create environment directory
  const envDir = path.join(testTypeDir, environment);
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir);
  }

  // Create timestamp directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(envDir, timestamp);
  fs.mkdirSync(reportDir);

  return { reportDir, timestamp };
}

async function saveReport(page, reportDir, data) {
  // Save request/response data
  fs.writeFileSync(
    path.join(reportDir, 'data.json'),
    JSON.stringify(data, null, 2)
  );

  // Take screenshot
  await page.screenshot({
    path: path.join(reportDir, 'screenshot.png'),
    fullPage: true
  });
}

function getAllReports() {
  const reportsDir = path.join(__dirname, '../../reports');
  const reports = [];

  // Get all test types (newclient, kyc)
  const testTypes = fs.readdirSync(reportsDir);
  
  testTypes.forEach(testType => {
    const testTypePath = path.join(reportsDir, testType);
    const environments = fs.readdirSync(testTypePath);
    
    environments.forEach(env => {
      const envPath = path.join(testTypePath, env);
      const timestamps = fs.readdirSync(envPath);
      
      timestamps.forEach(timestamp => {
        const reportPath = path.join(envPath, timestamp);
        const dataPath = path.join(reportPath, 'data.json');
        
        if (fs.existsSync(dataPath)) {
          const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          
          // Get all PNG files in the report directory
          const screenshots = fs.readdirSync(reportPath)
            .filter(file => file.endsWith('.png'))
            .sort()  // Sort to maintain order (01-, 02-, etc.)
            .map(file => ({
              name: file,
              path: path.join(reportPath, file)
            }));

          reports.push({
            testType,
            environment: env,
            timestamp,
            data,
            screenshots,
            relativePath: path.relative(reportsDir, reportPath)
          });
        }
      });
    });
  });

  return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getAllTimestamps() {
  const reportsDir = path.join(__dirname, '../../reports');
  const timestamps = new Set();

  // Get all test types (newclient, kyc)
  const testTypes = fs.readdirSync(reportsDir);
  
  testTypes.forEach(testType => {
    const testTypePath = path.join(reportsDir, testType);
    const environments = fs.readdirSync(testTypePath);
    
    environments.forEach(env => {
      const envPath = path.join(testTypePath, env);
      const reportTimestamps = fs.readdirSync(envPath);
      reportTimestamps.forEach(ts => timestamps.add(ts));
    });
  });

  return Array.from(timestamps).sort().reverse();
}

module.exports = {
  createReportDir,
  saveReport,
  getAllReports,
  getAllTimestamps
}; 