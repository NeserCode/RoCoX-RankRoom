import { useMessages } from "./message"

import type { Server, Socket } from "socket.io"
import type {
	IOMessage,
	IORoom,
	IORoomMessageType,
	RoomCreationInfo,
	RoomDestoryInfo,
	RoomJoinInfo,
	UserInfo,
} from "../shared"
import { useRanks } from "./rank"
import { RankFlow } from "../entity/RankFlow"

export const useRooms = (
	io: Server,
	users: UserInfo[],
	messages: IOMessage[],
	rooms: IORoom[],
	flows: RankFlow[]
) => {
	const { IOSendMessage } = useMessages(io, messages)
	const { initRankFlow } = useRanks(io, users, messages, rooms, flows)

	const IOSendRoomMessage = function (
		id: string,
		type: IORoomMessageType,
		message: string
	) {
		const messageData = {
			type,
			roomId: id,
			data: { message },
			t: new Date().getTime(),
		}

		IOSendMessage(messageData)
		io.emit("rooms:success", messageData)
	}
	const IOEmitRooms = function () {
		io.emit("rooms:update", rooms)
	}
	const getDefaultRoom: (
		payload: RoomCreationInfo,
		user: UserInfo
	) => IORoom = (payload, user) => ({
		id: payload.id,
		name: payload.name,
		host: "",
		password: payload.password,
		rank: {
			state: "CONFIG",
			config: {
				type: "RANK_NORMAL",
				round: {
					round: 10,
					count: 10000,
				},
			},
			runtime: {
				id: payload.id,
				type: "RANK_NORMAL",
				round: {
					round: 0,
					count: 0,
				},
			},
			battles: [],
		},
		users: [],
		queues: {
			ready: [],
			rank: [],
		},
	})

	const success: (socket: Socket, message: string) => void = (
		socket,
		message
	) => {
		socket.emit("rooms:success", {
			data: {
				message,
			},
		})
	}
	const warning: (socket: Socket, message: string) => void = (
		socket,
		message
	) => {
		socket.emit("rooms:warning", {
			data: {
				message,
			},
		})
	}
	const error: (socket: Socket, message: string) => void = (
		socket,
		message
	) => {
		socket.emit("rooms:error", {
			data: {
				message,
			},
		})
	}

	const onRoomCreated = function (this: Socket, payload: RoomCreationInfo) {
		const socket = this
		const user = users.find((u) => u.socketId === socket.id)!
		const existingRoom = rooms.find((r) => r.id === payload.id)

		if (!user) return
		if (existingRoom) {
			error(socket, `该房间编号已经存在：#${existingRoom.name}#`)
			return
		}

		const room: IORoom = getDefaultRoom(payload, user)
		initRankFlow(room.id, flows)

		rooms.push(room)

		IOEmitRooms()
		IOSendRoomMessage(
			room.id,
			"ROOM_SUCCESS",
			`#${room.name}# 创建成功，现在可以被连接。`
		)

		console.log("[Room Creation]", room.id, room.name)
	}

	const onRoomJoin = function (this: Socket, payload: RoomJoinInfo) {
		const socket = this
		const user = users.find((u) => u.socketId === socket.id)

		if (!user) return

		const room = rooms.find((r) => r.id === payload.id)
		if (!room) {
			error(socket, "该房间不存在或无法连接。")
			return
		}

		room.users.push(user)
		this.join(room.id)

		if (room.password === payload.password) {
			room.host = user.socketId
			success(socket, "以管理员身份登入房间")
		} else {
			success(socket, "以成员身份登入房间")
		}
		IOEmitRooms()
		IOSendRoomMessage(
			room.id,
			"ROOM_SUCCESS",
			`${user.username} 进入 #${room.name}#`
		)
		io.emit("rooms:join", room)

		console.log("[User Join Room]", room.id, room.name)
	}

	const onRoomLeft = function (this: Socket, id: string, s?: Socket) {
		const socket = s ?? this

		const room = rooms.find((r) => r.id === id)
		if (!room) {
			error(socket, "该房间不存在。")
			return
		}
		const user = room.users.find((u) => u.socketId === socket.id)

		if (!user) {
			error(socket, "不在该房间中，无法退出。")
			return
		}

		room.users = room.users.filter((u) => u.socketId !== user.socketId)
		this.leave(room.id)

		IOEmitRooms()
		IOSendRoomMessage(
			room.id,
			"ROOM_SUCCESS",
			`${user.username} 退出 #${room.name}#`
		)
		socket.emit("rooms:left")

		console.log("[User Left Room]", room.id, room.name)
	}

	const onRoomDestory = function (this: Socket, payload: RoomDestoryInfo) {
		const socket = this

		const room = rooms.find((r) => r.id === payload.id)
		if (!room) {
			error(socket, "该房间不存在。")
			return
		}

		if (room.password !== payload.password) {
			error(socket, "解散房间失败。")
		} else {
			rooms = rooms.filter((r) => r.id !== room.id)
			IOEmitRooms()
			IOSendRoomMessage(room.id, "ROOM_WARNING", `#${room.name}# 被解散。`)
			io.to(room.id).emit("rooms:destory", room)
		}

		console.log("[Room Destory]", room.id, room.name)
	}

	return {
		onRoomCreated,
		onRoomJoin,
		onRoomLeft,
		onRoomDestory,
	}
}
