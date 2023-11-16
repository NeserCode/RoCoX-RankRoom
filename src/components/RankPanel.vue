<script lang="ts" setup>
import {
	Cog8ToothIcon,
	WrenchIcon,
	MegaphoneIcon,
	ClockIcon,
	FireIcon,
} from "@heroicons/vue/24/solid"
import Dialog from "./UI/Dialog.vue"
import Combox from "./UI/Combox.vue"
import RankHelper from "./RankHelper.vue"

import { ref, watch } from "vue"
import { useStorage } from "@vueuse/core"

import { useConstants } from "../composables/useConstant"
import type { IORankState, IORoom } from "../shared"

const { DefaultRoom, RankTypeMapData } = useConstants()
const RankTypeMap = new Map(RankTypeMapData)
const room = useStorage<IORoom>("rocox-room", DefaultRoom)

const isShowRankPanel = ref(false)
const openRankPanel = () => {
	isShowRankPanel.value = true
}
const rankState = (state: IORankState) => {
	return room.value.rank.state === state
}
const countingNumber = ref(0)
const startCounting = () => {
	countingNumber.value = Math.floor(room.value.rank.config.round.count / 1000)
	const timer = setInterval(() => {
		countingNumber.value = parseInt((countingNumber.value - 0.1).toFixed(1))
		if (countingNumber.value <= 0) clearInterval(timer)
	}, 990)
}

watch(
	() => room.value.rank.state,
	(v) => {
		if (v === "RANKING") openRankPanel()
		if (v === "COUNTING") startCounting()
	},
	{ immediate: true }
)
</script>

<template>
	<div class="rank-panel">
		<button type="button" class="btn" @click="openRankPanel">对战面板</button>
		<Dialog v-model:open="isShowRankPanel">
			<template #title>
				<span class="title">对战面板 · {{ room.rank.state }}</span>
			</template>
			<template #info>
				<div class="rank-panel-main">
					<div class="config-panel" v-if="rankState('CONFIG')">
						<span class="config-tip">
							<WrenchIcon class="icon" />
							<span class="text">正在准备配置发车，请等待发车准备。</span>
						</span>
						<span class="tip">
							<Cog8ToothIcon class="icon" />
							<span class="text"
								>Config > ( Ready > Counting > Ranking > ) Finished</span
							>
						</span>
						<span class="tip">
							<Cog8ToothIcon class="icon" />
							<span class="text">
								Config 阶段将会确定：轮数、轮倒计时、发车类型
							</span>
						</span>
					</div>
					<div class="ready-panel" v-else-if="rankState('READY')">
						<span class="ready-tip">
							<MegaphoneIcon class="icon" />
							<span class="text">正在准备发车，请等待发车倒计时。</span>
						</span>
						<span class="tip">
							<Cog8ToothIcon class="icon" />
							<span class="text">
								发车配置：{{ RankTypeMap.get(room.rank.config.type) }}、
								{{ room.rank.config.round.round }}轮制、
								{{ room.rank.config.round.count }} 毫秒倒计时
							</span>
						</span>
					</div>
					<div class="counting-panel" v-else-if="rankState('COUNTING')">
						<span class="counting-tip">
							<span class="counting">
								<ClockIcon class="icon" />
								<span class="number">{{ countingNumber }}</span>
							</span>
							<span class="text">正在倒计时</span>
						</span>
					</div>
					<div class="ranking-panel" v-else-if="rankState('RANKING')">
						<Combox />
						<RankHelper />
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<style lang="postcss" scoped>
.rank-panel-main {
	@apply max-h-96 mb-4;
}

.tip {
	@apply justify-start;
}

.config-tip,
.ready-tip,
.counting-tip {
	@apply flex flex-col items-center justify-center gap-2 my-8
	text-base
	animate-pulse;
}
.config-tip .icon,
.ready-tip .icon,
.counting-tip .icon {
	@apply w-12 h-12 my-4;
}

.counting-tip {
	@apply animate-none;
}
.counting-tip .counting {
	@apply inline-flex items-center justify-center gap-4
	text-4xl font-black;
}

.ranking-panel {
	@apply min-h-[12rem];
}
</style>
