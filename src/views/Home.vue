<script lang="ts" setup>
import RoomControl from "../components/RoomControl.vue"
import UserListItem from "../components/UserListItem.vue"

import { useStorage } from "@vueuse/core"

const userList = useStorage<
	{
		socketId: string
		username: string
		userRank: string
	}[]
>("rocox-user-list", [])
</script>

<template>
	<div id="home">
		<div class="main-container">
			<div class="user-container">
				<div class="user-list">
					<template v-if="userList.length">
						<UserListItem
							v-for="user in userList"
							:key="user.socketId"
							:socket-id="user.socketId"
							:username="user.username"
							:user-rank="JSON.parse(user.userRank)"
						/>
					</template>
				</div>
			</div>
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
.user-container {
	@apply w-1/3 h-full
	bg-slate-100 dark:bg-slate-600
	transition-all duration-300;
}
.user-list {
	@apply h-fit flex flex-row flex-wrap px-3 py-2;
}
.message-container {
	@apply w-2/3 h-full flex flex-col px-3 py-1.5
	text-base font-semibold
	truncate transition-all duration-300;
}
</style>
