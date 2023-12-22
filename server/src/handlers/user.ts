import { useMessages } from "./message"

import type { Server, Socket } from "socket.io"
import type { IOMessage, IORoom, IOUserMessageType, UserInfo } from "../shared"
import { RankFlow } from "../entity/RankFlow"
import { useRooms } from "./rooms"

export const useUsers = (
	io: Server,
	users: UserInfo[],
	messages: IOMessage[],
	rooms: IORoom[],
	flows: RankFlow[]
) => {
	const { IOSendMessage } = useMessages(io, messages)
	const { onRoomLeft } = useRooms(io, users, messages, rooms, flows)

	const IOSendUserMessage = function (
		type: IOUserMessageType,
		socket: Socket,
		payload: UserInfo
	) {
		const state = {
			connected: socket.connected,
			disconnected: socket.disconnected,
		}
		const id = socket.id

		IOSendMessage({
			type,
			io: { id },
			data: { user: payload },
			t: new Date().getTime(),
			state,
		})
	}
	const IOEmitUsers = function () {
		io.emit("users:update", users)
	}
	const IOEmitRooms = function () {
		io.emit("rooms:update", rooms)
	}

	const onIOUserLeft = function (this: Socket) {
		const socket = this
		const user: UserInfo = users.find((u) => u.socketId === this.id)!
		users = users.filter((u) => u.socketId !== this.id)

		IOEmitUsers()
		IOEmitRooms()
		IOSendUserMessage("LEFT_SERVER", this, user)

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (room) onRoomLeft.call(socket, room.id)
		console.log(`[User Left Server] ${socket.id}`)
	}

	const onIOUserJoin = function (this: Socket, payload: UserInfo) {
		const socket = this
		users.push(payload)

		IOEmitUsers()
		IOEmitRooms()
		IOSendUserMessage("JOIN_SERVER", this, payload)

		console.log(`[User Join Server] ${socket.id}`)
	}

	const onUpdateUser = function (this: Socket, payload: UserInfo) {
		const socket = this
		users = users.map((u) => {
			if (u.socketId === this.id) {
				return payload
			}
			return u
		})

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (room)
			room.users = room.users.map((u) =>
				u.socketId === socket.id ? payload : u
			)

		IOEmitUsers()
		IOEmitRooms()
		IOSendUserMessage("USER_UPDATE", this, payload)

		console.log(`[User Update] ${socket.id}`)
	}
	return {
		onIOUserJoin,
		onIOUserLeft,
		onUpdateUser,
	}
}
