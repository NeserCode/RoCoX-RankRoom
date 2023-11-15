<script lang="ts" setup>
import {
	WrenchIcon,
	MegaphoneIcon,
	ClockIcon,
	FireIcon,
} from "@heroicons/vue/24/solid"

import { computed } from "vue"
import { useStorage } from "@vueuse/core"
import { useConstants } from "../composables/useConstant"

import type { IORankState, IORoom } from "../shared"

const { DefaultRoom } = useConstants()
const room = useStorage<IORoom>("rocox-room", DefaultRoom)

const stateText = computed(() => {
	switch (room.value.rank.state) {
		case "CONFIG":
			return "房间配置中"
		case "READY":
			return `第${room.value.rank.runtime.round.round}轮发车准备中`
		case "COUNTING":
			return `第${room.value.rank.runtime.round.round}轮发车倒计时`
		case "RANKING":
			return `第${room.value.rank.runtime.round.round}轮对战`
		case "FINISHED":
			return "发车结束"
		default:
			return "未知状态"
	}
})
const enableIconfromState = (state: IORankState) => {
	return room.value.rank.state === state
}
</script>

<template>
	<div id="room-state" v-if="room.id !== ''">
		<div class="room-info">
			<span class="name">{{ room.name }}</span>
			<span class="id">{{ room.id }}</span>
		</div>
		<div class="room-state">
			<WrenchIcon class="icon" v-if="enableIconfromState('CONFIG')" />
			<MegaphoneIcon class="icon" v-if="enableIconfromState('READY')" />
			<ClockIcon class="icon" v-if="enableIconfromState('COUNTING')" />
			<FireIcon class="icon" v-if="enableIconfromState('RANKING')" />
			<span class="text">{{ stateText }}</span>
		</div>
	</div>
</template>

<style lang="postcss" scoped>
#room-state {
	@apply flex flex-col justify-center px-2 py-1
	border-2 rounded border-slate-200 dark:border-slate-500
	bg-slate-100 dark:bg-slate-600
  font-black text-sm
  transition-all ease-in-out duration-300 select-none;
}

.room-info {
	@apply inline-flex items-baseline gap-0.5;
}
.room-info .name {
	@apply inline-block max-w-[12ch]
  text-sm truncate;
}
.room-info .id {
	@apply inline-block max-w-[12ch]
  text-xs truncate opacity-60;
}

.room-state {
	@apply inline-flex items-center
  font-semibold text-sm;
}
.room-state .icon {
	@apply w-4 h-4 mr-1;
}
</style>
