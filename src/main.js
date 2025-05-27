import './assets/main.css';
import 'primeicons/primeicons.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import router from './router';
import { createPinia } from 'pinia'
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Chart from 'primevue/chart';


const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Toast)
app.use(PrimeVue);
// app.component('Chart', Chart);

app.mount('#app')
    