<template>
  <div class="reports-page">
    <h2>Execution Reports</h2>
    <div class="iframe-container">
      <iframe 
        src="http://localhost:3000/api/reports/html" 
        frameborder="0"
        width="100%"
        height="800px"
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
  padding: 20px;
}

.iframe-container {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

iframe {
  border: none;
}
</style> 