import { createApp } from "vue"

import "./styles.css"

import router from "./router"
import App from "./App.vue"
import Vue3Toasity, { type ToastContainerOptions } from "vue3-toastify"
import "vue3-toastify/dist/index.css"

createApp(App)
	.use(Vue3Toasity, {
		autoClose: 3000,
		closeButton: false,
		icon: false,
		// ...
	} as ToastContainerOptions)
	.use(router)
	.mount("#app")
