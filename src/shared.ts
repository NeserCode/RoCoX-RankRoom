import { Socket } from "socket.io-client"

export interface UIToggleProps {
	enabled?: boolean
	disabled?: boolean
}

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

export interface UserInfo {
	socketId: string
	username: string
	userRank: StoragedUserRank
	userRankPrefer?: "LEVEL" | "BADGE"
}

export interface IOMessageData {
	user: UserInfo
}

export interface IOMessage {
	data: IOMessageData
	type: "JOIN_SERVER" | "LEFT_SERVER" | "USER_UPDATE"
	io: { id: string }
	state: IOState
	t: number
}

export interface UserListItemProps extends UserInfo {
	rankVisable: boolean
}

export interface IORenderUserFunction {
	updateUsertoServer: (u: UserInfo) => void
}

export interface IORenderRoomFunction {
	createRoom: (id: string, password: string, name: string) => void
	joinRoom: (id: string, password?: string) => void
	leftRoom: (id: string) => void
	destoryRoom: (id: string, password: string) => void
}

export interface IORenderFunction {
	initSocket: () => Socket
	useUsers: () => IORenderUserFunction
	useRooms: () => IORenderRoomFunction
}

export type IORankState = "RANK_READY" | "RANK_RUNNING" | "RANK_FINISHED"
export type IORankBattleState = "BATTLE_SUCCESS" | "BATTLE_FAIL"
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
	battles: IORankBattle[]
}

export interface IORoom {
	id: string
	name: string
	host: string
	password: string
	users: UserInfo[]
	rank: IORank
}

export interface RoomMessage {
	roomId: string
	type: "ROOM_ERROR" | "ROOM_WARNING" | "ROOM_SUCCESS"
	data: {
		message?: string
	}
	t: number
}
