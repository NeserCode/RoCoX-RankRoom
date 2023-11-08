import { io } from "socket.io-client"
import { useStorage } from "@vueuse/core"
import { nextTick } from "vue"

import { useConstants } from "./useConstant"

import type {
	IORenderFunction,
	IOMessage,
	UserRank,
	UserInfo,
	IORoom,
} from "../shared"

const ENV = import.meta.env

const isProduction = ENV.NODE_ENV === "production"
const serverPort = isProduction ? ENV.PORT : 3000
const serverDomain = isProduction ? ENV.DOMAIN : "localhost"

const serverAddress = `${
	ENV.SOCKET_SECURE ? "wss" : "ws"
}://${serverDomain}:${serverPort}`

const { DefaultUserRank, DefaultRoom } = useConstants()
export const useSocket: () => IORenderFunction = () => {
	const userList = useStorage<UserInfo[]>("rocox-user-list", [])
	const messageList = useStorage<IOMessage[]>("rocox-message-list", [])
	const socketId = useStorage<string>("rocox-socket-id", "")
	const username = useStorage<string>("rocox-username", "")
	const userRank = useStorage<UserRank>("rocox-user-rank", DefaultUserRank)
	const room = useStorage<IORoom>("rocox-room", DefaultRoom)

	const socketDelay = useStorage<number>("rocox-socket-delay", -1)

	if (username.value === "") username.value = "无名客"

	const socket = io(serverAddress, {
		query: {
			username: username.value,
			userRank: JSON.stringify(userRank.value),
		},
	})

	return {
		initSocket: () => {
			socket.on("connect", () => {
				socketId.value = socket.id
				socket.emit("users:connect", {
					socketId: socketId.value,
					username: username.value,
					userRank: JSON.stringify(userRank.value),
				})
			})

			socket.on("users:update", (data) => {
				userList.value = data
			})

			socket.on("disconnect", () => {
				socketId.value = ""
				userList.value = []
				messageList.value = []
				room.value = DefaultRoom
			})

			socket.on("messages:update", (list) => {
				nextTick(() => {
					messageList.value = list
					socketDelay.value =
						new Date().getTime() -
						messageList.value[messageList.value.length - 1].data.t
				})
			})

			socket.on("rooms:update", (roomData: IORoom) => {
				nextTick(() => {
					room.value = roomData
				})
			})

			socket.on("rooms:error", ({ message }) => {
				console.log(message)
			})

			return socket
		},
		useUsers: () => {
			return {
				updateUsertoServer: (user) => {
					socket.emit("users:update", user)
				},
			}
		},
		useRooms: () => {
			return {
				createRoom: (id, password, name) => {
					socket.emit("rooms:create", {
						id,
						name,
						password,
					})
				},
			}
		},
	}
}
