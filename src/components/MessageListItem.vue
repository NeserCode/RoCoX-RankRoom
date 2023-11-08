<script lang="ts" setup>
import { useStorage } from "@vueuse/core"
import { computed, onMounted, ref, toRefs } from "vue"

import type { IOMessage } from "../shared"

const $props = withDefaults(
	defineProps<{
		message: IOMessage
	}>(),
	{}
)
const { message } = toRefs($props)

const messageText = computed(() => {
	const socketId = useStorage("rocox-socket-id", "")
	const name =
		socketId.value === message.value.io?.id!
			? "你"
			: message.value.data?.user?.username

	switch (message.value.data.type) {
		case "JOIN_SERVER": {
			return `${name} 连接了服务器。`
		}
		case "LEFT_SERVER": {
			return `${name} 离开了服务器。`
		}
		case "USER_UPDATE": {
			return `${name} 更新了个人信息。`
		}
	}
})
const timeText = computed(() => {
	const t = message.value.data!.t

	const now = new Date()
	const diff = now.getTime() - message.value.data!.t
	const oneSecond = 1000
	const oneMinute = 60 * oneSecond
	const oneHour = 60 * oneMinute
	const oneDay = 24 * oneHour

	if (diff < oneSecond) {
		if (diff < 500) return "1 秒前"
		else return `${Math.floor(diff / 1000)} 秒前`
	} else if (diff < oneMinute) {
		return `${Math.floor(diff / oneSecond)} 秒前`
	} else if (diff < oneHour) {
		return `${Math.floor(diff / oneMinute)} 分钟前`
	} else if (diff < oneDay) {
		const hours = Math.floor(diff / oneHour)
		return `${hours} 小时前`
	} else if (diff < oneDay * 2) {
		return "昨天 " + new Date(t).toLocaleString()
	} else {
		const yyyy = new Date(t).getFullYear()
		const mm = String(new Date(t).getMonth() + 1).padStart(2, "0")
		const dd = String(new Date(t).getDate()).padStart(2, "0")
		const hh = String(new Date(t).getHours()).padStart(2, "0")
		const mm2 = String(new Date(t).getMinutes()).padStart(2, "0")
		const ss = String(new Date(t).getSeconds()).padStart(2, "0")
		return `${yyyy}-${mm}-${dd} ${hh}:${mm2}:${ss}`
	}
})

const el = ref<HTMLElement | null>(null)
onMounted(() => {
	setTimeout(() => {
		el.value!.scrollIntoView({
			behavior: "smooth",
		})
	}, 300)
})
</script>

<template>
	<div :class="['message-list-item', message.data?.type]" ref="el">
		<span class="time">{{ timeText }}</span>
		<span class="text">{{ messageText }}</span>
	</div>
</template>

<style>
@keyframes appearFromLeftTop {
	0% {
		opacity: 0.25;
		transform: scale(0.2);
	}

	75% {
		opacity: 1;
		transform: scale(1.2);
	}

	100% {
		opacity: 1;
		transform: scale(1);
	}
}
</style>
<style lang="postcss" scoped>
.message-list-item {
	@apply w-fit max-w-md inline-flex flex-col justify-center px-1 py-0.5 my-0.5
	border-2 rounded border-slate-300 dark:border-slate-500
	bg-white dark:bg-slate-600
	transition-all transform ease-in-out duration-300 select-none;
	transform-origin: 0% 0%;
	animation: appearFromLeftTop 0.3s forwards ease-in-out;
}

.text {
	@apply truncate;
}
.time {
	@apply inline-block font-black text-xs
	opacity-50;
}
</style>
