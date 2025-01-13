<template>
  <div class="kyc-page">
    <h2 class="page-title">KYC</h2>
    
    <div class="content-layout">
      <!-- Left Column: Form -->
      <div class="form-container" :style="{ flex: requestFlex }">
        <div class="json-section">
          <div class="json-header">
            <div class="header-left">
              <span>Request</span>
            </div>
            <div class="header-right">
              <select v-model="environment" class="header-select">
                <option value="DEV">DEV</option>
                <option value="SIT">SIT</option>
                <option value="UAT">UAT</option>
              </select>
              <select v-model="selectedPreset" class="header-select" @change="loadPreset">
                <option value="">Select template...</option>
                <option v-for="preset in presets" :key="preset.id" :value="preset.id">
                  {{ preset.name }}
                </option>
              </select>
              <button class="action-btn format-btn" @click="formatJson" title="Format JSON">
                { }
              </button>
            </div>
          </div>
          <div class="json-content">
            <textarea
              v-model="jsonData"
              class="form-control code-editor"
              placeholder="Enter JSON data"
            ></textarea>
          </div>
        </div>

        <div v-if="jsonError" class="error-message">
          {{ jsonError }}
        </div>

        <div class="form-actions">
          <button 
            class="submit-btn"
            @click="submitForm"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Processing...' : 'Submit KYC' }}
          </button>
        </div>
      </div>

      <!-- Resizer -->
      <div 
        class="resizer" 
        @mousedown="startResize"
        @dblclick="resetSize"
      ></div>

      <!-- Right Column: Results -->
      <div class="result-container" :style="{ flex: responseFlex }">
        <div class="result-header-text">Response</div>
        <div v-if="result" class="result-section" :class="{ error: result.status === 'error' }">
          <div class="result-header">
            <span class="result-status" :class="result.status">
              {{ result.status === 'success' ? '✓' : '✕' }}
            </span>
            <span>{{ result.status === 'success' ? 'Success' : 'Error' }}</span>
          </div>
          <pre class="result-data">{{ JSON.stringify(result.data || result.message, null, 2) }}</pre>
        </div>
        <div v-else class="no-result">
          No response yet
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Kyc',
  data() {
    return {
      environment: 'DEV',
      jsonData: JSON.stringify({
        loginInformation: {
          username: "testuser",
          password: "Password123",
          email: "test@example.com"
        },
        household: {
          name: "Test Household",
          address: {
            street: "123 Test St",
            city: "Test City",
            state: "TS",
            zipCode: "12345"
          },
          phone: "123-456-7890"
        },
        participants: [
          {
            id: "P001",
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
            ssn: "123-45-6789",
            role: "PRIMARY"
          }
        ]
      }, null, 2),
      activeTab: 'loginInformation',
      tabs: [
        { id: 'loginInformation', label: 'Login Info', placeholder: 'Enter login information' },
        { id: 'household', label: 'Household', placeholder: 'Enter household information' },
        { id: 'participants', label: 'Participants', placeholder: 'Enter participants list' }
      ],
      isSubmitting: false,
      result: null,
      jsonError: null,
      requestFlex: 1,
      responseFlex: 1,
      isResizing: false,
      initialX: 0,
      initialRequestFlex: 0,
      initialResponseFlex: 0,
      selectedPreset: '',
      presets: []
    }
  },
  async created() {
    await this.fetchPresets();
  },
  methods: {
    formatJson() {
      try {
        const parsed = JSON.parse(this.jsonData);
        this.jsonData = JSON.stringify(parsed, null, 2);
        this.jsonError = null;
      } catch (error) {
        this.jsonError = 'Invalid JSON format';
      }
    },
    async submitForm() {
      try {
        this.jsonError = null;
        this.result = null;
        this.isSubmitting = true;

        // Validate JSON
        const clientData = JSON.parse(this.jsonData);

        const response = await fetch('/uopen-automation/kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            environment: this.environment,
            clientInfo: clientData
          })
        });

        this.result = await response.json();
      } catch (error) {
        this.result = {
          status: 'error',
          message: error.message
        };
      } finally {
        this.isSubmitting = false;
      }
    },
    startResize(e) {
      this.isResizing = true;
      this.initialX = e.clientX;
      this.initialRequestFlex = this.requestFlex;
      this.initialResponseFlex = this.responseFlex;
      
      document.addEventListener('mousemove', this.handleResize);
      document.addEventListener('mouseup', this.stopResize);
      document.body.classList.add('resizing');
    },
    handleResize(e) {
      if (!this.isResizing) return;
      
      const delta = e.clientX - this.initialX;
      const container = e.target.closest('.content-layout');
      const containerWidth = container.offsetWidth;
      
      const flexDelta = (delta / containerWidth) * (this.initialRequestFlex + this.initialResponseFlex);
      
      this.requestFlex = Math.max(0.2, this.initialRequestFlex + flexDelta);
      this.responseFlex = Math.max(0.2, this.initialResponseFlex - flexDelta);
    },
    stopResize() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.handleResize);
      document.removeEventListener('mouseup', this.stopResize);
      document.body.classList.remove('resizing');
    },
    resetSize() {
      this.requestFlex = 1;
      this.responseFlex = 1;
    },
    async fetchPresets() {
      try {
        const response = await fetch('/uopen-automation/load-templates?type=kyc');
        const result = await response.json();
        if (result.status === 'success') {
          this.presets = result.data.presets;
        }
      } catch (error) {
        console.error('Failed to fetch presets:', error);
      }
    },
    loadPreset() {
      if (!this.selectedPreset) {
        return;
      }
      
      const preset = this.presets.find(p => p.id === this.selectedPreset);
      if (preset) {
        this.jsonData = JSON.stringify(preset.data, null, 2);
        this.jsonError = null;
      }
    }
  }
}
</script>

<style scoped>
.kyc-page {
  padding: 20px;
  height: 100%;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-title {
  margin: 0 0 20px 0;
  color: #1a1a1a;
  font-size: 24px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.content-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.form-container, .result-container {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  min-height: 0;
  transition: flex 0.1s ease;
}

.form-header, .result-header-text {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.form-container > .form-group,
.form-container > .json-sections,
.form-container > .form-actions {
  padding: 20px;
}

.form-container > .json-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0;
  margin-bottom: 0;
  min-height: 0;
}

.result-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  margin: 0;
  background: white;
}

.no-result {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #868e96;
  font-size: 14px;
  padding: 20px;
}

.form-actions {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
}

.form-group {
  padding: 20px 20px 0;
  margin-bottom: 0;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-col {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4dabf7;
  box-shadow: 0 0 0 2px rgba(77,171,247,0.2);
}

.json-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  min-height: 0;
}

.json-header {
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 500;
  color: #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
  background: white;
  cursor: pointer;
  min-width: 100px;
}

.header-select:focus {
  outline: none;
  border-color: #4dabf7;
  box-shadow: 0 0 0 2px rgba(77,171,247,0.2);
}

.json-content {
  flex: 1;
  position: relative;
  padding: 20px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.code-editor {
  flex: 1;
  min-height: 0;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  resize: none;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  width: 100%;
  height: 100%;
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
}

.format-btn {
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn:hover {
  background: #f1f3f5;
  border-color: #adb5bd;
}

.action-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f3f5;
  border-color: #adb5bd;
}

.error-message {
  margin-top: 8px;
  color: #fa5252;
  font-size: 14px;
}

.submit-btn {
  background: #228be6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1c7ed6;
}

.submit-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.result-section.error {
  background: #fff5f5;
  border-color: #ffc9c9;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-weight: 500;
}

.result-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
}

.result-status.success {
  background: #37b24d;
  color: white;
}

.result-status.error {
  background: #fa5252;
  color: white;
}

.result-data {
  margin: 0;
  padding: 15px;
  background: white;
  border-radius: 4px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.resizer {
  width: 6px;
  margin: 0 10px;
  background: transparent;
  position: relative;
  cursor: col-resize;
  transition: background-color 0.2s;
}

.resizer::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 30px;
  background: #dee2e6;
  border-radius: 1px;
  transition: background-color 0.2s;
}

.resizer:hover::after {
  background: #228be6;
}

:global(.resizing) {
  cursor: col-resize;
  user-select: none;
}

:global(.resizing) .resizer::after {
  background: #228be6;
}
</style> 