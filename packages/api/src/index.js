const express = require('express');
const cors = require('cors');
const createNewClient = require('./scripts/createClient');
const createKyc = require('./scripts/createKyc');

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

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 