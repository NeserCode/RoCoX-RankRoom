import { createServer } from "http"
import { Axios } from "axios"
import { Server } from "socket.io"

import { useUsers } from "./handlers/user"

import type { IOMessage, IORoom, UserInfo } from "./shared"
import { Socket } from "socket.io"

const httpServer = createServer()
const $axios = new Axios({
	baseURL: "https://rocoxdevrankkey--nesercode.repl.co",
	timeout: 10000,
})
const io = new Server(httpServer, {
	cors: {
		origin: "*",
	},
})

const $MessageList: IOMessage[] = []
const $UserList: UserInfo[] = []
const $RoomList: IORoom[] = []

let $CreationKey = ""

const { IOUserJoin, IOUserLeft, UpdateUser } = useUsers(
	io,
	$UserList,
	$MessageList,
	$RoomList
)

io.on("connection", (socket: Socket) => {
	socket.on("users:connect", IOUserJoin)
	socket.on("disconnect", IOUserLeft)
	socket.on("users:update", UpdateUser)

	io.emit("key:creation", $CreationKey)
})

try {
	io.listen(3000)
	$axios
		.get("/key?username=nesercode")
		.then((response) => {
			$CreationKey = response.data
			io.emit("key:creation", $CreationKey)
			console.log("[Got Creation Key]")
		})
		.catch((err) => {
			console.log("[Get Creation Key Fail]", err)
		})
	console.log("Server started on port 3000")
} catch (err) {
	console.error(err)
}
