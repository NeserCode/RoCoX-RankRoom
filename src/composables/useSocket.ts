import { io } from "socket.io-client"
import { useStorage } from "@vueuse/core"
import { nextTick } from "vue"
import { toast } from "vue3-toastify"

import { useConstants } from "./useConstant"
import { useDarkMode } from "../composables/useDarkMode"

const { isDarkMode } = useDarkMode()

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
	const roomList = useStorage<IORoom[]>("rocox-room-list", [])

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
				roomList.value = []
			})

			socket.on("messages:update", (list) => {
				nextTick(() => {
					messageList.value = list
					socketDelay.value =
						new Date().getTime() -
						messageList.value[messageList.value.length - 1].t
				})
			})

			socket.on("rooms:update", (roomData: IORoom[]) => {
				nextTick(() => {
					roomList.value = roomData
				})
			})

			socket.on("rooms:success", (data) => {
				console.log(data)
				toast.success(data.data.message, {
					theme: isDarkMode.value ? "dark" : "light",
				})
			})
			socket.on("rooms:error", (data) => {
				console.log(data)
				toast.error(data.data.message, {
					theme: isDarkMode.value ? "dark" : "light",
				})
			})
			socket.on("rooms:warning", (data) => {
				console.log(data)
				toast.warning(data.data.message, {
					theme: isDarkMode.value ? "dark" : "light",
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
		useRooms: () => {
			return {
				createRoom: (id, password, name) => {
					socket.emit("rooms:create", {
						id,
						name,
						password,
					})
				},
				joinRoom: (id, password) => {
					socket.emit("rooms:join", {
						id,
						password,
					})
				},
				leftRoom: (id) => {
					socket.emit("rooms:left", id)
				},
				destoryRoom: (id, password) => {
					socket.emit("rooms:destory", { id, password })
				},
			}
		},
	}
}
