<template>
  <div class="create-client-page">
    <h2 class="page-title">Create New Client</h2>
    
    <div class="content-layout">
      <!-- Left Column: Form -->
      <div class="form-container" :style="{ flex: requestFlex }">
        <div class="json-section">
          <div class="json-header">
            <div class="header-left">
              <span>Request</span>
            </div>
            <div class="header-right">
              <button class="header-btn wizard-btn" @click="showWizard = true">
                Generator
              </button>
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
            {{ isSubmitting ? 'Creating...' : 'Create Client' }}
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

    <!-- Wizard Modal -->
    <div v-if="showWizard" class="modal-overlay" @click.self="showWizard = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Client JSON Request Generator</h2>
          <button class="close-btn" @click="showWizard = false">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Login and RR Code Section -->
          <div class="section">
            <h3>Basic Information</h3>
            <div class="form-grid">
              <div class="form-col">
                <label class="form-label">Username</label>
                <input 
                  v-model="loginInfo.username" 
                  placeholder="Enter username" 
                  class="form-control"
                >
              </div>
              <div class="form-col">
                <label class="form-label">Password</label>
                <input 
                  v-model="loginInfo.password" 
                  type="password"
                  placeholder="Enter password" 
                  class="form-control"
                >
              </div>
              <div class="form-col">
                <label class="form-label">RR Code</label>
                <input 
                  v-model="rrCode" 
                  placeholder="Enter RR Code" 
                  class="form-control"
                  :class="{ 'error-field': !rrCode }"
                >
              </div>
            </div>
            <div class="form-row mt-3">
              <div class="form-col">
                <label class="form-label checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="autoApprove"
                  > Auto Approve
                </label>
              </div>
            </div>
          </div>

          <!-- Participants Section -->
          <div class="section">
            <h3>Participants</h3>
            <div class="list-header">
              <div class="index-column">#</div>
              <div class="form-column">Title</div>
              <div class="form-column">First Name</div>
              <div class="form-column">Last Name</div>
              <div class="form-column">Gender</div>
              <div class="form-column">Address</div>
              <div class="action-column"></div>
            </div>
            <div v-for="(participant, index) in participants" :key="index" class="participant-form">
              <div class="form-row">
                <div class="index-label">{{ index + 1 }}</div>
                <select 
                  v-model="participant.title" 
                  class="form-control"
                  :class="{ 'error-field': !participant.title }"
                >
                  <option value="">Title</option>
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Ms">Ms.</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr">Dr.</option>
                </select>
                <input v-model="participant.firstName" placeholder="First Name" class="form-control">
                <input v-model="participant.lastName" placeholder="Last Name" class="form-control">
                <select 
                  v-model="participant.gender" 
                  class="form-control"
                  :class="{ 'error-field': !participant.gender }"
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <select v-model="participant.address" class="form-control">
                  <option value="CIVIC">Civic Address</option>
                  <option value="RURAL">Rural Address</option>
                </select>
                <button v-if="participants.length > 1" 
                        @click="removeParticipant(index)" 
                        class="icon-btn remove-btn" 
                        title="Remove Participant">
                  ×
                </button>
              </div>
            </div>
            <button @click="addParticipant" class="add-btn">Add Participant</button>
          </div>

          <!-- Accounts Section -->
          <div class="section">
            <h3>Accounts</h3>
            <div class="list-header">
              <div class="index-column">#</div>
              <div class="form-column">Type</div>
              <div class="form-column">Primary Holder</div>
              <div class="form-column">Secondary Holder</div>
              <div class="form-column">Beneficiary</div>
              <div class="action-column"></div>
            </div>
            <div v-for="(account, index) in accounts" :key="index" class="account-form">
              <div class="form-row">
                <div class="index-label">{{ index + 1 }}</div>
                <select 
                  v-model="account.type" 
                  class="form-control"
                  :class="{ 'error-field': !account.type }"
                >
                  <option value="">Account Type</option>
                  <option value="CASH">Cash</option>
                  <option value="MARGIN">Margin</option>
                </select>
                <select 
                  v-model="account.primaryAccountHolder" 
                  class="form-control"
                  :class="{ 'error-field': !account.primaryAccountHolder }"
                >
                  <option value="">Primary Holder</option>
                  <option v-for="p in participants" :key="p.id" :value="p.id">
                    {{ p.firstName }} {{ p.lastName }}
                  </option>
                </select>
                <select v-model="account.secondaryAccountHolder" class="form-control">
                  <option value="">Secondary Holder (Optional)</option>
                  <option v-for="p in participants" :key="p.id" :value="p.id">
                    {{ p.firstName }} {{ p.lastName }}
                  </option>
                </select>
                <select v-model="account.beneficiary" class="form-control">
                  <option value="">Beneficiary (Optional)</option>
                  <option v-for="p in participants" :key="p.id" :value="p.id">
                    {{ p.firstName }} {{ p.lastName }}
                  </option>
                </select>
                <button v-if="accounts.length > 1" 
                        @click="removeAccount(index)" 
                        class="icon-btn remove-btn" 
                        title="Remove Account">
                  ×
                </button>
              </div>
            </div>
            <button @click="addAccount" class="add-btn">Add Account</button>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="generateJson" class="submit-btn" :disabled="!isWizardValid">
            Generate JSON
          </button>
          <button @click="showWizard = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateClient',
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
            firstName: '',
            lastName: '',
            dateOfBirth: "1990-01-01",
            ssn: "123-45-6789",
            role: "PRIMARY"
          }
        ],
        accounts: [
          {
            accountNumber: "ACC001",
            type: "SAVINGS",
            balance: 10000.00,
            status: "ACTIVE"
          }
        ],
        clientGroups: [
          {
            groupId: "G001",
            name: "VIP Clients",
            type: "PREMIUM"
          }
        ]
      }, null, 2),
      activeTab: 'loginInformation',
      tabs: [
        { id: 'loginInformation', label: 'Login Info', placeholder: 'Enter login information' },
        { id: 'household', label: 'Household', placeholder: 'Enter household information' },
        { id: 'participants', label: 'Participants', placeholder: 'Enter participants list' },
        { id: 'accounts', label: 'Accounts', placeholder: 'Enter accounts list' },
        { id: 'clientGroups', label: 'Client Groups', placeholder: 'Enter client groups list' }
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
      presets: [],
      showWizard: false,
      participants: [
        {
          id: 'P001',
          title: '',
          firstName: '',
          lastName: '',
          gender: '',
          address: 'CIVIC'
        }
      ],
      accounts: [
        {
          type: '',
          primaryAccountHolder: '',
          secondaryAccountHolder: '',
          beneficiary: ''
        }
      ],
      rrCode: '',
      firstNames: [
        'James',
        'John',
        'Robert',
        'Michael',
        'William',
        'David',
        'Richard',
        'Joseph',
        'Thomas',
        'Christopher',
        'Emma',
        'Olivia',
        'Sophia',
        'Isabella',
        'Ava',
        'Charlotte',
        'Mia',
        'Amelia',
        'Elizabeth',
        'Sarah'
      ],
      lastNames: [
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
        'Rodriguez',
        'Martinez'
      ],
      loginInfo: {
        username: '',
        password: ''
      },
      autoApprove: false
    }
  },
  created() {
    // 在组件创建时为第一个参与者生成随机姓名
    const { firstName, lastName } = this.getRandomName();
    this.participants[0].firstName = firstName;
    this.participants[0].lastName = lastName;
    
    // 获取预设数据
    this.fetchPresets();
  },
  computed: {
    isWizardValid() {
      const rrCodeValid = !!this.rrCode;
      const participantsValid = this.participants.every(p => 
        p.title && p.firstName && p.lastName && p.gender
      );
      const accountsValid = this.accounts.every(a => 
        a.type && a.primaryAccountHolder
      );
      return rrCodeValid && participantsValid && accountsValid;
    }
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

        const response = await fetch('/uopen-automation/newclient', {
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
      
      // 添加禁止选择文本的类
      document.body.classList.add('resizing');
    },
    
    handleResize(e) {
      if (!this.isResizing) return;
      
      const delta = e.clientX - this.initialX;
      const container = e.target.closest('.content-layout');
      const containerWidth = container.offsetWidth;
      
      // 计算flex值的变化
      const flexDelta = (delta / containerWidth) * (this.initialRequestFlex + this.initialResponseFlex);
      
      // 更新flex值，并确保不会太小
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
    
    loadPreset() {
      if (!this.selectedPreset) {
        return;
      }
      
      const preset = this.presets.find(p => p.id === this.selectedPreset);
      if (preset) {
        this.jsonData = JSON.stringify(preset.data, null, 2);
        this.jsonError = null;
      }
    },
    async fetchPresets() {
      try {
        const response = await fetch('/uopen-automation/load-templates?type=newclient');
        const result = await response.json();
        if (result.status === 'success') {
          this.presets = result.data.presets;
        }
      } catch (error) {
        console.error('Failed to fetch presets:', error);
      }
    },
    getRandomName() {
      const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      return { firstName, lastName };
    },
    addParticipant() {
      const { firstName, lastName } = this.getRandomName();
      this.participants.push({
        id: `P${String(this.participants.length + 1).padStart(3, '0')}`,
        title: '',
        firstName: firstName,
        lastName: lastName,
        gender: '',
        address: 'CIVIC'
      });
    },
    removeParticipant(index) {
      this.participants.splice(index, 1);
      // Update remaining participant IDs
      this.participants.forEach((p, i) => {
        p.id = `P${String(i + 1).padStart(3, '0')}`;
      });
    },
    addAccount() {
      this.accounts.push({
        type: '',
        primaryAccountHolder: '',
        secondaryAccountHolder: '',
        beneficiary: ''
      });
    },
    removeAccount(index) {
      this.accounts.splice(index, 1);
    },
    async generateJson() {
      const wizardData = {
        loginInformation: this.loginInfo,
        autoApprove: this.autoApprove,
        participants: this.participants,
        accounts: this.accounts,
        rrCode: this.rrCode
      };
      try {
        const response = await fetch('/uopen-automation/newclient-wizard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wizardData)
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (result.status === 'success') {
          const formattedJson = JSON.stringify(result.data, null, 2);
          console.log('Formatted JSON:', formattedJson);
          
          this.jsonData = formattedJson;
          console.log('Updated jsonData:', this.jsonData);
          
          this.showWizard = false;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Failed to generate JSON:', error);
      }
    }
  }
}
</script>

<style scoped>
.create-client-page {
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

/* Update existing styles */
h2 {
  margin: 0;
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

.editor-container {
  position: relative;
  border: 1px solid #dee2e6;
  border-radius: 4px;
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
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}

.editor-actions {
  position: absolute;
  top: 8px;
  right: 8px;
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

.result-section {
  margin-top: 30px;
  padding: 20px;
  border-radius: 4px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
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

/* 添加到全局样式 */
:global(.resizing) {
  cursor: col-resize;
  user-select: none;
}

:global(.resizing) .resizer::after {
  background: #228be6;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.index-label {
  background: #e9ecef;
  color: #495057;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  min-width: 30px;
  text-align: center;
  flex-shrink: 0;
}

.form-control {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
}

select.form-control {
  padding-right: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='4' viewBox='0 0 8 4'%3E%3Cpath fill='%23495057' d='M0 0l4 4 4-4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 8px 4px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.remove-btn {
  background: #fa5252;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  height: 36px;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #e03131;
}

.add-btn {
  background: #228be6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #1c7ed6;
}

/* 调整标题样式 */
.section h3 {
  margin-bottom: 16px;
  color: #495057;
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

/* 调整表单组间距 */
.participant-form, .account-form {
  margin-bottom: 16px;
}

/* 最后一个表单组不需要底部间距 */
.participant-form:last-child, .account-form:last-child {
  margin-bottom: 0;
}

.wizard-btn {
  background: #228be6;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.wizard-btn:hover {
  background: #1c7ed6;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #495057;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #868e96;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.section {
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.add-btn, .remove-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.add-btn {
  background: #228be6;
  color: white;
  border: none;
}

.remove-btn {
  background: #fa5252;
  color: white;
  border: none;
}

h3 {
  margin-bottom: 20px;
  color: #495057;
}

h4 {
  margin: 15px 0;
  color: #495057;
  font-size: 16px;
}

.form-label {
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
  padding-top: 8px;
}

.list-header {
  display: flex;
  gap: 12px;
  padding: 0 0 8px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
  font-size: 13px;
  font-weight: 500;
  align-items: center;
}

.index-column {
  width: 30px;
  flex-shrink: 0;
  text-align: center;
}

.form-column {
  flex: 1;
  padding: 0 8px;
  min-width: 120px;
}

.action-column {
  width: 36px;
  flex-shrink: 0;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.form-row .form-control {
  flex: 1;
  min-width: 120px;
}

.form-row .index-label {
  width: 30px;
  text-align: center;
}

/* 调整特定列的宽度 */
.form-column:nth-child(2), /* Title */
.form-column:nth-child(5), /* Gender */
.form-column:nth-child(6) { /* Address */
  flex: 0.8;
}

.form-column:nth-child(3), /* First Name */
.form-column:nth-child(4) { /* Last Name */
  flex: 1.2;
}

.icon-btn.remove-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fa5252;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.icon-btn.remove-btn:hover {
  background: #e03131;
}

.error-field {
  border-color: #fa5252;
  background-color: #fff5f5;
}

.error-field:focus {
  border-color: #fa5252;
  box-shadow: 0 0 0 2px rgba(250, 82, 82, 0.2);
}

.form-col {
  flex: 1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.form-col {
  min-width: 0; /* 防止内容溢出 */
}

.mt-3 {
  margin-top: 12px;
}

.checkbox-label {
  margin-top: 4px;
}

.form-control {
  width: 100%;
  max-width: 200px; /* 限制输入框最大宽度 */
}

/* 修改选择器的特异性，只针对模态框中的表单控件 */
.modal-body .form-control {
  width: 100%;
  max-width: 200px; /* 限制输入框最大宽度 */
}

/* 恢复 JSON 编辑器的样式 */
.json-content .form-control {
  max-width: none;
  width: 100%;
  height: 100%;
}

/* 其他模态框特定的样式 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.modal-body .form-col {
  min-width: 0;
}

.mt-3 {
  margin-top: 12px;
}

.checkbox-label {
  margin-top: 4px;
}
</style> 