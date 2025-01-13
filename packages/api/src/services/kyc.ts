import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import { saveReport } from './generateHtmlReport';

export interface KycRequest {
    environment: 'DEV' | 'SIT' | 'UAT';
    clientInfo: any;
}

interface AutomationResult {
    clientId: string;
    status: string;
    timestamp: string;
}

interface KycResult {
    success: boolean;
    data?: AutomationResult;
    error?: string;
}

export async function createKyc(environment: string, clientData: any): Promise<KycResult> {
    let browser: Browser | null = null;
    let page: Page | null = null;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(__dirname, '../../reports/kyc', environment, timestamp);

    try {
        browser = await chromium.launch({
            headless: false,
            slowMo: 500
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        page = await context.newPage();

        console.log(`Starting KYC in ${environment} environment`);
        console.log('Client information:', clientData);

        await page.goto('https://example.com');
        await page.waitForTimeout(1000);

        await page.screenshot({ 
            path: path.join(reportDir, 'final.png'),
            fullPage: true 
        });

        const result = {
            success: true,
            clientId: 'mock-kyc-' + Date.now(),
            createdAt: new Date().toISOString()
        };

        await saveReport(page, reportDir, {
            type: 'kyc',
            environment,
            request: clientData,
            response: result,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            data: {
                clientId: `KYC-${Date.now()}`,
                status: 'COMPLETED',
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('KYC automation failed:', error);
        
        if (page) {
            await page.screenshot({ 
                path: path.join(reportDir, 'error.png'),
                fullPage: true 
            });
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
} 