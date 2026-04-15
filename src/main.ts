import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
}

mount(App, { target: document.getElementById('app')! })
