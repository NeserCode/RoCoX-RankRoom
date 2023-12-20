import { Socket } from "socket.io-client"

export interface IOState {
	connected: boolean
	disconnected: boolean
}
export interface SocketRenderStateProps {
	id: string
	connected: boolean
}
export interface SocketRenderState extends SocketRenderStateProps {
	io: Socket | undefined
}

export interface UserRank {
	level: number | string
	standard: number
	stars: number
}
export type StoragedUserRank = string | UserRank

export type UserRankPreferType = "LEVEL" | "BADGE"
export interface UserInfo {
	socketId: string
	username: string
	userRank: StoragedUserRank
	userRankPrefer?: UserRankPreferType
	battles?: IORankBattle[]
}

export type IORankState =
	| "CONFIG"
	| "READY"
	| "COUNTING"
	| "RANKING"
	| "FINISHED"
export type IORankBattleState = "BATTLE_SUCCESS" | "BATTLE_FAIL"
export type IORankType =
	| "RANK_NORMAL"
	| "RANK_SHIFT"
	| "RANK_BADGE"
	| "RANK_CUSTOM"
export interface IORankConfig {
	type: IORankType
	round: {
		round: number
		count: number
	}
}
export interface IORankRuntime extends IORankConfig {
	id: string
}
export interface IORankBattleDiff {
	winStar: number
	loseStar: number
}
export interface IORankBattle {
	winer: UserInfo | null
	loser: UserInfo | null
	state: IORankBattleState
	t: number
	diff: IORankBattleDiff
}
export interface IORank {
	state: IORankState
	config: IORankConfig
	runtime: IORankRuntime
	battles: IORankBattle[]
}
export interface IORankMessage {
	type: IORankState
	roomId: string
	config: IORankConfig
	runtime: IORankRuntime
	t: number
}

export interface IORoom {
	id: string
	name: string
	host: string
	password: string
	users: UserInfo[]
	rank: IORank
	queues: IOQueues
}

export type IORoomMessageType = "ROOM_ERROR" | "ROOM_WARNING" | "ROOM_SUCCESS"
export interface IORoomMessage {
	roomId: string
	type: IORoomMessageType
	data: {
		message?: string
	}
	t: number
}

export type IOUserMessageType = "JOIN_SERVER" | "LEFT_SERVER" | "USER_UPDATE"
export interface IOUserMessage {
	data: {
		user: UserInfo
	}
	type: IOUserMessageType
	io: { id: string }
	state: IOState
	t: number
}

export type IOMessage = IOUserMessage | IORoomMessage | IORankMessage

export type IORankQueue = UserInfo[]
export type IOReadyQueue = UserInfo[]
export interface IOQueues {
	rank: IORankQueue
	ready: IOReadyQueue
}
