<template>
  <div class="reports-page">
    <h2>Execution Reports</h2>
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
  padding: 0;
}

h2 {
  margin: 0;
  padding: 8px 20px;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 24px;
  border-bottom: 1px solid #e9ecef;
  background: #fff;
}

.iframe-container {
  flex: 1;
  min-height: 0;
  border: none;
  overflow: hidden;
}

iframe {
  border: none;
  height: 100%;
  width: 100%;
  display: block;
}
</style> 