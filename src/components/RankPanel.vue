<script lang="ts" setup>
import Dialog from "./UI/Dialog.vue"
import Combox from "./UI/Combox.vue"

import { ref, watch } from "vue"
import { useStorage } from "@vueuse/core"

import { useConstants } from "../composables/useConstant"
import type { IORoom } from "../shared"

const { DefaultRoom } = useConstants()
const room = useStorage<IORoom>("rocox-room", DefaultRoom)

const isShowRankPanel = ref(false)
const openRankPanel = () => {
	isShowRankPanel.value = true
}

watch(
	() => room.value.rank,
	(v) => {
		if (v.state === "RANKING") openRankPanel()
	},
	{
		immediate: true,
		deep: true,
	}
)
</script>

<template>
	<div class="rank-panel">
		<button type="button" class="btn" @click="openRankPanel">对战面板</button>
		<Dialog v-model:open="isShowRankPanel">
			<template #title>
				<span class="title">对战面板</span>
			</template>
			<template #info>
				<div class="rank-panel-main">
					<Combox />
				</div>
			</template>
		</Dialog>
	</div>
</template>

<style lang="postcss" scoped>
.rank-panel-main {
	@apply h-96;
}
</style>
