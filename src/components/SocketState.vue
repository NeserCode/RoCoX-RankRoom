<script lang="ts" setup>
import { SignalIcon, SignalSlashIcon } from "@heroicons/vue/24/solid"

import { computed, toRefs } from "vue"

const $props = withDefaults(
	defineProps<{
		id?: string
		connected?: boolean
	}>(),
	{
		id: "",
		connected: false,
	}
)

const { connected, id } = toRefs($props)
const computedConnectedClass = computed(() =>
	connected.value ? "connected" : "disconnected"
)
</script>

<template>
	<div id="socket-state" :class="computedConnectedClass">
		<span class="with-icon">
			<SignalIcon v-if="connected" class="icon" />
			<SignalSlashIcon v-else class="icon" />
			<span class="state-text">{{ connected ? "已连接" : "未连接" }}</span>
		</span>
		<span class="id">{{ id }}</span>
	</div>
</template>

<style lang="postcss" scoped>
#socket-state {
	@apply flex flex-col justify-center
  font-black text-sm
  select-none;
}

.with-icon {
	@apply inline-flex items-center gap-2
  text-red-400 dark:text-red-500
  transition-all;
}
.icon {
	@apply inline-flex justify-center items-center w-5 h-5;
}

.connected .with-icon {
	@apply text-green-400 dark:text-green-500;
}

.id {
	@apply max-w-[18ch]
  text-xs truncate opacity-75;
}
</style>
