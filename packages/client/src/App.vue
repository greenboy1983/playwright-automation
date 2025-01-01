<template>
  <div class="app">
    <header class="header">
      <h1>uOpen Automation</h1>
    </header>
    <div class="content-wrapper">
      <div class="sidebar">
        <h2>Menu</h2>
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/new-client">Create Client</router-link>
          <router-link to="/kyc">KYC</router-link>
        </nav>
      </div>
      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.content-wrapper {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
  background-color: #f5f5f5;
  padding: 20px;
  border-right: 1px solid #ddd;
}

.sidebar h2 {
  margin-bottom: 20px;
  color: #333;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar a {
  padding: 10px;
  text-decoration: none;
  color: #666;
  border-radius: 4px;
}

.sidebar a:hover {
  background-color: #e0e0e0;
}

.sidebar a.router-link-active {
  background-color: #e0e0e0;
  color: #333;
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 20px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style> 