import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import { NewClientRequest, createNewClient } from '../services/newClient';
import { KycRequest, createKyc } from '../services/kyc';
import { loadTemplates } from '../services/loadTemplates';
import { generateClientJson, WizardRequest } from '../services/newClientJsonGenerator';

const router = express.Router();

// 创建新客户接口
router.post('/newclient', async (req: Request<{}, {}, NewClientRequest>, res: Response) => {
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
router.post('/kyc', async (req: Request<{}, {}, KycRequest>, res: Response) => {
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
router.get('/load-templates', async (req: Request, res: Response) => {
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

        const templatesDir = path.join(__dirname, `../templates/${type}`);
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

// 客户端 Wizard 接口
router.post('/newclient-wizard', async (req: Request<{}, {}, WizardRequest>, res: Response) => {
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

export default router; 