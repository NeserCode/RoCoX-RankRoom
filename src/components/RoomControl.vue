<script lang="ts" setup>
import Dialog from "./UI/Dialog.vue"

import { inject, reactive, ref } from "vue"

import { SocketEmiterFunctionKey } from "../token"
import type { IORenderRoomFunction } from "../shared"

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
	{ useRooms: () => ({ createRoom: (_id, _password, _name) => {} }) }
)
const { createRoom } = useRooms()
const createIORoom = () => {
	const { id, password, name } = roomCreateData
	createRoom(id, password, name)
	isShowCreateRoomPanel.value = false
	roomCreateData.id = ""
	roomCreateData.password = ""
	roomCreateData.name = ""
}
</script>

<template>
	<div id="room-control">
		<form class="room">
			<input type="text" class="room-name" placeholder="房间编号*" required />
			<input type="password" class="room-key" placeholder="密钥（选填）" />
			<input type="submit" class="btn" value="加入" />
			<button type="button" class="btn" @click="openCreateRoomPanel">
				创建
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
					<button type="button" class="btn">使用连接编号用作房间编号</button>
					<button type="submit" class="btn">创建房间</button>
				</form>
			</template>
		</Dialog>
	</div>
</template>

<style lang="postcss" scoped>
#room-control {
	@apply w-full h-full flex py-4 px-2;
}

form.room {
	@apply w-full h-full flex flex-wrap gap-2;
}

.room-name {
	@apply w-72;
}

.room-create {
	@apply inline-flex items-center flex-wrap gap-2 p-2;
}
</style>
