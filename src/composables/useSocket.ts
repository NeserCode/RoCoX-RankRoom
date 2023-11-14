import { io } from "socket.io-client"
import { useStorage } from "@vueuse/core"
import { nextTick } from "vue"
import { toast } from "vue3-toastify"

import { useConstants } from "./useConstant"
import { useDarkMode } from "../composables/useDarkMode"

const { isDarkMode } = useDarkMode()

import type {
	IORenderFunction,
	IOUserMessage,
	UserRank,
	UserInfo,
	IORoom,
} from "../shared"

const ENV = import.meta.env

const serverPort = ENV.SOCKET_PORT
const serverDomain = ENV.SOCKET_DOMAIN

const serverAddress = `${
	parseInt(ENV.SOCKET_SECURE) ? "wss" : "ws"
}://${serverDomain}:${serverPort}`

const { DefaultUserRank, DefaultRoom } = useConstants()
export const useSocket: () => IORenderFunction = () => {
	const userList = useStorage<UserInfo[]>("rocox-user-list", [])
	const messageList = useStorage<IOUserMessage[]>("rocox-message-list", [])
	const socketId = useStorage<string>("rocox-socket-id", "")
	const username = useStorage<string>("rocox-username", "")
	const userRank = useStorage<UserRank>("rocox-user-rank", DefaultUserRank)
	const room = useStorage<IORoom>("rocox-room", DefaultRoom)
	const roomList = useStorage<IORoom[]>("rocox-room-list", [])
	const IOCreationKey = useStorage<string>("rocox-io-creation-key", "")

	const socketDelay = useStorage<number>("rocox-socket-delay", -1)

	if (username.value === "") username.value = "无名客"

	const socket = io(serverAddress, {
		query: {
			username: username.value,
			userRank: JSON.stringify(userRank.value),
		},
	})

	const initData = () => {
		socketId.value = ""
		userList.value = []
		messageList.value = []
		room.value = DefaultRoom
		roomList.value = []
		socketDelay.value = -1
		IOCreationKey.value = ""
	}

	return {
		initSocket: () => {
			initData()

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

			socket.on("key:creation", (key) => {
				IOCreationKey.value = key
			})

			socket.on("disconnect", () => {
				initData()
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
					const roomNow = roomData.find((r) => r.id === room.value.id)
					if (roomNow) room.value = roomNow
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

			socket.on("rooms:join", (roomData: IORoom) => {
				if (room.value.id === DefaultRoom.id) {
					let u = roomData.users.find((u) => u.socketId === socketId.value)
					if (u) {
						room.value = roomData
					} else return
				}
			})
			socket.on("rooms:left", () => {
				room.value = DefaultRoom
			})
			socket.on("rooms:destory", (roomData: IORoom) => {
				if (roomData.id === room.value.id) room.value = DefaultRoom
				if (roomData.host === socketId.value) return
				toast.error("所在房间已被房主销毁，自动退出房间", {
					theme: isDarkMode.value ? "dark" : "light",
				})
			})

			// rank
			socket.on("rank:update-config", (roomData: IORoom) => {
				room.value = roomData
			})
			socket.on("rank:ready", (data) => {
				console.log(data)
			})
			socket.on("rank:count", (data) => {
				console.log(data)
			})
			socket.on("rank:rank", (data) => {
				console.log(data)
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
		useRank: () => {
			return {
				updateConfig: (config) => {
					socket.emit("rank:config", config)
				},
				nextRound: () => {
					socket.emit("rank:next-round")
				},
				announceReady: () => {
					socket.emit("rank:ready")
				},
			}
		},
	}
}
