import { useMessages } from "./message"

import type { Server, Socket } from "socket.io"
import type { IOMessage, IORoom, IOUserMessageType, UserInfo } from "../shared"

export const useUsers = (
	io: Server,
	users: UserInfo[],
	messages: IOMessage[],
	rooms: IORoom[]
) => {
	const { IOSendMessage } = useMessages(io, messages)

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

	const IOUserLeft = function (this: Socket) {
		const socket = this
		const user: UserInfo = users.find((u) => u.socketId === this.id)!
		users = users.filter((u) => u.socketId !== this.id)

		IOEmitUsers()
		IOSendUserMessage("LEFT_SERVER", this, user)

		console.log(`[User Left Server] ${socket.id}`, user)
	}

	const IOUserJoin = function (this: Socket, payload: UserInfo) {
		const socket = this
		users.push(payload)

		IOEmitUsers()
		IOSendUserMessage("JOIN_SERVER", this, payload)

		console.log(`[User Join Server] ${socket.id}`, payload)
	}

	const UpdateUser = function (this: Socket, payload: UserInfo) {
		const socket = this
		users = users.map((u) => {
			if (u.socketId === this.id) {
				return payload
			}
			return u
		})
		IOEmitUsers()
		IOSendUserMessage("USER_UPDATE", this, payload)

		console.log(`[User Join Server] ${socket.id}`, payload)
	}
	return {
		IOUserJoin,
		IOUserLeft,
		UpdateUser,
	}
}
