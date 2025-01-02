<template>
  <div class="reports-page">
    <h2 class="page-title">Execution Reports</h2>
    <div class="iframe-container">
      <iframe 
        src="http://localhost:3000/api/reports/html" 
        frameborder="0"
        width="100%"
        height="100%"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Reports'
}
</script>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.iframe-container {
  flex: 1;
  min-height: 0;
  border: none;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

iframe {
  border: none;
  height: 100%;
  width: 100%;
  display: block;
}

.page-title {
  margin: 0 0 20px 0;
  color: #1a1a1a;
  font-size: 24px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}
</style> 