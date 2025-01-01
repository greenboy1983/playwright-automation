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

module.exports = {
  createReportDir,
  saveReport
}; 