<script lang="ts" setup>
import { toRefs } from "vue"

const $props = withDefaults(
	defineProps<{
		socketId: string
		username: string
		userRank: {
			level: number
			standard: number
			stars: number
		}
	}>(),
	{
		socketId: "",
		username: "",
		userRank: () => ({
			level: 0,
			standard: 0,
			stars: 0,
		}),
	}
)

const { socketId, username, userRank } = toRefs($props)

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
	let standardText = "I"

	switch (Number(standard)) {
		case 0:
			standardText = "I"
			break
		case 1:
			standardText = "II"
			break
		case 2:
			standardText = "III"
			break
		case 3:
			standardText = "IV"
			break
		case 4:
			standardText = "V"
			break
		default:
			standardText = "I"
			break
	}
	return `${levelText}·${standardText}·${star}星`
}
</script>

<template>
	<div class="user-list-item">
		<span class="username">{{ username }}</span>
		<span class="rank">{{
			computedRank(userRank.level, userRank.standard, userRank.stars)
		}}</span>
	</div>
</template>

<style lang="postcss" scoped>
.user-list-item {
	@apply w-fit h-fit inline-flex justify-center items-center
	text-sm;
}
</style>
