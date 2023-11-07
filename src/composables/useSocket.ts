import { io } from "socket.io-client"
import { useStorage } from "@vueuse/core"
import { nextTick } from "vue"

import type { IORenderFunction } from "../shared"

const ENV = import.meta.env

const isProduction = ENV.NODE_ENV === "production"
const serverPort = isProduction ? ENV.PORT : 3000
const serverDomain = isProduction ? ENV.DOMAIN : "localhost"

const serverAddress = `${
	ENV.SOCKET_SECURE ? "wss" : "ws"
}://${serverDomain}:${serverPort}`

export const useSocket: () => IORenderFunction = () => {
	const userList = useStorage("rocox-user-list", [])
	const messageList = useStorage("rocox-message-list", [])
	const socketId = useStorage("rocox-socket-id", "")
	const username = useStorage("rocox-username", "")
	const userRank = useStorage("rocox-user-rank", {})

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
				console.log("userList", userList.value)
			})

			socket.on("disconnect", () => {
				socketId.value = ""
				userList.value = []
				messageList.value = []
			})

			socket.on("messages:update", (list) => {
				nextTick(() => {
					messageList.value = list
				})
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
	}
}
