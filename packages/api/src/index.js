const express = require('express');
const cors = require('cors');
const createNewClient = require('./scripts/createClient');
const createKyc = require('./scripts/createKyc');
const path = require('path');
const { getAllReports, getAllTimestamps } = require('./utils/reportUtils');

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
  const timestamps = getAllTimestamps();
  
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
  
  // Generate HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>uOpen Automation Execution Reports</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #f8f9fa;
          color: #333;
        }
        .page-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 100;
        }
        .filters {
          padding: 15px 20px;
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #e9ecef;
        }
        .filters select {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          min-width: 200px;
          font-size: 14px;
          color: #495057;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filters select:hover {
          border-color: #adb5bd;
        }
        .filters select:focus {
          outline: none;
          border-color: #4dabf7;
          box-shadow: 0 0 0 2px rgba(77,171,247,0.2);
        }
        .reports-container {
          margin-top: 70px;
          padding: 30px 20px;
        }
        .report {
          background: white;
          border: 1px solid #e9ecef;
          margin: 0 0 20px 0;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .report:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .report h3 {
          margin: 0 0 15px 0;
          color: #1a1a1a;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .timestamp { 
          color: #868e96;
          font-size: 14px;
          font-weight: normal;
        }
        .environment {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          background: #e9ecef;
          color: #495057;
        }
        .details {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        .details pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 13px;
          line-height: 1.5;
          color: #212529;
        }
        .screenshots {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
          margin: 15px 0;
        }
        .screenshot-container {
          border: 1px solid #e9ecef;
          border-radius: 6px;
          overflow: hidden;
        }
        .screenshot-title {
          padding: 8px 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          font-size: 13px;
          color: #495057;
        }
        .screenshot { 
          width: 100%;
          height: auto;
          display: block;
          border: none;
          margin: 0;
          border-radius: 0;
        }
        .success { color: #40c057; }
        .error { color: #fa5252; }

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            padding: 12px 15px;
          }
          .filters select {
            width: 100%;
          }
          .reports-container {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <div class="filters">
          <select id="testType">
            <option value="">All Test Types</option>
            <option value="newclient" ${testType === 'newclient' ? 'selected' : ''}>New Client</option>
            <option value="kyc" ${testType === 'kyc' ? 'selected' : ''}>KYC</option>
          </select>
          
          <select id="environment">
            <option value="">All Environments</option>
            <option value="DEV" ${environment === 'DEV' ? 'selected' : ''}>DEV</option>
            <option value="SIT" ${environment === 'SIT' ? 'selected' : ''}>SIT</option>
            <option value="UAT" ${environment === 'UAT' ? 'selected' : ''}>UAT</option>
          </select>
          
          <select id="timestamp">
            <option value="">All Reports</option>
            ${timestamps.map(ts => `
              <option value="${ts}" ${timestamp === ts ? 'selected' : ''}>
                ${ts}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="reports-container">
        ${reports.map(report => `
          <div class="report">
            <h3>
              ${report.testType} 
              <span class="environment">${report.environment}</span>
              <span class="timestamp">${report.timestamp}</span>
            </h3>
            <div class="details">
              <pre>${JSON.stringify(report.data, null, 2)}</pre>
            </div>
            ${report.screenshots.length > 0 ? `
              <div class="screenshots">
                ${report.screenshots.map(screenshot => `
                  <div class="screenshot-container">
                    <div class="screenshot-title">${screenshot.name}</div>
                    <img class="screenshot" 
                         src="/reports/${report.relativePath}/${screenshot.name}" 
                         alt="${screenshot.name}">
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <script>
        function updateFilters() {
          const testType = document.getElementById('testType').value;
          const environment = document.getElementById('environment').value;
          const timestamp = document.getElementById('timestamp').value;
          
          const params = new URLSearchParams();
          if (testType) params.append('testType', testType);
          if (environment) params.append('environment', environment);
          if (timestamp) params.append('timestamp', timestamp);
          
          window.location.href = '/api/reports/html?' + params.toString();
        }

        document.getElementById('testType').addEventListener('change', updateFilters);
        document.getElementById('environment').addEventListener('change', updateFilters);
        document.getElementById('timestamp').addEventListener('change', updateFilters);
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 