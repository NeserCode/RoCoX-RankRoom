import { useRankLimit } from "./useRankLimit"
import type { IORankBattle, UserInfo, UserRank } from "../shared"

export const useHelpers = () => {
	const { getStandardRound, getStarRound } = useRankLimit()

	const checkIsBattleWon = (battle: IORankBattle, user: UserInfo) => {
		return battle.winer?.socketId === user.socketId
	}
	return {
		translateRankStars: (rank: UserRank) => {
			let result = 0
			let rl = 0
			let rs = 0
			const level = parseInt(rank.level as string)
			for (let i = 0; rl <= level; i++, rl++) {
				let [minStandard, maxStandard] = getStandardRound(i)

				if (rl < level) {
					for (let j = minStandard; j <= maxStandard; j++) {
						result += getStarRound(i)[1]
					}
					rs = 0
				} else {
					for (let j = minStandard; rs <= rank.standard; j++) {
						if (j < rank.standard) result += getStarRound(i)[1]
						else {
							result += rank.stars
							break
						}
						rs++
					}
				}
			}

			return {
				stars: result,
				hasShell: rank.stars === 0,
			}
		},
		compareRank: (a: UserRank, b: UserRank) => {
			const aRank = useHelpers().translateRankStars(a)
			const bRank = useHelpers().translateRankStars(b)

			if (aRank.stars === bRank.stars) {
				if (aRank.hasShell && !bRank.hasShell) return 1
				if (!aRank.hasShell && bRank.hasShell) return -1
				return 0
			}

			return aRank.stars - bRank.stars
		},
		generateRankCase: (user: UserInfo) => {
			let wins = 0
			let losses = 0
			let counter = 1
			let bs = user.battles!
			if (!bs || bs.length < 1 || !Array.isArray(bs)) return
			console.log(user, bs)

			while (checkIsBattleWon(bs[bs.length - counter], user)) {
				wins++
				counter++
				if (bs.length - counter < 0) {
					counter = 1
					break
				}
			}
			if (wins !== 0) return { wins, losses }

			while (!checkIsBattleWon(bs[bs.length - counter], user)) {
				losses++
				counter++
				if (bs.length - counter < 0) break
			}
		},
	}
}
