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

		io.to(room.id).emit("rank:ready", room)
		IOSendRankMessage(room.id, "READY")
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
		})
		room.rank.runtime = $rankflow.runtime
		room.rank.state = $rankflow.state
		io.to(room.id).emit("rank:count", room)
		IOSendRankMessage(room.id, "COUNTING")
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
	}

	return {
		initRankFlow,
		onUpdateRankConfig,
		onReadyRank,
		onRankRound,
		onBattleEmit,
		onBattleReply,
	}
}
