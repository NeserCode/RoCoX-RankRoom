<script lang="ts" setup>
import { Switch } from "@headlessui/vue"

import { defineModel, toRefs } from "vue"

import type { UIToggleProps } from "../../shared"

const $props = withDefaults(defineProps<UIToggleProps>(), {
	enabled: false,
	disabled: false,
})
const { disabled } = toRefs($props)
// const enabled = ref(false)
const enabled = defineModel<boolean>("enabled")
</script>

<template>
	<div class="toggle-btn">
		<Switch
			v-model="enabled"
			:class="enabled ? 'bg-green-500' : 'bg-teal-600'"
			class="toggle-track"
			:disabled="disabled"
		>
			<span class="sr-only"><slot>Toggle</slot></span>
			<span
				aria-hidden="true"
				:class="enabled ? 'translate-x-6' : 'translate-x-0'"
				class="toggle-thumb"
			/>
		</Switch>
	</div>
</template>

<style lang="postcss">
.toggle-track {
	@apply relative inline-flex h-6 w-12
  shrink-0 cursor-pointer
  rounded-full border-2 border-transparent
  transition-colors duration-200 ease-in-out
  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75;
}
.toggle-thumb {
	@apply pointer-events-none inline-block h-5 w-5
  transform rounded-full bg-white
  shadow-lg ring-0 transition duration-200 ease-in-out;
}

.toggle-btn:has(.toggle-track:disabled) {
	@apply opacity-25;
}
.toggle-track:disabled {
	@apply cursor-not-allowed;
}
</style>
