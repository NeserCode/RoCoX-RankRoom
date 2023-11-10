<script lang="ts" setup>
import { useStorage } from "@vueuse/core"
import { computed, onMounted, ref, toRefs } from "vue"

import type { IOMessage, RoomMessage } from "../shared"
import { useConstants } from "../composables/useConstant"

const $props = withDefaults(
	defineProps<{
		message: IOMessage | RoomMessage
	}>(),
	{}
)
const { message } = toRefs($props)
const { NormalMessageType } = useConstants()
const isNormalMessage = computed(() =>
	NormalMessageType.includes(message.value.type)
)

const messageText = computed(() => {
	if (!isNormalMessage.value) return

	const socketId = useStorage("rocox-socket-id", "")
	const name =
		socketId.value === (message.value as IOMessage).io?.id!
			? "你"
			: (message.value as IOMessage).data?.user?.username

	switch (message.value.type) {
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
const getComputedTimeString = (t: number) => {
	const now = new Date()
	const diff = now.getTime() - t
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
}
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
	<div
		:class="['message-list-item', message.type]"
		ref="el"
		v-if="isNormalMessage"
	>
		<span class="time">{{ getComputedTimeString(message.t) }}</span>
		<span class="text">{{ messageText }}</span>
	</div>
	<div :class="['message-list-item', message.type]" ref="el" v-else>
		<span class="time">{{ getComputedTimeString(message.t) }}</span>
		<span class="text">{{ (message as RoomMessage).data.message }} </span>
	</div>
</template>

<style>
@keyframes appearFromLeftTop {
	0% {
		opacity: 0;
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
	@apply w-fit max-w-sm inline-flex flex-col justify-center px-1 py-0.5 my-0.5
	border-2 rounded border-slate-300 dark:border-slate-500
	bg-white dark:bg-slate-600
	transition-all transform ease-in-out duration-300 select-none;
	transform-origin: 0% 0%;
	animation: appearFromLeftTop 0.3s forwards ease-in-out;
}

.message-list-item::after {
	@apply absolute inline-block -right-[8ch]
	text-sm font-semibold opacity-0 transition-all ease-in-out duration-300;
	content: "Normal";
}
.message-list-item:hover::after {
	@apply opacity-100;
}

.text {
	@apply text-base;
}
.time {
	@apply inline-block font-black text-xs
	opacity-60;
}

/* Types */
.message-list-item.ROOM_SUCCESS::after,
.message-list-item.ROOM_ERROR::after,
.message-list-item.ROOM_WARNING::after {
	@apply -right-[7ch];
	content: "Room";
}
.message-list-item.ROOM_ERROR:hover::after {
	@apply opacity-100;
}

.message-list-item.ROOM_SUCCESS {
	@apply border-green-400 dark:border-green-500
	bg-green-200 dark:bg-green-800;
}
.message-list-item.ROOM_WARNING {
	@apply border-yellow-400 dark:border-yellow-500
	bg-yellow-200 dark:bg-yellow-700;
}
.message-list-item.ROOM_ERROR {
	@apply border-red-400 dark:border-red-500
	bg-red-200 dark:bg-red-800;
}
</style>
