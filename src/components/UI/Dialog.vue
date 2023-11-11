<script setup lang="ts">
import {
	TransitionRoot,
	TransitionChild,
	Dialog,
	DialogPanel,
	DialogTitle,
	DialogDescription,
} from "@headlessui/vue"

const isOpen = defineModel<boolean>("open")
</script>

<template>
	<TransitionRoot appear :show="isOpen" as="template">
		<Dialog as="div" class="dialog" @close="isOpen = false">
			<TransitionChild
				as="template"
				enter="duration-300 ease-out"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="duration-200 ease-in"
				leave-from="opacity-100"
				leave-to="opacity-0"
			>
				<div class="dialog-backdrop" />
			</TransitionChild>

			<div class="dialog-warpper-main">
				<div class="dialog-warpper">
					<TransitionChild
						as="template"
						enter="duration-300 ease-out"
						enter-from="opacity-0 scale-95"
						enter-to="opacity-100 scale-100"
						leave="duration-200 ease-in"
						leave-from="opacity-100 scale-100"
						leave-to="opacity-0 scale-95"
					>
						<DialogPanel class="dialog-panel">
							<DialogTitle as="h3" class="dialog-title">
								<slot name="title"></slot>
							</DialogTitle>
							<DialogDescription as="div" class="dialog-details">
								<slot name="details"></slot>
								<div class="scrollable">
									<slot name="info"></slot>
								</div>
							</DialogDescription>
						</DialogPanel>
					</TransitionChild>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<style lang="postcss" scoped>
.dialog {
	@apply relative z-10;
}
.dialog-backdrop {
	@apply fixed inset-0 bg-black dark:bg-white
	backdrop-blur-sm
	bg-opacity-20 dark:bg-opacity-20 cursor-not-allowed;
}
.dialog-panel {
	@apply w-full max-w-lg px-6 py-4 overflow-hidden text-left
	align-middle transition-all transform
	bg-gray-50 dark:bg-gray-800 shadow-xl rounded-2xl cursor-auto;
}
.dialog-warpper-main {
	@apply fixed inset-0 overflow-hidden;
}
.dialog-warpper {
	@apply flex items-center justify-center min-h-full p-4 text-center;
}

.dialog-details {
	@apply flex flex-col
	text-sm font-normal select-none;
	font-family: "SourceHanSerifCN";
}
.dialog-details .scrollable {
	@apply flex flex-col justify-center px-6 max-h-80
	border-gray-200 dark:border-gray-700 overflow-y-auto;
}
.dialog-title {
	@apply inline-flex items-center py-2
	text-lg font-black leading-6 select-none;
	font-family: "SourceHanSerifCN";
}
</style>
