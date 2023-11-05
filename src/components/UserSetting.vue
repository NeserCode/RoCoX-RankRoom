<script lang="ts" setup>
import { useStorage } from "@vueuse/core"

const username = useStorage<string>("rocox-username", "")
const userRank = useStorage<{
	level?: number
	standard?: number
	stars?: number
}>("rocox-user-rank", {})
</script>

<template>
	<div class="user-setting">
		<form class="user-info">
			<input
				type="text"
				class="nickname"
				placeholder="洛克王国昵称*"
				v-model="username"
				required
			/>
			<select
				name="level"
				class="level"
				placeholder="段位*"
				required
				v-model="userRank.level"
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
				v-model="userRank.standard"
			/>
			<input
				type="number"
				class="stars"
				placeholder="星星*"
				required
				v-model="userRank.stars"
			/>
		</form>
	</div>
</template>

<style lang="postcss" scoped>
.user-setting {
	@apply w-full flex flex-col justify-center items-center;
}

.user-info {
	@apply w-2/5 flex flex-wrap justify-center items-center gap-3;
}

.nickname {
	@apply w-48 mx-96;
}
.level {
	@apply mx-96;
}
.standard,
.stars {
	@apply w-1/3 text-center;
}

.user-submit {
	@apply w-fit mx-96
  cursor-pointer;
}
</style>
