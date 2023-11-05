<script lang="ts" setup>
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid"
import { useThrottleFn } from "@vueuse/core"
import { watch, Ref, ref, toRefs } from "vue"

const $props = withDefaults(
	defineProps<{
		page: number
		canJump?: boolean
		pageSize?: number
		total?: number
		pageUpdateFn?: (page: number) => void
		hasPrev?: boolean
		hasNext?: boolean
	}>(),
	{
		page: 1,
		pageSize: 21,
		total: 3148,
		canJump: true,
		hasPrev: false,
		hasNext: true,
		pageUpdateFn: (page: number) => {
			console.log(
				"Make Sure have a updater function had been use. Page changes to",
				page
			)
		},
	}
)

const { page, total, canJump, hasNext, hasPrev } = toRefs($props)
const { pageUpdateFn } = $props
const innerPage = ref(page.value)
const bar: Ref<HTMLElement | null> = ref(null)

watch(page, (value) => {
	innerPage.value = value
})

function getDisabledClass(bool: boolean) {
	return bool ? "disabled" : null
}

function submitPageChange(change?: "plus" | "minus") {
	if (change !== undefined)
		if (change === "plus") innerPage.value++
		else innerPage.value--

	pageUpdateFn(innerPage.value)
}
const throttleSubmitPageChange = useThrottleFn((change?: "plus" | "minus") => {
	submitPageChange(change)
	bar.value!.classList.remove("active")
}, 800)
const throttleSubmitPageChangeWithProgress = (change?: "plus" | "minus") => {
	bar.value!.classList.add("active")
	throttleSubmitPageChange(change)
}
</script>

<template>
	<div class="pagination">
		<span
			:class="['prev', 'operation', getDisabledClass(!hasPrev)]"
			@click="throttleSubmitPageChangeWithProgress('minus')"
		>
			<ChevronLeftIcon class="icon" />
		</span>
		<input
			v-model="innerPage"
			class="numbers"
			v-if="canJump && total && pageSize"
			type="number"
			:min="1"
			@keyup.enter="throttleSubmitPageChangeWithProgress()"
		/>
		<span v-else class="page">{{ page }}</span>
		<span
			:class="['next', 'operation', getDisabledClass(!hasNext)]"
			@click="throttleSubmitPageChangeWithProgress('plus')"
		>
			<ChevronRightIcon class="icon" />
		</span>
		<span v-if="canJump && total && pageSize" class="append-text"
			>共 {{ Math.round(total / pageSize) }} 页</span
		>
		<span class="progress-bar" ref="bar"></span>
	</div>
</template>

<style lang="postcss" scoped>
.pagination {
	@apply relative inline-flex justify-center items-center flex-wrap mt-4;
}
.operation {
	@apply inline-flex justify-center items-center px-0.5
	border-2 bg-slate-200 border-slate-300 dark:bg-slate-600 dark:border-slate-500
	hover:bg-slate-300 hover:border-slate-400 dark:hover:bg-slate-500 dark:hover:border-slate-400
	active:bg-slate-400 active:border-slate-500 dark:active:bg-slate-400 dark:active:border-slate-300
	transition-all rounded select-none cursor-pointer;
}
.operation .icon {
	@apply inline-block w-6 h-6
	transition-all;
}

.operation.disabled {
	@apply opacity-50 cursor-not-allowed pointer-events-none;
}

.page {
	@apply inline-flex items-center justify-center mx-4
	select-none transition-all;
}

.numbers {
	@apply inline-flex items-center justify-center w-12 h-full mx-2 p-0.5
	border-2 border-slate-300 dark:border-slate-600
	focus:ring-2 ring-green-300 dark:ring-green-500
	rounded text-center text-sm
	outline-none overflow-hidden transition-all;
}

.append-text {
	@apply inline-block mx-3
	text-sm font-semibold select-none;
}

.progress-bar {
	@apply absolute w-full max-w-[128px] h-0.5 bottom-0 left-0
	bg-green-400 translate-y-2;
}
.progress-bar.active {
	animation: linearProgress 0.5s linear forwards;
}
</style>

<style lang="postcss">
@keyframes linearProgress {
	0% {
		@apply bg-slate-400 w-0;
	}
	50% {
		@apply w-1/2;
	}
	100% {
		@apply bg-green-400 w-full;
	}
}
</style>
