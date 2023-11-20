import { nextTick } from "vue"
import type { UserRank } from "../shared"

export const rawDatatoObject: <T>(data: any) => T = (data: any) => {
	if (typeof data !== "string") return JSON.parse(JSON.stringify(data))
	else return JSON.parse(data)
}

export const computedRanktoText = (rankData: UserRank) => {
	const { level, standard, stars } = rankData
	const levelText =
		Number(level) == 0
			? "学徒魔法师"
			: level == 1
			? "初级魔法师"
			: level == 2
			? "中级魔法师"
			: level == 3
			? "高级魔法师"
			: level == 4
			? "魔导士"
			: "圣魔导师"
	let standardText = "~"

	switch (Number(standard)) {
		case 1:
			standardText = "I"
			break
		case 2:
			standardText = "II"
			break
		case 3:
			standardText = "III"
			break
		case 4:
			standardText = "IV"
			break
		case 5:
			standardText = "V"
			break
		default:
			standardText = "~"
			break
	}

	return `${levelText} · ${standardText} · ${stars}星`
}

export const tickTask = (fn: () => void, times: number) => {
	let innerTimes = 0

	while (innerTimes < times) {
		nextTick(() => {
			fn()
		})
		innerTimes++
	}
}
