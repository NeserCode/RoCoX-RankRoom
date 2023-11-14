<script lang="ts" setup>
import SocketState from "./SocketState.vue"
import RoomState from "./RoomState.vue"
import {
	UserGroupIcon,
	QuestionMarkCircleIcon,
	Cog6ToothIcon,
} from "@heroicons/vue/20/solid"

import { computed, inject } from "vue"
import { RouterLink, useRoute } from "vue-router"

import { SocketStateKey } from "../token"

const $route = useRoute()
const shouldShowLinksPath = ["home", "setting", "about"]
const hasActivedLink = computed(() => {
	return shouldShowLinksPath.includes(
		(($route.name as string) ?? "").toLowerCase()
	)
})

const socketState = inject(SocketStateKey, { id: "", connected: false })
</script>

<template>
	<Transition name="slideleft" mode="out-in" appear>
		<div id="top-links" v-show="hasActivedLink">
			<RouterLink draggable="false" class="link" to="/">
				<UserGroupIcon class="icon" />
				<span class="text">房间</span>
			</RouterLink>
			<RouterLink draggable="false" class="link" to="/setting">
				<Cog6ToothIcon class="icon" />
				<span class="text">设置</span>
			</RouterLink>
			<RouterLink draggable="false" class="link" to="/about">
				<QuestionMarkCircleIcon class="icon" />
				<span class="text">关于</span>
			</RouterLink>

			<SocketState
				class="links-status"
				:id="socketState.id"
				:connected="socketState.connected"
			/>
			<RoomState class="room-status" />
		</div>
	</Transition>
</template>

<style lang="postcss" scoped>
#top-links {
	@apply relative w-full h-full flex items-center justify-center py-4;
}

.link {
	@apply inline-flex justify-center items-center mx-1 px-2.5 py-1
  bg-slate-200 dark:bg-slate-800
  text-base font-black shadow
  rounded transition-all select-none;
}
.link.router-link-exact-active {
	@apply bg-green-400 text-sky-50 dark:bg-green-500
  shadow-lg;
}

.link .icon {
	@apply w-4 h-4 mr-1;
}

.links-status {
	@apply absolute left-4 z-10;
}
.room-status {
	@apply absolute right-4 z-10;
}
</style>
