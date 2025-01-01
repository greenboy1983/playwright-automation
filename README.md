# uOpen Automation

A web automation testing framework for uOpen platform, providing automated testing for client creation and KYC processes.

## Features

- Client creation and KYC process automation
- Multiple environment support (DEV/SIT/UAT)
- Automated test report generation
- Web interface for test execution

## Installation

```bash
# Install API dependencies
cd packages/api
npm install
npx playwright install chromium

# Install client dependencies
cd ../client
npm install
```

## Usage

```bash
# Start API server (port 3000)
cd packages/api
npm run dev

# Start web interface (port 5173)
cd ../client
npm run dev
```

## Test Reports

Reports are automatically generated for each test execution:
```
reports/
├── newclient/           # Client creation reports
│   └── [environment]/
│       └── [timestamp]/
│           ├── data.json
│           └── screenshot.png
└── kyc/                # KYC reports
    └── [environment]/
        └── [timestamp]/
            ├── data.json
            └── screenshot.png
```

## Requirements

- Node.js >= 14
- Chrome browser
- Ports: 3000 (API), 5173 (Web UI)

## Tech Stack

- Backend: Node.js, Express, Playwright
- Frontend: Vue.js 3
```