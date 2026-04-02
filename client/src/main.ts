import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

// Bootstrap Vue app with Pinia state management
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
// Mount to #app div in index.html
app.mount('#app')
