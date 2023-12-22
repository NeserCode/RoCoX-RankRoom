import { createServer } from "http"
import { Axios } from "axios"
import { Socket, Server } from "socket.io"

import { RankFlow } from "./entity/RankFlow"
import { useRooms } from "./handlers/rooms"
import { useRanks } from "./handlers/rank"
import { useUsers } from "./handlers/user"

import type { IOMessage, IORoom, UserInfo } from "./shared"

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
const $RankFlowList: RankFlow[] = []

let $CreationKey = ""

const { onIOUserJoin, onIOUserLeft, onUpdateUser } = useUsers(
	io,
	$UserList,
	$MessageList,
	$RoomList,
	$RankFlowList
)
const { onRoomCreated, onRoomJoin, onRoomLeft, onRoomDestory } = useRooms(
	io,
	$UserList,
	$MessageList,
	$RoomList,
	$RankFlowList
)
const {
	onUpdateRankConfig,
	onReadyRank,
	onRankRound,
	onBattleEmit,
	onBattleReply,
} = useRanks(io, $UserList, $MessageList, $RoomList, $RankFlowList)

io.on("connection", (socket: Socket) => {
	// Users
	socket.on("users:update", onUpdateUser)
	socket.on("users:connect", onIOUserJoin)
	socket.on("disconnect", onIOUserLeft)

	// Rooms
	socket.on("rooms:create", onRoomCreated)
	socket.on("rooms:join", onRoomJoin)
	socket.on("rooms:left", onRoomLeft)
	socket.on("rooms:destory", onRoomDestory)

	// Rank
	socket.on("rank:config", onUpdateRankConfig)
	socket.on("rank:ready", onReadyRank)
	socket.on("rank:next-round", onRankRound)
	socket.on("rank:battle-emit", onBattleEmit)
	socket.on("rank:battle-reply", onBattleReply)

	io.emit("key:creation", $CreationKey)
})

try {
	$axios
		.get("/key?username=nesercode")
		.then((response) => {
			io.listen(3000)
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
