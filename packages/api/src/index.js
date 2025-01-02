const express = require('express');
const cors = require('cors');
const path = require('path');
const createNewClient = require('./scripts/createClient');
const createKyc = require('./scripts/createKyc');
const generateHtmlReport = require('./scripts/generateHtmlReport');
const { getAllReports } = require('./utils/reportUtils');
const presetTemplates = require('./data/newClientPresetTemplates.json');
const kycPresetTemplates = require('./data/kycPresetTemplates.json');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.post('/uopen-automation/newclient', async (req, res) => {
  const { environment, clientInfo } = req.body;

  const validEnvironments = ['DEV', 'SIT', 'UAT'];
  if (!environment || !validEnvironments.includes(environment)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid environment. Must be DEV, SIT, or UAT'
    });
  }

  if (!clientInfo) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing client information'
    });
  }

  try {
    const clientData = typeof clientInfo === 'string' ? JSON.parse(clientInfo) : clientInfo;
    
    const result = await createNewClient(environment, clientData);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({
      status: 'success',
      data: {
        environment,
        automationResult: result.data,
        timestamp: new Date().toISOString()
      },
      diagnostic: {
        receivedClientInfo: clientData,
        requestTimestamp: new Date().toISOString(),
        environment: environment
      }
    });
  } catch (error) {
    console.error('Request processing failed:', error);
    res.status(500).json({
      status: 'error',
      message: `Automation failed: ${error.message}`,
      diagnostic: {
        receivedClientInfo: typeof clientInfo === 'string' ? JSON.parse(clientInfo) : clientInfo,
        requestTimestamp: new Date().toISOString(),
        environment: environment,
        error: {
          message: error.message,
          stack: error.stack
        }
      }
    });
  }
});

app.post('/uopen-automation/kyc', async (req, res) => {
  const { environment, clientInfo } = req.body;

  const validEnvironments = ['DEV', 'SIT', 'UAT'];
  if (!environment || !validEnvironments.includes(environment)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid environment. Must be DEV, SIT, or UAT'
    });
  }

  if (!clientInfo) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing client information'
    });
  }

  try {
    const clientData = typeof clientInfo === 'string' ? JSON.parse(clientInfo) : clientInfo;
    
    const result = await createKyc(environment, clientData);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({
      status: 'success',
      data: {
        environment,
        automationResult: result.data,
        timestamp: new Date().toISOString()
      },
      diagnostic: {
        receivedClientInfo: clientData,
        requestTimestamp: new Date().toISOString(),
        environment: environment
      }
    });
  } catch (error) {
    console.error('Request processing failed:', error);
    res.status(500).json({
      status: 'error',
      message: `Automation failed: ${error.message}`,
      diagnostic: {
        receivedClientInfo: typeof clientInfo === 'string' ? JSON.parse(clientInfo) : clientInfo,
        requestTimestamp: new Date().toISOString(),
        environment: environment,
        error: {
          message: error.message,
          stack: error.stack
        }
      }
    });
  }
});

// Serve static reports directory
app.use('/reports', express.static(path.join(__dirname, '../reports')));

// HTML report endpoint
app.get('/api/reports/html', (req, res) => {
  const { testType, environment, timestamp } = req.query;
  let reports = getAllReports();
  
  // Filter by test type
  if (testType) {
    reports = reports.filter(report => report.testType === testType);
  }

  // Filter by environment
  if (environment) {
    reports = reports.filter(report => report.environment === environment);
  }

  // Filter by timestamp
  if (timestamp) {
    reports = reports.filter(report => report.timestamp === timestamp);
  }

  const html = generateHtmlReport(reports, { testType, environment, timestamp });
  res.send(html);
});

// 添加新的路由处理预设模板
app.get('/uopen-automation/presets', (req, res) => {
  try {
    res.json({
      status: 'success',
      data: presetTemplates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 添加KYC预设模板的路由
app.get('/uopen-automation/kyc-presets', (req, res) => {
  try {
    res.json({
      status: 'success',
      data: kycPresetTemplates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 