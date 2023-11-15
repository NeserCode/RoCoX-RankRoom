<script lang="ts" setup>
import {
	MinusIcon,
	XMarkIcon,
	SunIcon,
	MoonIcon,
	PaperClipIcon,
} from "@heroicons/vue/20/solid"
import { ref, onMounted, toRefs, watch } from "vue"
import { useRoute } from "vue-router"
import { useStorage, useThrottleFn } from "@vueuse/core"

import { appWindow } from "@tauri-apps/api/window"

import { useDarkMode } from "../composables/useDarkMode"
import { useConstants } from "../composables/useConstant"

const $props = withDefaults(
	defineProps<{
		titleText?: string
	}>(),
	{
		titleText: "Rocox Rank Room",
	}
)
const { titleText } = toRefs($props)

const $route = useRoute()
const { TitleMapData } = useConstants()

const title = ref("Rocox Rank Room")
const titleMap = new Map(TitleMapData)
const isAlwaysonTop = useStorage("rocox-always-on-top", false)

function updateTitle() {
	title.value = titleMap.get($route.name?.toString().toLowerCase()!) ?? "Unkown"
}

watch(
	titleText,
	(value) => {
		title.value = value
	},
	{
		immediate: true,
	}
)

watch($route, (_route) => {
	updateTitle()
})

function getIspinnedClass() {
	return isAlwaysonTop.value ? "pinned" : null
}

// Initial top
onMounted(async () => {
	await appWindow.setAlwaysOnTop(isAlwaysonTop.value)
})

async function toggleIspinned() {
	isAlwaysonTop.value = !isAlwaysonTop.value
	await appWindow.setAlwaysOnTop(isAlwaysonTop.value)
}
const throttleToggleIspinned = useThrottleFn(() => {
	toggleIspinned()
}, 800)

function minimize() {
	let element = document.querySelector(".minimize.btn") as HTMLElement
	element.classList.remove("moving")
	appWindow.minimize()
}

async function close() {
	await appWindow.close()
}

function addMoveClass(event: MouseEvent) {
	let element = event.target as HTMLElement
	element.classList.add("moving")
}
function removeMoveClass(event: MouseEvent) {
	let element = event.target as HTMLElement
	element.classList.remove("moving")
}

const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>

<template>
	<div id="app-title-bar" data-tauri-drag-region>
		<span class="title" data-tauri-drag-region>
			<span data-tauri-drag-region>{{ title }} · {{ titleText }}</span>
		</span>
		<div class="buttons" data-tauri-drag-region>
			<span
				:class="['btn', 'pin', getIspinnedClass()]"
				@mouseenter="addMoveClass"
				@mouseleave="removeMoveClass"
				@click="throttleToggleIspinned"
			>
				<PaperClipIcon class="icon" />
			</span>
			<span
				class="btn darkmode"
				@mouseenter="addMoveClass"
				@mouseleave="removeMoveClass"
				@click="toggleDarkMode()"
			>
				<SunIcon v-show="!isDarkMode" />
				<MoonIcon v-show="isDarkMode" />
			</span>
			<span
				class="btn minimize"
				@mouseenter="addMoveClass"
				@mouseleave="removeMoveClass"
				@click="minimize"
			>
				<MinusIcon />
			</span>
			<span
				class="btn close danger"
				@mouseenter="addMoveClass"
				@mouseleave="removeMoveClass"
				@click="close"
			>
				<XMarkIcon />
			</span>
		</div>
	</div>
</template>

<style scoped lang="postcss">
#app-title-bar {
	@apply relative inline-flex items-center justify-end w-full h-8
	border-b border-slate-300 dark:border-slate-600
	bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-200
	transition-all
  select-none;
}

.title {
	@apply absolute inline-flex items-center top-1/2 left-2
	text-sm font-bold
	-translate-y-1/2;
}

.buttons {
	@apply inline-flex flex-row items-center justify-end w-full h-full;
}

.btn {
	@apply inline-flex items-center justify-center w-12 h-full py-2 px-3
	cursor-pointer rounded-none
	text-slate-600 dark:text-slate-100 
	transition ease-in-out duration-300;
}
.moving {
	@apply bg-slate-600 text-slate-100;
}
.moving.danger {
	@apply bg-red-400;
}

.darkmode {
	@apply w-10 py-1.5 px-3;
}

.pin {
	@apply w-10 p-0;
}
.pin .icon {
	@apply w-5 p-1 transition-all
	rounded scale-125;
}
.moving .icon {
	@apply rotate-[135deg];
}

.pin.pinned .icon {
	@apply bg-slate-600 text-slate-100 rotate-[135deg] scale-100;
}
</style>
