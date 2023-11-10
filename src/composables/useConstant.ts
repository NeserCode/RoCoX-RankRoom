import { IORankBattle, UserInfo } from "../shared"

export const useConstants = () => {
	return {
		NormalMessageType: ["JOIN_SERVER", "LEFT_SERVER", "USER_UPDATE"],
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
				state: "RANK_READY" as "RANK_READY",
				battles: [] as IORankBattle[],
			},
		},
	}
}
