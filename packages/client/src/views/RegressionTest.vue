<template>
  <div class="regression-page">
    <h2 class="page-title">Regression Test (MOCK - NOT IMPLEMENTED)</h2>
    
    <div class="content-container">
      <div class="actions-bar">
        <button 
          class="execute-btn" 
          :disabled="!selectedTests.length"
          @click="executeTests"
        >
          Execute Selected Tests ({{ selectedTests.length }})
        </button>
      </div>

      <div class="test-list">
        <div class="list-header">
          <label class="checkbox-wrapper">
            <input 
              type="checkbox" 
              :checked="isAllSelected"
              @change="toggleAllTests"
            >
          </label>
          <div class="header-name">Test Case</div>
          <div class="header-description">Description</div>
          <div class="header-actions">Actions</div>
        </div>

        <div v-for="test in testCases" :key="test.id" class="test-item">
          <label class="checkbox-wrapper">
            <input 
              type="checkbox" 
              v-model="selectedTests"
              :value="test.id"
            >
          </label>
          <div class="test-name">{{ test.name }}</div>
          <div class="test-description">{{ test.description }}</div>
          <div class="test-actions">
            <button class="action-btn edit-btn" @click="editTest(test)">Edit</button>
            <button class="action-btn delete-btn" @click="deleteTest(test)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegressionTest',
  data() {
    return {
      testCases: [
        {
          id: 1,
          name: 'Create Basic Client',
          description: 'Create a client with basic information and one cash account'
        },
        {
          id: 2,
          name: 'Create Joint Account',
          description: 'Create a client with two account holders and joint account'
        },
        {
          id: 3,
          name: 'Create Client with Beneficiary',
          description: 'Create a client with beneficiary on the account'
        },
        {
          id: 4,
          name: 'KYC Verification',
          description: 'Complete KYC process for an existing client'
        }
      ],
      selectedTests: []
    }
  },
  computed: {
    isAllSelected() {
      return this.testCases.length === this.selectedTests.length
    }
  },
  methods: {
    toggleAllTests() {
      if (this.isAllSelected) {
        this.selectedTests = []
      } else {
        this.selectedTests = this.testCases.map(test => test.id)
      }
    },
    editTest(test) {
      console.log('Edit test:', test)
      // 实现编辑功能
    },
    deleteTest(test) {
      console.log('Delete test:', test)
      // 实现删除功能
    },
    executeTests() {
      console.log('Executing tests:', this.selectedTests)
      // 实现测试执行功能
    }
  }
}
</script>

<style scoped>
.regression-page {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.actions-bar {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.execute-btn {
  background: #228be6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.execute-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.test-list {
  flex: 1;
  overflow-y: auto;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 500;
  color: #495057;
}

.test-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

.test-item:hover {
  background: #f8f9fa;
}

.checkbox-wrapper {
  width: 40px;
  display: flex;
  align-items: center;
}

.header-name, .test-name {
  flex: 1;
}

.header-description, .test-description {
  flex: 2;
  color: #495057;
}

.header-actions, .test-actions {
  width: 120px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background: #228be6;
  color: white;
}

.delete-btn {
  background: #fa5252;
  color: white;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}
</style> 