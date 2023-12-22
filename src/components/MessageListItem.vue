<script lang="ts" setup>
import { useStorage } from "@vueuse/core"
import { computed, onMounted, ref, toRefs } from "vue"

import type {
	IOUserMessage,
	IORoomMessage,
	IOMessage,
	IOUserMessageType,
	IORoomMessageType,
	IORankState,
	IORankMessage,
} from "../shared"
import { useConstants } from "../composables/useConstant"

const $props = withDefaults(
	defineProps<{
		message: IOMessage
	}>(),
	{}
)
const { message } = toRefs($props)
const {
	NormalUserMessageType,
	NormalRoomMessageType,
	NormalRankFlowType,
	RankTypeMapData,
} = useConstants()
const isNormalMessage = computed(() =>
	NormalUserMessageType.includes(message.value.type as IOUserMessageType)
)
const isRoomMessage = computed(() =>
	NormalRoomMessageType.includes(message.value.type as IORoomMessageType)
)
const isRankMessage = computed(() =>
	NormalRankFlowType.includes(message.value.type as IORankState)
)

const userMessageText = computed(() => {
	if (!isNormalMessage.value) return

	const socketId = useStorage("rocox-socket-id", "")
	const name =
		socketId.value === (message.value as IOUserMessage).io?.id!
			? "你"
			: (message.value as IOUserMessage).data?.user?.username

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
const getRankMessageText = () => {
	if (!isRankMessage.value) return
	const rankTypeMap = new Map(RankTypeMapData)
	const rankType = rankTypeMap.get((message.value as IORankMessage).config.type)
	const { round } = (message.value as IORankMessage).runtime.round
	const { round: totalRound, count } = (message.value as IORankMessage).config
		.round
	switch (message.value.type as IORankState) {
		case "CONFIG": {
			return `本房间内发车配置已更新为：${rankType}&${totalRound}轮制&${count}毫秒计时。`
		}
		case "READY": {
			return `第${round}轮发车已进入准备环节。`
		}
		case "COUNTING": {
			return `即将开始第${round}轮发车倒计时：${count}毫秒，请等待对战面板弹出以继续发车进程。`
		}
		case "RANKING": {
			return `第${round}轮发车倒计时结束，请匹配您的对手。`
		}
		case "FINISHED": {
			return `本场发车活动已被管理确认为完成状态，感谢您的配合。`
		}
	}
}
const getComputedTimeString = (t: number) => {
	const now = new Date()
	const diff = now.getTime() - t
	const oneSecond = 1000
	const oneMinute = 60 * oneSecond
	const oneHour = 60 * oneMinute
	const oneDay = 24 * oneHour

	if (diff < oneSecond) {
		if (diff < 999) return "1 秒前"
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
		<span class="text">{{ userMessageText }}</span>
	</div>
	<div
		:class="['message-list-item', message.type]"
		ref="el"
		v-else-if="isRoomMessage"
	>
		<span class="time">{{ getComputedTimeString(message.t) }}</span>
		<span class="text">{{ (message as IORoomMessage).data.message }} </span>
	</div>
	<div
		:class="['message-list-item', message.type]"
		ref="el"
		v-else-if="isRankMessage"
	>
		<span class="time">{{ getComputedTimeString(message.t) }}</span>
		<span class="text">{{ getRankMessageText() }} </span>
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
.message-list-item.CONFIG::after,
.message-list-item.READY::after,
.message-list-item.COUNTING::after,
.message-list-item.RANKING::after,
.message-list-item.FINISHED::after {
	@apply -right-[7ch];
	content: "Rank";
}
.message-list-item.CONFIG,
.message-list-item.READY,
.message-list-item.COUNTING,
.message-list-item.RANKING,
.message-list-item.FINISHED {
	@apply border-dashed;
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

.message-list-item.CONFIG {
	@apply border-stone-400 dark:border-stone-500
	bg-stone-200 dark:bg-stone-800;
}
.message-list-item.READY {
	@apply border-emerald-400 dark:border-emerald-500
	bg-emerald-200 dark:bg-emerald-800;
}
.message-list-item.COUNTING {
	@apply border-sky-400 dark:border-sky-500
	bg-sky-200 dark:bg-sky-800;
}
.message-list-item.RANKING {
	@apply border-lime-400 dark:border-lime-500
	bg-lime-200 dark:bg-lime-800;
}
</style>
