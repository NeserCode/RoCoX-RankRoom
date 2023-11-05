<script setup lang="ts">
import TopLinks from "./components/TopLinks.vue"
import TitleBar from "./components/TitleBar.vue"

import { provide, ref } from "vue"
import { useStorage } from "@vueuse/core"

import { UpdateTitleFunctionalKey } from "./token"

const title = ref("RocoKindom Rank Room")
function titleUpdateFn(change: string) {
	title.value = change
}
provide(UpdateTitleFunctionalKey, { titleUpdateFn })

const slideDirection = useStorage(
	"rocox-navigation-transition-direction",
	"slideleft"
)
</script>

<template>
	<!-- <div id="app-main" @contextmenu.prevent></div> -->
	<div id="app-main">
		<TitleBar :titleText="title" />
		<TopLinks />

		<router-view id="context" v-slot="{ Component }">
			<Transition :name="slideDirection" mode="out-in" :appear="true">
				<keep-alive :include="['Home', 'About', 'Setting']">
					<component :is="Component" :key="$route.fullPath" />
				</keep-alive>
			</Transition>
		</router-view>
	</div>
</template>

<style lang="postcss">
html.dark {
	color-scheme: dark;
}

@font-face {
	src: url("./assets/SourceHanSerifCN-VF.ttf");
	font-family: "SourceHanSerifCN";
}

.custom-scrollbar::-webkit-scrollbar {
	@apply w-2;
}
.custom-scrollbar::-webkit-scrollbar-track {
	@apply bg-slate-200 dark:bg-slate-600;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	@apply bg-slate-400 shadow;
}
</style>

<style lang="postcss">
.slideleft-enter-active,
.slideleft-leave-active,
.slideup-enter-active,
.slideup-leave-active,
.slidedown-enter-active,
.slidedown-leave-active,
.slideright-enter-active,
.slideright-leave-active {
	@apply transition-all;
}

.slideleft-enter-from,
.slideleft-leave-to {
	@apply translate-x-4 opacity-0;
}
.slideright-enter-from,
.slideright-leave-to {
	@apply -translate-x-4 opacity-0;
}
.slideup-enter-from {
	@apply translate-y-0 opacity-0;
}
.slideup-leave-to {
	@apply translate-y-2 opacity-0;
}
.slidedown-enter-from {
	@apply translate-y-0 opacity-0;
}
.slidedown-leave-to {
	@apply -translate-y-2 opacity-0;
}
</style>

<style scoped lang="postcss">
#app-main {
	@apply relative w-full h-full
	border border-slate-400
	bg-slate-50 dark:bg-slate-700
	text-slate-700 dark:text-slate-100
	transition-all duration-200 ease-in-out
	overflow-hidden;

	font-family: "SourceHanSerifCN";
}

#context {
	@apply relative flex w-full min-h-[702px] flex-col justify-start items-center px-4;
}
</style>
