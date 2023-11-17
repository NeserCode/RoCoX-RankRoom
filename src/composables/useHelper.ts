import { useRankLimit } from "./useRankLimit"
import type { UserRank } from "../shared"

export const useHelpers = () => {
	const { getStandardRound, getStarRound } = useRankLimit()

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
						console.log(result)
					}
					rs = 0
				} else {
					for (let j = minStandard; rs <= rank.standard; j++) {
						if (j < rank.standard) result += getStarRound(i)[1]
						else {
							result += rank.stars
							break
						}
						console.log(result)
						rs++
					}
				}
			}

			return {
				stars: result,
				hasShell: rank.stars === 0,
			}
		},
	}
}
