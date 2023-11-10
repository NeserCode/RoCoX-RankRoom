<script lang="ts" setup>
import { CubeIcon, CubeTransparentIcon } from "@heroicons/vue/24/solid"
import Dialog from "./UI/Dialog.vue"

import { computed, inject, onMounted, reactive, ref } from "vue"
import { useStorage } from "@vueuse/core"
// @ts-ignore
import CryptoJS from "crypto-js"
import { fetch } from "@tauri-apps/api/http"

import { SocketEmiterFunctionKey, SocketStateKey } from "../token"
import { useConstants } from "../composables/useConstant"
import type { IORenderRoomFunction, IORoom, SocketRenderState } from "../shared"
import { toast } from "vue3-toastify"
import { useDarkMode } from "../composables/useDarkMode"

const socketState = inject<SocketRenderState>(SocketStateKey, {
	id: "",
	connected: false,
	io: undefined,
})
const { DefaultRoom } = useConstants()
const { isDarkMode } = useDarkMode()

const isShowCreateRoomPanel = ref(false)
const openCreateRoomPanel = () => {
	isShowCreateRoomPanel.value = true
}

const roomInputs = reactive({
	roomId: "",
	password: "",
})
const roomCreateData = reactive({
	id: "",
	name: "",
	password: "",
	creationKey: "",
})

const { useRooms } = inject<{ useRooms: () => IORenderRoomFunction }>(
	SocketEmiterFunctionKey,
	{
		useRooms: () => ({
			createRoom: (_id, _password, _name) => {},
			joinRoom: (_id, _password) => {},
			leftRoom: (_id) => {},
			destoryRoom: (_id, _password) => {},
		}),
	}
)
const { createRoom, joinRoom, leftRoom, destoryRoom } = useRooms()
const socketId = useStorage<string>("rocox-socket-id", "")
const roomList = useStorage<IORoom[]>("rocox-room-list", [])
const roomData = useStorage<IORoom>("rocox-room", DefaultRoom)
const IOCreationKey = useStorage<string>("rocox-io-creation-key", "")

const isJoinedRoom = computed(() => roomData.value.id !== "")
const isHostRoom = computed(() => roomData.value.host === socketId.value)

const useFetchKey = async (hash: string): Promise<string> => {
	const response = await fetch<string>(
		`https://rocoxdevrankkey--nesercode.repl.co/key?username=${hash}`,
		{
			method: "GET",
			responseType: 2,
		}
	)

	return response.data
}

const createIORoom = async () => {
	const veryifyKey = await useFetchKey(roomCreateData.creationKey)
	if (IOCreationKey.value !== veryifyKey) {
		toast.error("Creation Key is not valid", {
			theme: isDarkMode.value ? "dark" : "light",
		})

		roomCreateData.creationKey = ""
		return
	}

	const { id, password, name } = roomCreateData
	createRoom(id, CryptoJS.HmacMD5(password, "rocox").toString(), name)
	isShowCreateRoomPanel.value = false
	roomCreateData.id = ""
	roomCreateData.password = ""
	roomCreateData.name = ""
	roomCreateData.creationKey = ""
}
const joinIORoom = () => {
	const { roomId, password } = roomInputs
	joinRoom(roomId, CryptoJS.HmacMD5(password, "rocox").toString())
	roomInputs.roomId = ""
	roomInputs.password = ""
}
const leftIORoom = () => {
	leftRoom(roomData.value.id)
}
const destoryIORoom = () => {
	const { password } = roomInputs
	destoryRoom(roomData.value.id, CryptoJS.HmacMD5(password, "rocox").toString())
	roomInputs.password = ""
}

const useSocketIdforRoomId = () => {
	roomCreateData.id = socketId.value
}
const isShowRoomListPanel = ref(false)
const openRoomListPanel = () => {
	isShowRoomListPanel.value = true
}

const copyText = async (text: string) => {
	await navigator.clipboard.writeText(text)
}
</script>

<template>
	<div id="room-control">
		<form
			class="room"
			@submit.prevent="!isHostRoom ? joinIORoom() : destoryIORoom()"
		>
			<input
				type="text"
				class="room-name"
				placeholder="房间编号*"
				required
				v-model="roomInputs.roomId"
				v-if="!isJoinedRoom"
			/>
			<input
				type="password"
				class="room-key"
				placeholder="密钥"
				v-model="roomInputs.password"
				v-if="!isJoinedRoom || isHostRoom"
				:required="isHostRoom"
			/>
			<input
				type="submit"
				class="btn"
				:disabled="!socketState.connected"
				value="加入"
				v-if="!isJoinedRoom"
			/>
			<button class="btn" v-if="isJoinedRoom" type="button" @click="leftIORoom">
				退出房间
			</button>
			<button class="btn" v-if="isHostRoom">销毁房间</button>
			<button
				type="button"
				class="btn"
				:disabled="!socketState.connected"
				@click="openCreateRoomPanel"
			>
				<CubeIcon class="icon" />
				<span class="text">创建</span>
			</button>
			<button
				type="button"
				class="btn"
				:disabled="!socketState.connected"
				@click="openRoomListPanel"
			>
				<CubeIcon class="icon" />
				<span class="text">房间 {{ roomList.length }}</span>
			</button>
		</form>
		<Dialog v-model:open="isShowCreateRoomPanel">
			<template #title> 新建房间 </template>
			<template #info>
				<form class="room-create" @submit.prevent="createIORoom">
					<input
						type="text"
						class="room-name"
						placeholder="房间名称*"
						required
						v-model="roomCreateData.name"
					/>
					<input
						type="text"
						class="room-id"
						placeholder="房间编号*"
						required
						v-model="roomCreateData.id"
					/>
					<input
						type="password"
						required
						class="room-key"
						placeholder="密钥*"
						v-model="roomCreateData.password"
					/>
					<input
						type="password"
						required
						class="room-secret-key"
						placeholder="授权密钥*"
						v-model="roomCreateData.creationKey"
					/>
					<button type="button" class="btn" @click="useSocketIdforRoomId">
						使用连接编号用作房间编号
					</button>
					<button type="submit" class="btn">创建房间</button>
				</form>
			</template>
		</Dialog>
		<Dialog v-model:open="isShowRoomListPanel">
			<template #title> 房间列表 </template>
			<template #info>
				<table class="room-list" v-if="roomList.length">
					<thead align="center">
						<tr>
							<th>房间名称</th>
							<th>房间编号</th>
							<th>房间人数</th>
						</tr>
					</thead>
					<tbody align="center">
						<tr class="room-list-item" v-for="room in roomList" :key="room.id">
							<td>{{ room.name }}</td>
							<td @dblclick="copyText(room.id)">{{ room.id }}</td>
							<td>{{ room.users.length }}</td>
						</tr>
					</tbody>
				</table>
				<div class="room-list-placeholder" v-else>
					<CubeTransparentIcon class="icon" />
					<span class="text">房间列表为空</span>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<style lang="postcss" scoped>
#room-control {
	@apply w-full h-full flex py-4 px-2;
}

.icon {
	@apply w-4 h-4 inline-block mr-0.5;
}

form.room {
	@apply w-full h-full flex flex-wrap gap-2;
}

.room-name {
	@apply w-72;
}
.room-key {
	@apply w-48;
}

.room-create {
	@apply inline-flex items-center flex-wrap mt-4 mb-8 p-2 gap-2;
}

.room-list-placeholder {
	@apply flex flex-col justify-center items-center my-8 gap-2
	text-base;
}
.room-list-placeholder .icon {
	@apply w-7 h-7;
}

.room-list {
	@apply w-full h-fit border-collapse table-auto
	border-2 rounded
	text-base
	border-gray-300 dark:border-gray-600;
}
.room-list th,
.room-list td {
	@apply border-2 border-slate-200 dark:border-slate-600;
}
.room-list th {
	@apply bg-slate-200 dark:bg-slate-600;
}
</style>
