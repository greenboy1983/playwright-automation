const express = require('express');
const cors = require('cors');
const path = require('path');
const createNewClient = require('./scripts/createClient');
const createKyc = require('./scripts/createKyc');
const generateHtmlReport = require('./scripts/generateHtmlReport');
const { getAllReports } = require('./utils/reportUtils');
const fs = require('fs').promises;

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

// 验证模板文件的格式
function isValidTemplate(template) {
  return (
    template &&
    typeof template === 'object' &&
    'id' in template &&
    'name' in template &&
    'data' in template &&
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.data === 'object'
  );
}

// 加载指定目录下的所有模板
async function loadTemplates(templatesDir) {
  const templates = [];
  const files = await fs.readdir(templatesDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const template = require(path.join(templatesDir, file));
        if (isValidTemplate(template)) {
          templates.push(template);
        } else {
          console.warn(`Skipping invalid template file: ${file}`);
        }
      } catch (error) {
        console.error(`Error loading template file ${file}:`, error);
      }
    }
  }
  
  return { presets: templates };
}

// 修改路由处理
app.get('/uopen-automation/newclient-presets', async (req, res) => {
  try {
    const templates = await loadTemplates(path.join(__dirname, 'data/newclient/templates'));
    res.json({
      status: 'success',
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/uopen-automation/kyc-presets', async (req, res) => {
  try {
    const templates = await loadTemplates(path.join(__dirname, 'data/kyc/templates'));
    res.json({
      status: 'success',
      data: templates
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