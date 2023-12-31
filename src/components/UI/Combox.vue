<script lang="ts" setup>
import {
	Combobox,
	ComboboxInput,
	ComboboxButton,
	ComboboxOptions,
	ComboboxOption,
	TransitionRoot,
} from "@headlessui/vue"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid"

import { ref, computed } from "vue"

import type { IORoom, UserInfo, UserRank } from "../../shared"
import { useStorage } from "@vueuse/core"
import { useConstants } from "../../composables/useConstant"
import { rawDatatoObject } from "../../composables/utils"

const { DefaultRoom } = useConstants()
const room = useStorage<IORoom>("rocox-room", DefaultRoom)
const socketIdLocal = useStorage<string>("rocox-socket-id", "")

const passerby: UserInfo = {
	socketId: "id-for-passerby",
	username: "路人",
	userRank: {
		level: 5,
		standard: 0,
		stars: 999,
	},
}
const sortedUsers = computed(() => {
	return room.value.users.filter((u) => u.socketId !== socketIdLocal.value)
})
const selectedUser = useStorage("rocox-rank-selected-user", passerby)
const query = ref("")
const filteredUsers = computed(() => {
	return query.value === ""
		? sortedUsers.value
		: sortedUsers.value.filter((user) =>
				user.username.toLowerCase().includes(query.value.toLowerCase())
		  )
})

// @ts-ignore
const displayValue = (user) => {
	if (user.username !== passerby.username)
		return `${user.username} ${computedRank(rawDatatoObject(user.userRank))}`
	else return user.username
}
const changeInput = (e: any) => {
	query.value = e.target!.value
}

const computedRank = (rankData: UserRank) => {
	const { level, standard, stars } = rankData
	const levelText =
		Number(level) == 0
			? "学徒魔法师"
			: level == 1
			? "初级魔法师"
			: level == 2
			? "中级魔法师"
			: level == 3
			? "高级魔法师"
			: level == 4
			? "魔导士"
			: "圣魔导师"
	let standardText = "~"

	switch (Number(standard)) {
		case 1:
			standardText = "I"
			break
		case 2:
			standardText = "II"
			break
		case 3:
			standardText = "III"
			break
		case 4:
			standardText = "IV"
			break
		case 5:
			standardText = "V"
			break
		default:
			standardText = "~"
			break
	}

	return `${levelText} · ${standardText} · ${stars}星`
}
const compareUser = (a: UserInfo, b: UserInfo) => {
	return a.socketId === b.socketId
}
</script>

<template>
	<Combobox v-model="selectedUser" :by="compareUser">
		<div class="combox-main">
			<div class="combox-input-wrapper">
				<ComboboxInput
					class="combox-input"
					:displayValue="displayValue"
					@change="changeInput"
					placeholder="键入以检索"
				/>
				<ComboboxButton class="combox-btn">
					<ChevronUpDownIcon class="icon" aria-hidden="true" />
				</ComboboxButton>
			</div>
			<TransitionRoot
				leave="transition ease-in duration-100"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
				@after-leave="query = ''"
			>
				<ComboboxOptions class="combox-options custom-scrollbar">
					<div
						v-if="filteredUsers.length === 0"
						class="combox-option-placeholder"
					>
						<span class="nothing-tip">没有检索到以上关键词</span>
					</div>

					<ComboboxOption
						v-for="user in filteredUsers"
						as="template"
						:key="user.socketId"
						:value="user"
						v-slot="{ selected, active }"
					>
						<li
							class="combox-option"
							:class="{
								'bg-teal-600 text-white': active,
							}"
						>
							<span class="user-info">
								<span class="username">{{ user.username }}</span>
								<span class="user-rank">{{
									computedRank(JSON.parse(user.userRank as string))
								}}</span>
							</span>
							<span
								v-if="selected"
								class="absolute inset-y-0 left-0 flex items-center pl-3"
								:class="{ 'text-white': active, 'text-teal-600': !active }"
							>
								<CheckIcon class="w-5 h-5" aria-hidden="true" />
							</span>
						</li>
					</ComboboxOption>
					<ComboboxOption
						as="template"
						:value="passerby"
						v-slot="{ selected, active }"
					>
						<li
							class="combox-option"
							:class="{
								'bg-teal-600 text-white': active,
							}"
						>
							<span class="user-info">
								<span class="username">{{ passerby.username }}</span>
								<span class="user-rank">{{
									computedRank(passerby.userRank as UserRank)
								}}</span>
							</span>
							<span
								v-if="selected"
								class="absolute inset-y-0 left-0 flex items-center pl-3"
								:class="{ 'text-white': active, 'text-teal-600': !active }"
							>
								<CheckIcon class="w-5 h-5" aria-hidden="true" />
							</span>
						</li>
					</ComboboxOption>
				</ComboboxOptions>
			</TransitionRoot>
		</div>
	</Combobox>
</template>

<style lang="postcss">
.combox-main {
	@apply relative w-full inline-flex flex-col justify-center items-center my-4;
}
.combox-input-wrapper {
	@apply relative w-60
  cursor-default;
}

.combox-input {
	@apply w-60 text-sm z-10
	disabled:cursor-not-allowed disabled:opacity-75;
}

.combox-btn {
	@apply absolute inset-y-0 -right-10 flex items-center px-1
	border-2 rounded border-gray-300 dark:border-gray-500 caret-slate-400
  bg-slate-100 dark:bg-slate-600
	disabled:cursor-not-allowed disabled:opacity-75;
}
.combox-btn .icon {
	@apply w-5 h-5 text-gray-400;
}

.combox-options {
	@apply absolute w-60 max-h-48 py-1 mt-1 left-1/2
  font-extrabold text-sm
	bg-white dark:bg-slate-700
  shadow-lg
  ring-1 ring-black/5 outline-none overflow-auto z-10
  transition-all ease-in-out duration-300 -translate-x-1/2;
}
.combox-option {
	@apply relative py-0.5 pl-10 pr-4
  cursor-default select-none;
}

.combox-option-placeholder {
	@apply relative
  cursor-default select-none;
}
.combox-option-placeholder .nothing-tip {
	@apply inline-flex items-center p-2
	text-xs opacity-60;
}
</style>

<style lang="postcss" scoped>
.user-info {
	@apply inline-flex flex-col justify-center
	text-slate-700 dark:text-slate-300;
}
.user-info .username {
	@apply text-base;
}
.user-info .user-rank {
	@apply text-xs opacity-60;
}
</style>
