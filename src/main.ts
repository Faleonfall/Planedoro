import {createApp} from 'vue'
import App from './App.vue'
import './style.css'
import "./styles/timer.css";

const ua = navigator.userAgent;

// Safari only (excludes Chrome/Edge/Opera + iOS Chrome/Firefox)
const isSafari =
    /safari/i.test(ua) &&
    !/chrome|crios|android|edg|edgios|opr|opios|fxios/i.test(ua);

document.documentElement.classList.toggle("is-safari", isSafari);

createApp(App).mount('#app')
