export const useRankLimit = () => {
	return {
		getStandardRound: (level: string | number) => {
			switch (parseInt(level as string)) {
				case 0:
					return [1, 3]
				case 1:
					return [1, 3]
				case 2:
					return [1, 4]
				case 3:
					return [1, 4]
				case 4:
					return [1, 5]
				case 5:
					return [0, 0]
				default:
					return [0, 0]
			}
		},
		getStarRound: (level: string | number) => {
			switch (parseInt(level as string)) {
				case 0:
					return [0, 3]
				case 1:
					return [0, 3]
				case 2:
					return [0, 3]
				case 3:
					return [0, 4]
				case 4:
					return [0, 4]
				case 5:
					return [0, 999]
				default:
					return [0, 0]
			}
		},
	}
}
