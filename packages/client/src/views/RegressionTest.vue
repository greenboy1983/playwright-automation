<template>
  <div class="regression-page">
    <h2 class="page-title">Regression Test (MOCK - NOT IMPLEMENTED)</h2>
    
    <div class="content-container">
      <div class="actions-bar">
        <button 
          class="execute-btn" 
          :disabled="!selectedTests.length || isLoading"
          @click="executeTests"
        >
          {{ isLoading ? 'Executing...' : `Execute Selected Tests (${selectedTests.length})` }}
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

      <!-- 执行结果显示 -->
      <div v-if="executionResults" class="results-section">
        <h3>Execution Results</h3>
        <div v-for="result in executionResults.results" :key="result.id" 
             class="result-item" :class="result.status">
          <div class="result-status">{{ result.status }}</div>
          <div class="result-id">{{ result.id }}</div>
          <div v-if="result.error" class="result-error">{{ result.error }}</div>
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
      testCases: [],
      selectedTests: [],
      isLoading: false,
      executionResults: null
    }
  },
  async created() {
    await this.fetchTestCases();
  },
  computed: {
    isAllSelected() {
      return this.testCases.length === this.selectedTests.length
    }
  },
  methods: {
    async fetchTestCases() {
      try {
        const response = await fetch('/test/list-testcases');
        const data = await response.json();
        this.testCases = data;
      } catch (error) {
        console.error('Error fetching test cases:', error);
      }
    },
    async executeTests() {
      this.isLoading = true;
      this.executionResults = null;

      try {
        const response = await fetch('/test/run-testcases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            testIds: this.selectedTests
          })
        });

        const result = await response.json();
        this.executionResults = result;
      } catch (error) {
        console.error('Error executing tests:', error);
      } finally {
        this.isLoading = false;
      }
    },
    toggleAllTests() {
      if (this.isAllSelected) {
        this.selectedTests = [];
      } else {
        this.selectedTests = this.testCases.map(test => test.id);
      }
    },
    editTest(test) {
      console.log('Edit test:', test);
    },
    deleteTest(test) {
      console.log('Delete test:', test);
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

/* 添加结果显示相关样式 */
.results-section {
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
}

.result-item.success {
  background: #d3f9d8;
  color: #2b8a3e;
}

.result-item.error {
  background: #ffe3e3;
  color: #c92a2a;
}

.result-status {
  font-weight: 500;
  text-transform: uppercase;
}

.result-error {
  color: #e03131;
  font-size: 14px;
}

.execute-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style> 