<script lang="ts" setup>
import Dialog from "./UI/Dialog.vue"
import { CubeIcon } from "@heroicons/vue/24/solid"

import { inject, reactive, ref } from "vue"
import { SocketEmiterFunctionKey } from "../token"
import type { IORankFunction, IORankConfig } from "../shared"

const { useRank } = inject<{ useRank: () => IORankFunction }>(
	SocketEmiterFunctionKey,
	{
		useRank: () => ({
			updateConfig: (_config: IORankConfig) => {},
			nextRound: () => {},
			announceReady: () => {},
		}),
	}
)

const isShowRankConfig = ref(false)
const openRankConfig = () => {
	isShowRankConfig.value = true
}

const rankConfigData = reactive<IORankConfig>({
	type: "RANK_NORMAL",
	round: {
		round: 10,
		count: 5000,
	},
})

const { updateConfig, nextRound, announceReady } = useRank()
const updateRankConfig = () => {
	updateConfig(rankConfigData)

	isShowRankConfig.value = false
}
</script>

<template>
	<div class="rank-control">
		<form class="control-btns">
			<button type="button" class="btn" @click="openRankConfig">
				<CubeIcon class="icon" />
				<span class="text">配置</span>
			</button>
			<button type="button" class="btn">开始</button>
			<button type="button" class="btn" @click="nextRound">下一轮</button>
			<button type="button" class="btn" @click="announceReady">发动准备</button>
		</form>
		<Dialog v-model:open="isShowRankConfig">
			<template #title> 发车配置 </template>
			<template #info>
				<form class="rank-update" @submit.prevent="updateRankConfig">
					<select v-model="rankConfigData.type" autofocus>
						<option value="RANK_NORMAL" selected>积分赛</option>
						<option value="RANK_SHIFT">补分赛</option>
						<option value="RANK_BADGE">徽章赛</option>
						<option value="RANK_CUSTOM" disabled>自定义</option>
					</select>
					<input
						type="number"
						class="rank-round"
						placeholder="轮数*"
						required
						:min="1"
						:max="20"
						:step="1"
						v-model="rankConfigData.round.round"
					/>
					<input
						type="number"
						class="rank-count"
						placeholder="轮计时*"
						required
						:min="3000"
						:max="10000"
						:step="1000"
						v-model="rankConfigData.round.count"
					/>
					<button type="submit" class="btn">更新配置</button>
				</form>
			</template>
		</Dialog>
	</div>
</template>

<style lang="postcss" scoped>
.rank-control {
	@apply w-full inline-flex items-center px-2;
}

.control-btns {
	@apply inline-flex items-center gap-2;
}
.control-btns button .icon {
	@apply inline-flex items-center justify-center w-4 h-4 mr-0.5;
}

.rank-update {
	@apply inline-flex items-center mt-6 mb-2 gap-2;
}
.rank-update input {
	@apply w-24;
}
</style>
