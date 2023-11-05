<script lang="ts" setup>
import { onActivated } from "vue"
import { useStorage } from "@vueuse/core"
import { invoke } from "@tauri-apps/api"
import { getTauriVersion, getName, getVersion } from "@tauri-apps/api/app"

const useDev = useStorage("rocox-dev-tools-state", false)
const isFullRound = useStorage("rocox-avatar-rounded", false)
const slideDirection = useStorage(
	"rocox-navigation-transition-direction",
	"slideleft"
)
const $TauriVersion = useStorage("rocox-use-tauri-version", "0.0.0")
const $AppName = useStorage("rocox-application-name", "")
const $AppVersion = useStorage("rocox-application-version", "")

async function getTauriVersionAsync() {
	return await getTauriVersion()
}
async function getAppNameAsync() {
	return await getName()
}
async function getAppVersionAsync() {
	return await getVersion()
}
function toggleAvatarRounded() {
	if (useDev.value) {
		isFullRound.value = true
		invoke("use_devtools")
	} else {
		isFullRound.value = !isFullRound.value
	}
}

onActivated(async () => {
	slideDirection.value = "slideleft"
	$TauriVersion.value = await getTauriVersionAsync()
	$AppName.value = await getAppNameAsync()
	$AppVersion.value = await getAppVersionAsync()
})
</script>

<template>
	<div>
		<div class="avatar-container">
			<img
				src="https://avatars.githubusercontent.com/u/73767966?v=4"
				alt="Author Avatar"
				draggable="false"
				@dblclick="toggleAvatarRounded"
				:class="['avatar', isFullRound ? 'isFullRound' : null]"
				loading="lazy"
			/>
			<span class="author"
				>Code by
				<a draggable="false" target="_blank" href="https://github.com/NeserCode"
					>NeserCode</a
				>
				#
				<a
					draggable="false"
					target="_blank"
					href="https://github.com/NeserCode-Studio"
					>NCS</a
				>
				·
				<a
					draggable="false"
					target="_blank"
					href="https://afdian.net/a/nesercode"
					>支持一下！</a
				>
			</span>
		</div>
		<span class="mt-8 font-black">致谢</span>
		<span class="font-black">·</span>
		<span class="images">
			<img
				draggable="false"
				class="icon"
				src="../assets/tauri.png"
				alt="Tauri Famework"
			/>
			<img
				draggable="false"
				class="icon"
				src="../assets/vue.svg"
				alt="Vue Famework"
			/>
			<img
				draggable="false"
				class="icon"
				src="../assets/vscode.png"
				alt="VSCode Editor"
			/>
			<img
				draggable="false"
				class="icon"
				src="../assets/tailwindcss.png"
				alt="Tailwind Css Famework"
			/>
			<img
				draggable="false"
				class="icon"
				src="../assets/typescript.png"
				alt="TypeScript Language"
			/>
		</span>
		<span class="font-black">·</span>
		<span class="versions">
			<span>{{ $AppName }}@{{ $AppVersion }}</span>
			<span>Tauri@{{ $TauriVersion }}</span>
		</span>
		<span class="warn-massage">
			应用中部分资源来源自网络 <br />
			若这部分资源的使用侵犯了您的权力，请告知 <br />
			·
		</span>
		<span class="right">
			All right reserved by
			<a draggable="false" target="_blank" href="https://github.com/NeserCode"
				>NeserCode</a
			>
		</span>
	</div>
</template>

<style lang="postcss" scoped>
a {
	@apply underline font-black text-green-500;
}
span,
a,
img {
	@apply select-none;
}

.avatar-container {
	@apply w-full flex flex-col justify-center items-center mt-4
	font-semibold;
}

.avatar {
	@apply w-32 h-32 inline-flex justify-center items-center
	rounded-lg shadow-xl transition-all;
}
.avatar.isFullRound {
	@apply rounded-full;
}

.author {
	@apply inline-block py-0.5 mt-4
	text-xs text-center select-none;
}

.api-provide,
.res-provide {
	@apply text-sm font-semibold;
}

.separate {
	@apply block w-12 h-px my-4
	border-t;
}

.images {
	@apply inline-flex justify-center items-center py-2;
}
.images .icon {
	@apply inline-block w-8 h-8 mx-1;
}

.versions {
	@apply inline-flex flex-col items-center justify-center px-2 py-1
	rounded bg-green-200 dark:bg-green-700
	font-mono text-xs transition-all;
}

.warn-massage,
.right {
	@apply fixed inline-block text-center
	text-xs font-black;
}
.warn-massage {
	@apply bottom-8;
}
.right {
	@apply bottom-4;
}
</style>
