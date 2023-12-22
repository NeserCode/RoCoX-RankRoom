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

import { computed, inject, nextTick, ref, watch } from "vue"
import { useStorage } from "@vueuse/core"
import { useConstants } from "../composables/useConstant"
import {
	rawDatatoObject,
	computedRanktoText,
	tickTask,
} from "../composables/utils"

import type {
	IORankConfig,
	IORankState,
	IORenderRankFunction,
	IORenderUserFunction,
	IORoom,
	UserInfo,
	UserRank,
} from "../shared"
import { SocketEmiterFunctionKey } from "../token"
import { useRankActions } from "../composables/useRankAction"

const { useUsers } = inject<{ useUsers: () => IORenderUserFunction }>(
	SocketEmiterFunctionKey,
	{ useUsers: () => ({ updateUsertoServer: () => {} }) }
)
const { useRank } = inject<{ useRank: () => IORenderRankFunction }>(
	SocketEmiterFunctionKey,
	{
		useRank: () => ({
			updateConfig: (_config: IORankConfig) => {},
			nextRound: () => {},
			announceReady: () => {},
			announceFinish: () => {},
			battleEmit: () => {},
			battleReply: () => {},
			readyReply: () => {},
		}),
	}
)
const { battleEmit, battleReply, readyReply } = useRank()
const { updateUsertoServer } = useUsers()

const { DefaultRoom, RankTypeMapData, DefaultUser, DefaultUserRank } =
	useConstants()
const RankTypeMap = new Map(RankTypeMapData)
const room = useStorage<IORoom>("rocox-room", DefaultRoom)
const socketId = useStorage<string>("rocox-socket-id", "")
const username = useStorage<string>("rocox-username", "")
const userRank = useStorage<UserRank>("rocox-user-rank", DefaultUserRank)
const battleUser = useStorage<UserInfo>("rocox-battle-user", DefaultUser)
const selectedUser = useStorage("rocox-rank-selected-user", DefaultUser)

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
		if (v === "READY") {
			openRankPanel()
			battleUser.value = DefaultUser
			selectedUser.value = DefaultUser
		}
		if (v === "RANKING") openRankPanel()
		if (v === "COUNTING") startCounting()
	},
	{ immediate: true }
)

const isMatchedRanker = computed(() => {
	if (battleUser.value.socketId === DefaultUser.socketId) return false
	else if (selectedUser.value.socketId == battleUser.value.socketId) {
		nextTick(() => {
			replyOwnasRanker()
		})
		return true
	}
})
const isExceptPasserby = computed(() => {
	return !(battleUser.value.socketId === DefaultUser.socketId)
})
const emitOwnasRanker = () => {
	if (selectedUser.value.socketId !== DefaultUser.socketId) battleEmit()
}
const replyOwnasRanker = () => {
	selectedUser.value = battleUser.value
	nextTick(() => {
		battleReply()
	})
}

// rank actions
const { plusStars: plusFn, minusStars: minusFn } = useRankActions(
	userRank.value
)
const updateUserData = () => {
	updateUsertoServer({
		username: username.value,
		socketId: socketId.value,
		userRank: JSON.stringify({ ...userRank.value }),
	})
}
const plusStars = (stars: 1 | 2 | 3) => {
	tickTask(plusFn, stars)
	updateUserData()
	isShowRankPanel.value = false
}
const minusStars = (stars: 0 | 1) => {
	if (stars === 1) minusFn()
	updateUserData()
	isShowRankPanel.value = false
}

// ready
const isReady = computed(() =>
	room.value.queues.ready.some((u) => u.socketId === socketId.value)
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
						<button type="button" class="btn" @click="readyReply">
							{{ isReady ? "已" : null }}响应准备
							{{ room.queues.ready.length }}/{{ room.users.length }}
						</button>
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
						<Combox :disabled="isMatchedRanker" />
						<RankHelper v-if="isMatchedRanker" />
						<span class="confirm-btns" v-if="!isMatchedRanker">
							<button type="button" class="btn" @click="emitOwnasRanker">
								确认对手
							</button>
							<button
								type="button"
								class="btn reply-btn"
								@click="replyOwnasRanker"
								v-if="isExceptPasserby"
							>
								<span class="text">应答</span>
								<span class="username">{{ battleUser.username }}</span>
								<span class="user-rank">{{
									computedRanktoText(rawDatatoObject(battleUser.userRank))
								}}</span>
							</button>
						</span>
						<div class="rank-actions" v-else>
							<button type="button" class="btn" @click="plusStars(1)">
								+ 1
							</button>
							<button type="button" class="btn" @click="plusStars(2)">
								+ 2
							</button>
							<button type="button" class="btn" @click="plusStars(3)">
								+ 3
							</button>
							<button type="button" class="btn" @click="minusStars(0)">
								- 0
							</button>
							<button type="button" class="btn" @click="minusStars(1)">
								- 1
							</button>
							<button type="button" class="btn danger">匹配失败</button>
						</div>
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
.ready-tip {
	@apply mb-0;
}

.counting-tip {
	@apply animate-none;
}
.counting-tip .counting {
	@apply inline-flex items-center justify-center gap-4
	text-4xl font-black;
}

.ranking-panel {
	@apply relative flex flex-col items-center min-h-[12rem] gap-2;
}
.confirm-btns {
	@apply flex justify-center items-center gap-2;
}
.confirm-btns .reply-btn {
	@apply inline-flex flex-wrap max-w-[10rem] justify-center items-center
	text-sm;
}
.reply-btn .username {
	@apply inline-block max-w-[14ch] px-1 mx-1
	font-black rounded truncate
	bg-sky-100 dark:bg-sky-700;
}
.reply-btn .user-rank {
	@apply inline-block opacity-60 z-0;
}

.ready-panel {
	@apply flex flex-col items-center justify-center gap-3;
}

.rank-actions {
	@apply flex items-center gap-2;
}
</style>
