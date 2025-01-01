<template>
  <div class="hello">
    <h1>{{ message }}</h1>
    <button @click="fetchMessage">Get Message</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      message: 'Welcome to Vue App'
    }
  },
  methods: {
    async fetchMessage() {
      try {
        const response = await fetch('http://localhost:3000/api/hello');
        const data = await response.json();
        this.message = data.message;
      } catch (error) {
        console.error('Failed to fetch message:', error);
        this.message = 'Failed to fetch message';
      }
    }
  }
}
</script>

<style scoped>
.hello {
  padding: 20px;
  text-align: center;
}

button {
  margin: 20px;
  padding: 10px 20px;
  cursor: pointer;
}
</style> 