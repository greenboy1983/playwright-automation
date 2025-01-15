import { Browser, chromium } from 'playwright';
import { createNewClient } from '../services/newClient';
import { createKyc } from '../services/kyc';

interface TestCase {
  id: string;
  name: string;
  description: string;
  run: (browser: Browser) => Promise<void>;
}

interface TestResult {
  id: string;
  status: string;
  error?: string;
}

export const testCases: TestCase[] = [
  {
    id: 'TC001',
    name: 'Create Basic Client',
    description: 'Create a client with basic information and one cash account',
    run: async (browser: Browser) => {
      const clientData = {
        loginInformation: {
          username: 'testuser1',
          password: 'Password123'
        },
        autoApprove: true,
        participants: [{
          id: 'P001',
          title: 'Mr',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'Male',
          address: 'CIVIC'
        }],
        accounts: [{
          type: 'CASH',
          primaryAccountHolder: 'P001'
        }],
        rrCode: 'RR001'
      };

      await createNewClient('DEV', clientData);
    }
  },
  {
    id: 'TC002',
    name: 'Create Joint Account',
    description: 'Create a client with two account holders and joint account',
    run: async (browser: Browser) => {
      const clientData = {
        loginInformation: {
          username: 'testuser2',
          password: 'Password123'
        },
        autoApprove: true,
        participants: [
          {
            id: 'P001',
            title: 'Mr',
            firstName: 'John',
            lastName: 'Smith',
            gender: 'Male',
            address: 'CIVIC'
          },
          {
            id: 'P002',
            title: 'Mrs',
            firstName: 'Jane',
            lastName: 'Smith',
            gender: 'Female',
            address: 'CIVIC'
          }
        ],
        accounts: [{
          type: 'MARGIN',
          primaryAccountHolder: 'P001',
          secondaryAccountHolder: 'P002'
        }],
        rrCode: 'RR002'
      };

      await createNewClient('DEV', clientData);
    }
  },
  {
    id: 'TC003',
    name: 'KYC Verification',
    description: 'Complete KYC process for an existing client',
    run: async (browser: Browser) => {
      const kycData = {
        clientId: 'C12345',
        documentType: 'PASSPORT',
        documentNumber: 'AB123456'
      };

      await createKyc('DEV', kycData);
    }
  }
];

export async function runTests(testIds: string[]) {
  const browser = await chromium.launch();
  const results: TestResult[] = [];

  try {
    for (const testId of testIds) {
      const testCase = testCases.find(tc => tc.id === testId);
      if (!testCase) {
        results.push({
          id: testId,
          status: 'error',
          error: 'Test case not found'
        });
        continue;
      }

      try {
        await testCase.run(browser);
        results.push({
          id: testId,
          status: 'success'
        });
      } catch (error: any) {
        results.push({
          id: testId,
          status: 'error',
          error: error?.message || 'Unknown error occurred'
        });
      }
    }
  } finally {
    await browser.close();
  }

  return results;
} 