import {
	IORankBattle,
	IORankQueue,
	IORankState,
	IORankType,
	IOReadyQueue,
	IORoomMessageType,
	IOUserMessageType,
	UserInfo,
} from "../shared"

export const useConstants = () => {
	return {
		NormalUserMessageType: [
			"JOIN_SERVER",
			"LEFT_SERVER",
			"USER_UPDATE",
		] as IOUserMessageType[],
		NormalRoomMessageType: [
			"ROOM_ERROR",
			"ROOM_WARNING",
			"ROOM_SUCCESS",
		] as IORoomMessageType[],
		NormalRankFlowType: [
			"CONFIG",
			"READY",
			"COUNTING",
			"RANKING",
			"FINISHED",
		] as IORankState[],
		TitleMapData: [
			["", "Rocox Rank Room"],
			["home", "房间"],
			["setting", "设置"],
			["about", "关于"],
		] as Iterable<[string, string]>,
		RankTypeMapData: [
			["RANK_NORMAL", "上分赛"],
			["RANK_SHIFT", "补分赛"],
			["RANK_BADGE", "徽章赛"],
			["RANK_CUSTOM", "自定义"],
		] as Iterable<[IORankType, string]>,

		DefaultUserRank: {
			level: 0,
			standard: 0,
			stars: 0,
		},
		DefaultRoom: {
			id: "",
			name: "",
			host: "",
			password: "",
			users: [] as UserInfo[],
			rank: {
				state: "CONFIG" as "CONFIG",
				config: {
					type: "RANK_NORMAL" as "RANK_NORMAL",
					round: {
						round: 10,
						count: 5000,
					},
				},
				runtime: {
					id: "",
					type: "RANK_NORMAL" as "RANK_NORMAL",
					round: {
						round: 0,
						count: 5000,
					},
				},
				battles: [] as IORankBattle[],
			},
			queues: {
				rank: [] as IORankQueue,
				ready: [] as IOReadyQueue,
			},
		},
		DefaultUser: {
			socketId: "id-for-passerby",
			username: "路人",
			userRank: {
				level: 5,
				standard: 0,
				stars: 999,
			},
			battles: [],
			userRankPrefer: "LEVEL",
		} as UserInfo,
	}
}
