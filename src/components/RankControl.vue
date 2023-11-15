<script lang="ts" setup>
import Dialog from "./UI/Dialog.vue"
import { CubeIcon } from "@heroicons/vue/24/solid"

import { computed, inject, reactive, ref, watch } from "vue"
import { SocketEmiterFunctionKey } from "../token"
import type {
	IORenderRankFunction,
	IORankConfig,
	IORankState,
	IORoom,
} from "../shared"
import { useConstants } from "../composables/useConstant"
import { useStorage } from "@vueuse/core"

const { useRank } = inject<{ useRank: () => IORenderRankFunction }>(
	SocketEmiterFunctionKey,
	{
		useRank: () => ({
			updateConfig: (_config: IORankConfig) => {},
			nextRound: () => {},
			announceReady: () => {},
		}),
	}
)

const { DefaultRoom } = useConstants()
const room = useStorage<IORoom>("rocox-room", DefaultRoom)
const socketId = useStorage<string>("rocox-socket-id", "")

const isHostRoom = computed(() => socketId.value === room.value.host)

const enableFromState = (state: IORankState) => {
	const has = (items: IORankState[]) => {
		return !items.includes(room.value.rank.state)
	}

	switch (state) {
		case "CONFIG": {
			return has(["CONFIG", "FINISHED"])
		}
		case "READY": {
			return has(["CONFIG", "RANKING"])
		}
		case "COUNTING": {
			return has(["READY"])
		}
		default:
			break
	}
}

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

watch(
	() => room.value.rank,
	() => {
		rankConfigData.type = room.value.rank.config.type
		rankConfigData.round.round = room.value.rank.config.round.round
		rankConfigData.round.count = room.value.rank.config.round.count
	},
	{
		immediate: true,
		deep: true,
	}
)
</script>

<template>
	<div class="rank-control">
		<form class="control-btns" v-if="isHostRoom">
			<button type="button" class="btn" @click="openRankConfig">
				<CubeIcon class="icon" />
				<span class="text" :disabled="enableFromState('CONFIG')">配置</span>
			</button>
			<button
				type="button"
				class="btn"
				@click="announceReady"
				:disabled="enableFromState('READY')"
			>
				发动准备
			</button>
			<button
				type="button"
				class="btn"
				@click="nextRound"
				:disabled="enableFromState('COUNTING')"
			>
				开始发车轮计时
			</button>
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
