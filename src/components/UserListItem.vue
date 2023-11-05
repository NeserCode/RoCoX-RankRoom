<script lang="ts" setup>
import { toRefs } from "vue"

const $props = withDefaults(
	defineProps<{
		socketId?: string
		username?: string
		userRank?: {
			level?: number
			standard?: number
			stars?: number
		}
	}>(),
	{
		socketId: "",
		username: "",
	}
)

const { socketId, username, userRank } = toRefs($props)

const getUserRankText = () => {}
</script>

<template>
	<div class="user-list-item">
		<span class="username">{{ username }}</span>
		<span class="rank"></span>
	</div>
</template>

<style lang="postcss" scoped></style>
