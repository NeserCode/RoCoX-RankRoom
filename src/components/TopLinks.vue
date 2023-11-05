<script lang="ts" setup>
import {
	UserGroupIcon,
	QuestionMarkCircleIcon,
	Cog6ToothIcon,
} from "@heroicons/vue/20/solid"

import { computed } from "vue"
import { RouterLink, useRoute } from "vue-router"

const $route = useRoute()
const shouldShowLinksPath = ["home", "setting", "about"]
const hasActivedLink = computed(() => {
	return shouldShowLinksPath.includes(
		(($route.name as string) ?? "").toLowerCase()
	)
})
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
		</div>
	</Transition>
</template>

<style lang="postcss" scoped>
#top-links {
	@apply w-full h-full flex items-center justify-center py-4;
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

.links-menu {
	@apply fixed left-4 z-10;
}
</style>
