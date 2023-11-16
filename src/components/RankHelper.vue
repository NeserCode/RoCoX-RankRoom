<script lang="ts" setup>
import { useStorage } from "@vueuse/core"

import type { UserInfo } from "../shared"

const passerby: UserInfo = {
	socketId: "id-for-passerby",
	username: "路人",
	userRank: {
		level: 5,
		standard: 0,
		stars: 999,
	},
}
const selectedUser = useStorage("rocox-rank-selected-user", passerby)
</script>

<template>
	<div class="rank-helper">选定 {{ selectedUser.username }}</div>
</template>

<style lang="postcss" scoped></style>
