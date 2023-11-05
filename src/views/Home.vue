<script lang="ts" setup>
import RoomControl from "../components/RoomControl.vue"

import { watch } from "vue"
import { useStorage } from "@vueuse/core"

const userList = useStorage("rocox-user-list", [])

watch(
	userList,
	() => {
		console.log("userList", userList.value)
	},
	{
		immediate: true,
		deep: true,
	}
)
</script>

<template>
	<div id="home">
		<div class="main-container">
			<div class="user-list">users</div>
			<div class="message-container">message</div>
		</div>
		<RoomControl />
	</div>
</template>

<style lang="postcss" scoped>
#home {
	@apply w-full h-full flex items-center justify-center;
}

.main-container {
	@apply w-full h-96 flex items-center justify-center
	border-2 rounded-lg
	border-slate-200 dark:border-slate-500
	overflow-hidden transition-all duration-300;
}
.user-list {
	@apply w-1/3 h-full flex flex-wrap px-3 py-2
	bg-slate-100 dark:bg-slate-600
	transition-all duration-300;
}
.message-container {
	@apply w-2/3 h-full flex flex-col px-3 py-1.5
	text-base font-semibold
	truncate transition-all duration-300;
}
</style>
