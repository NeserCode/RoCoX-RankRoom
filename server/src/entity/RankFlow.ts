import { IORankConfig, IORankRuntime, IORankState } from "../shared"

export class RankFlow {
	private $flowState: IORankState
	private $roomId: string
	private $config: IORankConfig
	private $runtime: IORankRuntime
	private $timer: NodeJS.Timeout | null = null

	constructor(roomId?: string) {
		this.$roomId = roomId ?? ""
		this.$config = {
			type: "RANK_NORMAL",
			round: {
				round: 10,
				count: 10000,
			},
		}
		this.$runtime = {
			id: "",
			type: "RANK_NORMAL",
			round: {
				round: 0,
				count: 0,
			},
		}
		this.$flowState = "CONFIG"
		this.$timer = null
	}

	get roomId() {
		return this.$roomId
	}
	get config() {
		return this.$config
	}
	get runtime() {
		return this.$runtime
	}
	get state() {
		return this.$flowState
	}

	public updateConfig(roomId: string, config: IORankConfig) {
		this.$roomId = roomId
		this.$config = config
		this.$runtime = {
			id: roomId,
			type: config.type,
			round: {
				round: 0,
				count: 0,
			},
		}
	}

	public ready() {
		const vaildState = ["CONFIG", "RANKING"]
		if (!vaildState.includes(this.$flowState)) return

		this.$flowState = "READY"
		clearTimeout(this.$timer!)
		this.$timer = null
		this.$runtime.round.round++
		this.$runtime.round.count = this.$config.round.count
	}

	public round(callback: () => void) {
		if (this.$flowState !== "READY") return

		this.$flowState = "COUNTING"
		this.$timer = setTimeout(() => {
			this.$flowState = "RANKING"

			callback && callback()
			clearTimeout(this.$timer!)
			this.$timer = null
		}, this.$config.round.count)
	}
}
