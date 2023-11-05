import { io } from "socket.io-client"
import { useStorage } from "@vueuse/core"

const ENV = import.meta.env

const isProduction = ENV.NODE_ENV === "production"
const serverPort = isProduction ? ENV.PORT : 3000
const serverDomain = isProduction ? ENV.DOMAIN : "localhost"

const serverAddress = `${
	ENV.SOCKET_SECURE ? "wss" : "ws"
}://${serverDomain}:${serverPort}`

export const useSocket = () => {
	return {
		initSocket: () => {
			const list = useStorage("rocox-user-list", [])
			const socketId = useStorage("rocox-socket-id", "")
			const username = useStorage("rocox-username", "")
			const userRank = useStorage("rocox-user-rank", {})

			const socket = io(serverAddress, {
				query: {
					username: username.value,
					userRank: JSON.stringify(userRank.value),
				},
			})

			socket.on("connection", ({ id, users }) => {
				socketId.value = id
				list.value = users
			})

			return socket
		},
	}
}
