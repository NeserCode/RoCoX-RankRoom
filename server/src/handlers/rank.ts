import { useMessages } from "./message"

import type { Server, Socket } from "socket.io"
import type {
	IOMessage,
	IORankBattleEmitInfo,
	IORankConfig,
	IORankState,
	IORankType,
	IORoom,
	UserInfo,
} from "../shared"
import { RankFlow } from "../entity/RankFlow"

export const useRanks = (
	io: Server,
	users: UserInfo[],
	messages: IOMessage[],
	rooms: IORoom[],
	flows: RankFlow[]
) => {
	const { IOSendMessage } = useMessages(io, messages)
	let $rankflow: RankFlow | null = null

	const IOSendRankMessage = (roomId: string, type: IORankState) => {
		if (!$rankflow) return

		IOSendMessage(
			{
				type,
				config: $rankflow.config,
				runtime: JSON.parse(JSON.stringify($rankflow.runtime)),
				t: new Date().getTime(),
				roomId,
			},
			roomId
		)
	}

	const IOEmitRooms = function () {
		io.emit("rooms:update", rooms)
	}

	const initRankFlow = (roomId: string, rankflows: RankFlow[]) => {
		const rf = rankflows.find((f) => f.roomId === roomId)
		if (!rf) {
			$rankflow = new RankFlow(roomId)
			flows.push($rankflow)

			console.log("[Flow New]", roomId)
		} else $rankflow = rf
	}

	const onUpdateRankConfig = function (this: Socket, config: IORankConfig) {
		const socket = this

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (!room) return

		initRankFlow(room.id, flows)

		$rankflow!.updateConfig(room.id, config)
		room.rank.config = config
		room.rank.runtime = $rankflow!.runtime
		room.rank.state = $rankflow!.state

		io.to(room.id).emit("rank:update-config", room)
		IOSendRankMessage(room.id, "CONFIG")
		console.log("[Flow Config]", room.id)
	}

	const onReadyRank = function (this: Socket) {
		if (!$rankflow) return
		const socket = this

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (!room) return

		$rankflow.ready()
		room.rank.runtime = $rankflow.runtime
		room.rank.state = $rankflow.state
		room.queues.ready = []

		IOEmitRooms()
		io.to(room.id).emit("rank:ready", room)
		IOSendRankMessage(room.id, "READY")
		console.log(
			`[Flow Ready ${room.queues.ready.length}/${room.users.length}]`,
			room.id
		)
	}

	const onReadyRankReply = function (this: Socket) {
		if (!$rankflow) return
		const socket = this

		const user = users.find((u) => u.socketId === socket.id)
		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)

		if (!room || !user) return
		const existingUser = room.queues.ready.find((u) => u.socketId === socket.id)
		if (existingUser) return

		room.queues.ready.push(user)
		IOEmitRooms()
		console.log(
			`[Flow Ready ${room.queues.ready.length}/${room.users.length}]`,
			room.id
		)
	}

	const onRankRound = function (this: Socket) {
		if (!$rankflow) return
		const socket = this

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (!room) return

		$rankflow.round(() => {
			if (!$rankflow) return

			room.rank.runtime = $rankflow.runtime
			room.rank.state = $rankflow.state
			io.to(room.id).emit("rank:rank", room)
			IOSendRankMessage(room.id, "RANKING")

			console.log(
				`[Flow Round ${room.rank.runtime.round.round} Ranking]`,
				room.id
			)
		})
		room.rank.runtime = $rankflow.runtime
		room.rank.state = $rankflow.state
		io.to(room.id).emit("rank:count", room)
		IOSendRankMessage(room.id, "COUNTING")

		console.log(
			`[Flow Round ${room.rank.runtime.round.round} Counting ${room.rank.config.round.count}]`,
			room.id
		)
	}

	const onBattleEmit = function (this: Socket, info: IORankBattleEmitInfo) {
		if (!$rankflow) return
		const socket = this

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (!room) return

		const { self, opponent } = info
		io.to(room.id).emit("rank:battle-emit", info)
	}

	const onBattleReply = function (this: Socket, info: IORankBattleEmitInfo) {
		if (!$rankflow) return
		const socket = this

		const room = rooms.find((r) =>
			r.users.some((u) => u.socketId === socket.id)
		)
		if (!room) return

		const { self, opponent } = info
		io.to(room.id).emit("rank:battle-reply", info)

		console.log(
			`[Flow Battle Ensured]`,
			room.id,
			`${self.username} VS ${opponent.username}`
		)
	}

	return {
		initRankFlow,
		onUpdateRankConfig,
		onReadyRank,
		onRankRound,
		onReadyRankReply,
		onBattleEmit,
		onBattleReply,
	}
}
