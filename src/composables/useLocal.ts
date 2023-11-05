import { nextTick } from "vue"
import { appWindow } from "@tauri-apps/api/window"

import sha256 from "crypto-js/sha256"
import { HmacSHA512 } from "crypto-js"
import Base64 from "crypto-js/enc-base64"

const $DevCryptKey =
	"nddJSzDQsPR3nZILuEDmi6/6ec84f/SPY0lTtWVJY5b1yEpaFhwSzw/65KHbtI+mR+kM8w8C3VxAi4vul0hshA=="

export function nextTickToShow() {
	nextTick(async () => {
		await appWindow.show()
		await appWindow.setFocus()
	})
}

export function useDeCryptKey(salt: string, password: string) {
	// return Base64.stringify(HmacSHA512(sha256(password), salt)) // use in dev, product use below
	return (
		$DevCryptKey ===
		Base64.stringify(HmacSHA512(sha256(password), salt)).toString()
	)
}
