<script lang="ts" setup>
import { useStorage } from "@vueuse/core"
import { computed, inject, reactive, ref } from "vue"

import { useConstants } from "../composables/useConstant"
import { SocketEmiterFunctionKey } from "../token"
import type { UserRank, IORenderUserFunction } from "../shared"

const { DefaultUserRank } = useConstants()

const socketId = useStorage<string>("rocox-socket-id", "")
const username = useStorage<string>("rocox-username", "")
const userRank = useStorage<UserRank>("rocox-user-rank", DefaultUserRank)

const userRankSetting = reactive<UserRank>({
	level: userRank.value.level,
	standard: userRank.value.standard,
	stars: userRank.value.stars,
})
const usernameSetting = ref(username.value)

const isSame = computed(() => {
	if (usernameSetting.value === username.value)
		if (userRankSetting.level === userRank.value.level)
			if (userRankSetting.standard === userRank.value.standard)
				if (userRankSetting.stars === userRank.value.stars) return true
	return false
})

const getStandardRound = (level: string | number) => {
	switch (parseInt(level as string)) {
		case 0:
			return [1, 3]
		case 1:
			return [1, 3]
		case 2:
			return [1, 4]
		case 3:
			return [1, 4]
		case 4:
			return [1, 5]
		case 5:
			return [0, 0]
		default:
			return [0, 0]
	}
}
const getStarRound = (level: string | number) => {
	switch (parseInt(level as string)) {
		case 0:
			return [0, 3]
		case 1:
			return [0, 3]
		case 2:
			return [0, 3]
		case 3:
			return [0, 4]
		case 4:
			return [0, 4]
		case 5:
			return [0, 999]
		default:
			return [0, 0]
	}
}

const { useUsers } = inject<{ useUsers: () => IORenderUserFunction }>(
	SocketEmiterFunctionKey,
	{ useUsers: () => ({ updateUsertoServer: () => {} }) }
)
const updateUserRank = () => {
	const updaterFn = useUsers().updateUsertoServer

	username.value = usernameSetting.value
	userRank.value = { ...userRankSetting }
	updaterFn({
		socketId: socketId.value,
		username: usernameSetting.value,
		userRank: JSON.stringify({
			...userRankSetting,
		}),
	})
}
</script>

<template>
	<div class="user-setting">
		<form class="user-info" @submit.prevent="updateUserRank">
			<span class="title">昵称与段位</span>
			<input
				type="text"
				class="nickname"
				placeholder="洛克王国昵称*"
				v-model="usernameSetting"
				required
			/>
			<select
				name="level"
				class="level"
				required
				v-model="userRankSetting.level"
			>
				<option :value="0">学徒魔法师</option>
				<option :value="1">初级魔法师</option>
				<option :value="2">中级魔法师</option>
				<option :value="3">高级魔法师</option>
				<option :value="4">魔导士</option>
				<option :value="5">圣魔导师</option>
			</select>
			<input
				type="number"
				class="standard"
				placeholder="级数*"
				required
				v-model="userRankSetting.standard"
				:min="getStandardRound(userRankSetting.level!)[0]"
				:max="getStandardRound(userRankSetting.level!)[1]"
			/>
			<input
				type="number"
				class="stars"
				placeholder="星星*"
				required
				v-model="userRankSetting.stars"
				:min="getStarRound(userRankSetting.level!)[0]"
				:max="getStarRound(userRankSetting.level!)[1]"
			/>

			<input
				class="user-submit"
				type="submit"
				value="保存修改"
				:disabled="isSame"
			/>
		</form>
	</div>
</template>

<style lang="postcss" scoped>
.user-setting {
	@apply w-full flex flex-col justify-center items-center;
}

.user-info {
	@apply w-3/5 flex flex-wrap justify-center items-center gap-2 px-4 py-3
	border-2 rounded border-slate-200 dark:border-slate-500
	bg-slate-100 dark:bg-slate-600
	transition-all ease-in-out duration-300;
}

.nickname {
	@apply w-48 mx-96;
}
.standard,
.stars {
	@apply w-20 text-center;
}

.user-submit {
	@apply w-fit mx-96
  cursor-pointer;
}

.title {
	@apply inline-block w-full font-bold text-sm select-none opacity-75;
}
</style>
