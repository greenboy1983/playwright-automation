import express from 'express';
import { testCases, runTests } from '../tests/testCases';

const router = express.Router();

// 获取所有测试用例
router.get('/list-testcases', (req, res) => {
  const tests = testCases.map(({ id, name, description }) => ({
    id,
    name,
    description
  }));
  res.json(tests);
});

// 执行选定的测试用例
router.post('/run-testcases', async (req, res) => {
  const { testIds } = req.body;

  if (!Array.isArray(testIds) || testIds.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or empty test IDs'
    });
  }

  try {
    const results = await runTests(testIds);
    res.json({
      status: 'success',
      results
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Unknown error occurred'
    });
  }
});

export default router; 