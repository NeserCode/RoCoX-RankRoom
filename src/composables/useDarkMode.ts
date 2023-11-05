import { useDark, useToggle } from "@vueuse/core"

export function useDarkMode() {
	const isDarkMode = useDark({
		storageKey: "rocox-color-scheme",
		disableTransition: false,
	})
	const toggleDarkMode = useToggle(isDarkMode)

	return {
		isDarkMode,
		toggleDarkMode,
	}
}
