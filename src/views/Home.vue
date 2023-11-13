<script lang="ts" setup>
import { SignalSlashIcon, CubeTransparentIcon } from "@heroicons/vue/24/solid"
import RoomControl from "../components/RoomControl.vue"
import RankControl from "../components/RankControl.vue"
import UserListItem from "../components/UserListItem.vue"
import MessageListItem from "../components/MessageListItem.vue"
import Toggle from "../components/UI/Toggle.vue"

import { useStorage } from "@vueuse/core"
import {
	computed,
	inject,
	nextTick,
	onActivated,
	onBeforeUnmount,
	onMounted,
	reactive,
	ref,
	watch,
} from "vue"

import { SocketStateKey } from "../token"
import { useConstants } from "../composables/useConstant"
import type { UserInfo, IOMessage, SocketRenderState, IORoom } from "../shared"

const { NormalMessageType, DefaultRoom } = useConstants()
const userList = useStorage<UserInfo[]>("rocox-user-list", [])
const messageList = useStorage<IOMessage[]>("rocox-message-list", [])
const room = useStorage<IORoom>("rocox-room", DefaultRoom)

const socketState = inject<SocketRenderState>(SocketStateKey, {
	id: "",
	connected: false,
	io: undefined,
})

const isShowRank = useStorage("rocox-is-show-rank", false)
const isOnlyShowImportant = useStorage("rocox-is-only-show-important", false)
const sortedMessageList = computed(() => {
	if (isOnlyShowImportant.value)
		return messageList.value.filter(
			(msg) => !NormalMessageType.includes(msg.type)
		)
	return messageList.value
})

function scrollMessageList() {
	const listEl = document.querySelector(".message-container")!
	nextTick(() => {
		listEl.scrollTo({
			top: listEl.scrollHeight,
			behavior: "smooth",
		})
	})
}

watch(
	() => messageList.value.length,
	() => {
		scrollMessageList()
	}
)

onMounted(() => {
	scrollMessageList()
})

const userListEl = ref<HTMLElement>()
const messageListRef = ref<HTMLElement>()

const scrollTops = reactive({
	users: 0,
	messages: 0,
})
const scrollListeners = [
	() => {
		scrollTops.users = userListEl.value!.scrollTop
	},
	() => {
		scrollTops.messages = messageListRef.value!.scrollTop
	},
]
onMounted(() => {
	scrollListeners.forEach((fn) => {
		userListEl.value!.addEventListener("scroll", fn)
		messageListRef.value!.addEventListener("scroll", fn)
	})
})
onBeforeUnmount(() => {
	scrollListeners.forEach((fn) => {
		userListEl.value!.removeEventListener("scroll", fn)
		messageListRef.value!.removeEventListener("scroll", fn)
	})
})
onActivated(() => {
	nextTick(() => {
		userListEl.value!.scrollTo({
			top: scrollTops.users,
			behavior: "smooth",
		})
		messageListRef.value!.scrollTo({
			top: scrollTops.messages,
			behavior: "smooth",
		})
	})
})
</script>

<template>
	<div class="home">
		<div class="main-container">
			<div class="user-container custom-scrollbar" ref="userListEl">
				<div class="user-list-controll">
					<span class="server-info">
						<span class="server-users" v-if="userList.length"
							>服务器人数 {{ userList.length }}</span
						>
						<span class="server-users" v-else>未连接服务器</span>
						<span class="room-users" v-if="room.users.length">
							房内人数 {{ room.users.length }}
						</span>
						<span class="room-users" v-else> 未加入房间 </span>
					</span>
					<span class="rank-visable">
						<span class="text">段位显示</span>
						<Toggle
							v-model:enabled="isShowRank"
							:disabled="!socketState.connected"
						/>
					</span>
				</div>
				<div class="user-list">
					<template v-if="userList.length && socketState.connected">
						<UserListItem
							v-for="user in userList"
							:key="user.socketId"
							:socket-id="user.socketId"
							:username="user.username"
							:user-rank="JSON.parse(user.userRank as string)"
							:rank-visable="isShowRank"
						/>
					</template>
					<Transition name="fade" mode="out-in" appear>
						<template v-if="!userList.length || !socketState.connected">
							<div class="placeholder">
								<SignalSlashIcon class="icon" />
								<span class="text">请先连接至可用的服务器</span>
							</div>
						</template>
					</Transition>
				</div>
			</div>
			<div class="message-container custom-scrollbar" ref="messageListRef">
				<div class="message-list-controll">
					<span class="text">只显示重要信息</span>
					<Toggle
						v-model:enabled="isOnlyShowImportant"
						:disabled="!socketState.connected"
					/>
				</div>
				<div class="message-list">
					<template v-if="sortedMessageList.length">
						<MessageListItem
							v-for="message in sortedMessageList"
							:key="message.t"
							:message="message"
						/>
					</template>
					<Transition name="fade" mode="out-in" appear>
						<template v-if="!sortedMessageList.length">
							<div class="placeholder">
								<CubeTransparentIcon class="icon" />
								<span class="text">暂无消息</span>
							</div>
						</template>
					</Transition>
				</div>
			</div>
		</div>
		<RoomControl />
		<RankControl />
	</div>
</template>

<style lang="postcss" scoped>
.home {
	@apply w-full h-full flex items-center justify-center
	z-0;
}

.main-container {
	@apply w-full h-96 flex items-center justify-center
	border-2 border-slate-200 dark:border-slate-500
	overflow-hidden transition-all duration-300;
}
.user-container {
	@apply w-1/3 h-full
	border-r-2 border-slate-200 dark:border-slate-500
	transition-all duration-300 overflow-y-auto;
}
.user-list {
	@apply h-fit flex flex-row flex-wrap p-2 gap-0.5;
}
.message-container {
	@apply w-2/3 h-full flex flex-col
	text-base font-semibold
	overflow-y-auto overflow-x-hidden transition-all duration-300;
}

.placeholder {
	@apply w-full h-fit flex flex-col items-center justify-center gap-4 py-4
	select-none;
}
.placeholder .icon {
	@apply w-8 h-8;
}
.placeholder .text {
	@apply text-sm font-semibold;
}

.user-list-controll,
.message-list-controll {
	@apply sticky top-0 w-full flex flex-row items-center p-2 gap-2
	border-b-2 border-slate-200 dark:border-slate-500
	bg-slate-100 dark:bg-slate-600
	text-sm font-black select-none transition-all duration-300
	z-10;
}
.rank-visable {
	@apply inline-flex flex-row items-center gap-1;
}

.server-info {
	@apply inline-flex flex-col justify-center pr-2
	border-r-2 border-slate-300 dark:border-slate-500;
}

.message-list {
	@apply w-full h-full flex flex-col px-3 py-1.5;
}
</style>
