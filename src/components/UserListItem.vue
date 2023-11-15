<script lang="ts" setup>
import { toRefs } from "vue"

import type { UserListItemProps, UserRank } from "../shared"

const $props = withDefaults(defineProps<UserListItemProps>(), {
	socketId: "",
	username: "",
	userRank: () => ({
		level: 0,
		standard: 0,
		stars: 0,
	}),
	rankVisable: false,
})

const { username, userRank, rankVisable } = toRefs($props)

const computedRank = (level: number, standard: number, star: number) => {
	const levelText =
		Number(level) == 0
			? "学徒魔法师"
			: level == 1
			? "初级魔法师"
			: level == 2
			? "中级魔法师"
			: level == 3
			? "高级魔法师"
			: level == 4
			? "魔导士"
			: "圣魔导师"
	let standardText = "~"

	switch (Number(standard)) {
		case 1:
			standardText = "I"
			break
		case 2:
			standardText = "II"
			break
		case 3:
			standardText = "III"
			break
		case 4:
			standardText = "IV"
			break
		case 5:
			standardText = "V"
			break
		default:
			standardText = "~"
			break
	}
	return `${levelText} · ${standardText} · ${star}星`
}
</script>

<template>
	<div class="user-list-item">
		<span class="username">{{ username === "" ? "无名客" : username }}</span>
		<span class="rank" v-if="rankVisable">{{
			computedRank(
				(userRank as UserRank).level as number,
				(userRank as UserRank).standard,
				(userRank as UserRank).stars
			)
		}}</span>
	</div>
</template>

<style lang="postcss" scoped>
.user-list-item {
	@apply w-fit h-fit inline-flex justify-center items-center px-1 py-0.5 gap-0.5
	rounded-md bg-white dark:bg-slate-600
	border-2 box-content border-slate-300 dark:border-slate-500
	text-sm font-semibold transition-all ease-in-out duration-300 overflow-hidden
	select-none;
}

.username {
	@apply min-w-[3ch] max-w-[10ch] inline-block pr-1 mr-1
	text-center truncate whitespace-pre
	border-r-2 border-slate-300 dark:border-slate-500;
}
.username:last-child {
	@apply max-w-[20ch] border-none mr-0 pr-0;
}
</style>
