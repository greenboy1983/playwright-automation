const { chromium } = require('playwright');
const { createReportDir, saveReport } = require('../utils/reportUtils');

async function createNewClient(environment, clientInfo) {
  let browser = null;
  let reportDir = null;

  try {
    // Create report directory
    const { reportDir: dir } = createReportDir('newclient', environment);
    reportDir = dir;

    // Launch browser
    browser = await chromium.launch({
      headless: false,
      slowMo: 500
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();

    try {
      console.log(`Starting client creation in ${environment} environment`);
      console.log('Client information:', clientInfo);

      await page.goto('https://example.com');

      // Mock client creation process
      await page.waitForTimeout(1000);

      const result = {
        success: true,
        clientId: 'mock-client-id-' + Date.now(),
        createdAt: new Date().toISOString()
      };

      // Save report
      await saveReport(page, reportDir, {
        type: 'newclient',
        environment,
        request: clientInfo,
        response: result,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Automation script failed:', error);
      
      // Save error report
      await saveReport(page, reportDir, {
        type: 'newclient',
        environment,
        request: clientInfo,
        error: {
          message: error.message,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  } catch (error) {
    console.error('Operation failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = createNewClient; 