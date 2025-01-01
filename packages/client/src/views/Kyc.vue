<template>
  <div class="kyc">
    <h1>KYC</h1>
    <div class="form-group">
      <select v-model="environment">
        <option value="DEV">DEV</option>
        <option value="SIT">SIT</option>
        <option value="UAT">UAT</option>
      </select>
      <textarea v-model="clientInfo" placeholder="Enter KYC info (JSON format)"></textarea>
      <button @click="createKyc">Create KYC</button>
    </div>
    <div class="result" v-if="result">
      <h3>Response:</h3>
      <div class="result-section">
        <h4>Status:</h4>
        <pre>{{ result.status }}</pre>
      </div>
      <div class="result-section" v-if="result.data">
        <h4>Data:</h4>
        <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
      </div>
      <div class="result-section" v-if="result.diagnostic">
        <h4>Diagnostic:</h4>
        <pre>{{ JSON.stringify(result.diagnostic, null, 2) }}</pre>
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
      clientInfo: JSON.stringify({
        name: 'Test KYC',
        description: 'This is a test KYC'
      }, null, 2),
      result: null
    }
  },
  methods: {
    async createKyc() {
      try {
        const response = await fetch('http://localhost:3000/uopen-automation/kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            environment: this.environment,
            clientInfo: this.clientInfo
          })
        });
        const data = await response.json();
        
        this.result = data;
        
        if (data.status === 'error') {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Failed to create KYC:', error);
        this.result = {
          status: 'error',
          message: `Creation failed: ${error.message}`,
          diagnostic: error.diagnostic
        };
      }
    }
  }
}
</script>

<style scoped>
.kyc {
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
  margin: 20px 0;
}

select, textarea {
  padding: 8px;
  margin: 5px 0;
}

textarea {
  height: 150px;
  font-family: monospace;
}

button {
  padding: 10px 20px;
  cursor: pointer;
  width: fit-content;
}

.result {
  margin-top: 20px;
  text-align: left;
}

.result-section {
  margin: 15px 0;
}

.result-section h4 {
  margin-bottom: 10px;
  color: #666;
}

pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}
</style> 