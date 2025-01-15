import express from 'express';
import cors from 'cors';
import path from 'path';
import { getAllReports, generateHtmlReport } from './services/generateHtmlReport';
import testRoutes from './routes/testRoutes';
import automationRoutes from './routes/automationRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 基础健康检查接口
app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from TypeScript API!' });
});

// 使用路由
app.use('/uopen-automation', automationRoutes);
app.use('/test', testRoutes);

// Serve static reports directory
app.use('/show-reports', express.static(path.join(__dirname, '../reports')));

// 报告查询接口
app.get('/api/reports/html', (req, res) => {
    try {
        const { testType, environment, timestamp } = req.query as {
            testType?: string;
            environment?: string;
            timestamp?: string;
        };

        let reports = getAllReports();

        if (testType) {
            reports = reports.filter(report => report.testType === testType);
        }
        if (environment) {
            reports = reports.filter(report => report.environment === environment);
        }
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

app.listen(port, () => {
    console.log(`TypeScript API server running at http://localhost:${port}`);
}); 