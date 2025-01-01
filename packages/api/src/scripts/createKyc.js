const { chromium } = require('playwright');
const { createReportDir, saveReport } = require('../utils/reportUtils');
const path = require('path');
const fs = require('fs');

async function createKyc(environment, clientInfo) {
  let browser = null;
  let reportDir = null;

  try {
    // Create report directory
    const { reportDir: dir } = createReportDir('kyc', environment);
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
      console.log(`Starting KYC creation in ${environment} environment`);
      console.log('Client information:', clientInfo);

      // Save request info
      fs.writeFileSync(
        path.join(reportDir, 'data.json'),
        JSON.stringify({ environment, clientInfo }, null, 2)
      );

      await page.goto('https://example.com');
      await page.screenshot({ 
        path: path.join(reportDir, '01-initial.png'),
        fullPage: true
      });

      // Mock KYC process - first step
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(reportDir, '02-process.png'),
        fullPage: true
      });

      // Mock KYC process - additional step
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(reportDir, '03-process-additional.png'),
        fullPage: true
      });

      const result = {
        success: true,
        kycId: 'mock-kyc-id-' + Date.now(),
        createdAt: new Date().toISOString()
      };

      // Save final screenshot and result
      fs.writeFileSync(
        path.join(reportDir, 'result.json'),
        JSON.stringify(result, null, 2)
      );

      await page.screenshot({ 
        path: path.join(reportDir, '04-final.png'),
        fullPage: true
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Automation script failed:', error);
      
      // Save error screenshot and info
      if (page) {
        await page.screenshot({ 
          path: path.join(reportDir, 'error.png'),
          fullPage: true
        });
      }

      fs.writeFileSync(
        path.join(reportDir, 'error.json'),
        JSON.stringify({ error: error.message }, null, 2)
      );

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

module.exports = createKyc; 