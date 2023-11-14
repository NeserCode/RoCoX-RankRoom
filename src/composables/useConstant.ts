import { IORankBattle, IORankState, UserInfo } from "../shared"

export const useConstants = () => {
	return {
		NormalMessageType: ["JOIN_SERVER", "LEFT_SERVER", "USER_UPDATE"],
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
		],

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
						round: 10,
						count: 5000,
					},
				},
				battles: [] as IORankBattle[],
			},
		},
	}
}
