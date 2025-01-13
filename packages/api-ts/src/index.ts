import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createNewClient } from './services/newClient';

// 定义请求体接口
interface NewClientRequest {
  environment: 'DEV' | 'SIT' | 'UAT';
  clientInfo: any;
}

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

app.listen(port, () => {
  console.log(`TypeScript API server running at http://localhost:${port}`);
}); 