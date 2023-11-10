<script lang="ts" setup>
import { CubeIcon, CubeTransparentIcon } from "@heroicons/vue/24/solid"
import Dialog from "./UI/Dialog.vue"

import { inject, reactive, ref } from "vue"
import { useStorage } from "@vueuse/core"
// @ts-ignore
import CryptoJS from "crypto-js"

import { SocketEmiterFunctionKey } from "../token"
import type { IORenderRoomFunction, IORoom } from "../shared"

const isShowCreateRoomPanel = ref(false)
const openCreateRoomPanel = () => {
	isShowCreateRoomPanel.value = true
}

const roomCreateData = reactive({
	id: "",
	name: "",
	password: "",
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
const { createRoom } = useRooms()
const socketId = useStorage<string>("rocox-socket-id", "")
const roomList = useStorage<IORoom[]>("rocox-room-list", [])

const createIORoom = () => {
	const { id, password, name } = roomCreateData
	createRoom(id, CryptoJS.AES.encrypt(password, "rocox").toString(), name)
	isShowCreateRoomPanel.value = false
	roomCreateData.id = ""
	roomCreateData.password = ""
	roomCreateData.name = ""
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
		<form class="room">
			<input type="text" class="room-name" placeholder="房间编号*" required />
			<input type="password" class="room-key" placeholder="密钥（选填）" />
			<input type="submit" class="btn" value="加入" />
			<button type="button" class="btn" @click="openCreateRoomPanel">
				<CubeIcon class="icon" />
				<span class="text">创建</span>
			</button>
			<button type="button" class="btn" @click="openRoomListPanel">
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
	@apply inline-flex items-center flex-wrap gap-2 p-2;
}

.room-list-placeholder {
	@apply flex flex-col justify-center items-center gap-2
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
