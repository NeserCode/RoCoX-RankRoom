import { useRankLimit } from "./useRankLimit"
import type { UserRank } from "../shared"

export const useRankActions = (userRankSetting: UserRank) => {
	const { getStarRound, getStandardRound } = useRankLimit()

	return {
		plusStars: () => {
			const { level, standard, stars } = userRankSetting
			const [min, max] = getStarRound(level)
			const [min2, max2] = getStandardRound(level)

			if (stars > max || stars < min || standard > max2 || standard < min2)
				return

			if (stars + 1 <= max) userRankSetting.stars = stars + 1
			else if (standard + 1 <= max2) {
				userRankSetting.standard = standard + 1
				userRankSetting.stars = 0
			} else {
				if (parseInt(level as string) === 5) return
				const [min3, _max3] = getStandardRound(parseInt(level as string) + 1)
				userRankSetting.level = parseInt(level as string) + 1
				userRankSetting.standard = min3
				userRankSetting.stars = 0
			}
		},
		minusStars: () => {
			const { level, standard, stars } = userRankSetting
			const [min, max] = getStarRound(level)
			const [min2, max2] = getStandardRound(level)

			if (stars < min || stars > max || standard < min2 || standard > max2)
				return
			if (stars - 1 >= min) userRankSetting.stars = stars - 1
			else if (standard - 1 >= min2) {
				userRankSetting.standard = standard - 1
				userRankSetting.stars = max
			} else {
				if (parseInt(level as string) === 0) return
				const [_min3, max3] = getStandardRound(parseInt(level as string) - 1)
				const [_min4, max4] = getStarRound(parseInt(level as string) - 1)
				userRankSetting.level = parseInt(level as string) - 1
				userRankSetting.standard = max3
				userRankSetting.stars = max4
			}
		},
	}
}
