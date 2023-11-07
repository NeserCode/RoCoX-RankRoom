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
}

export interface IOMessageData {
	type: "JOIN_SERVER" | "LEFT_SERVER" | "USER_UPDATE"
	user: UserInfo
	t: number
}

export interface IOMessage {
	data: IOMessageData
	io: { id: string }
	state: IOState
}

export interface UserListItemProps {
	socketId: string
	username: string
	userRank: UserRank
	rankVisable: boolean
}

export interface IORenderUserFunction {
	updateUsertoServer: (u: UserInfo) => void
}

export interface IORenderFunction {
	initSocket: () => Socket
	useUsers: () => IORenderUserFunction
}
