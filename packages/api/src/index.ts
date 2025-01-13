import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { NewClientRequest, createNewClient } from './services/newClient';
import { getAllReports, generateHtmlReport } from './services/generateHtmlReport';
import { loadTemplates } from './services/loadTemplates';
import { KycRequest, createKyc } from './services/kyc';
import { generateClientJson, WizardRequest } from './services/newClientJsonGenerator';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 基础健康检查接口
app.get('/api/hello', (_req: Request, res: Response) => {
    res.json({ message: 'Hello from TypeScript API!' });
});

// 创建新客户接口
app.post('/uopen-automation/newclient', async (req: Request<{}, {}, NewClientRequest>, res: Response) => {
    const { environment, clientInfo } = req.body;

    const validEnvironments = ['DEV', 'SIT', 'UAT'] as const;
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
        const result = await createNewClient(environment, clientInfo);

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({
            status: 'success',
            data: {
                environment,
                automationResult: result.data,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

// KYC 接口
app.post('/uopen-automation/kyc', async (req: Request<{}, {}, KycRequest>, res: Response) => {
    const { environment, clientInfo } = req.body;

    const validEnvironments = ['DEV', 'SIT', 'UAT'] as const;
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
        const result = await createKyc(environment, clientInfo);

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({
            status: 'success',
            data: {
                environment,
                automationResult: result.data,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});


// 获取预设模板接口
app.get('/uopen-automation/load-templates', async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        
        if (!type) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing template type parameter'
            });
        }

        const validTypes = ['newclient', 'kyc'];
        if (!validTypes.includes(type as string)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid template type. Must be newclient or kyc'
            });
        }

        const templatesDir = path.join(__dirname, `templates/${type}`);
        const templates = await loadTemplates(templatesDir);
        
        res.json({
            status: 'success',
            data: templates
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

// Serve static reports directory
app.use('/reports', express.static(path.join(__dirname, '../reports')));

// 报告查询接口
app.get('/api/reports/html', (req: Request, res: Response) => {
    try {
        const { testType, environment, timestamp } = req.query as {
            testType?: string;
            environment?: string;
            timestamp?: string;
        };

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
    } catch (error) {
        const err = error as Error;
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

// 客户端 Wizard 接口
app.post('/uopen-automation/newclient-wizard', async (req: Request<{}, {}, WizardRequest>, res: Response) => {
    try {
        const wizardData = req.body;
        
        if (!wizardData.participants?.length || !wizardData.accounts?.length || !wizardData.rrCode) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required wizard data'
            });
        }

        const clientJson = generateClientJson(wizardData);

        res.json({
            status: 'success',
            data: clientJson
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

app.listen(port, () => {
    console.log(`TypeScript API server running at http://localhost:${port}`);
}); 