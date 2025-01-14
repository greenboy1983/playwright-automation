<template>
  <div class="app">
    <div class="sidebar">
      <div class="logo">uOpen Automation</div>
      <nav class="nav-menu">
        <router-link to="/createclient" class="nav-item" active-class="active">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span>Create Client</span>
        </router-link>
        <router-link to="/kyc" class="nav-item" active-class="active">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span>KYC</span>
        </router-link>
        <router-link to="/reports" class="nav-item" active-class="active">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H8"/>
            </svg>
          </span>
          <span>Reports</span>
        </router-link>
        <router-link to="/regression" class="nav-item" active-class="active">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M20 6L9 17l-5-5"/>
              <path d="M19 13v7h-7"/>
            </svg>
          </span>
          <span>Regression Test</span>
        </router-link>
      </nav>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1a1a1a;
  color: white;
  padding: 20px 0;
  flex-shrink: 0;
}

.logo {
  padding: 0 24px;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #4dabf7;
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #868e96;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  opacity: 1;
}

.nav-item.active .nav-icon {
  color: #4dabf7;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: #4dabf7;
  border-left-color: #4dabf7;
}

.main-content {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
}
</style> 