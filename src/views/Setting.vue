<script lang="ts" setup>
import UserSetting from "../components/UserSetting.vue"
</script>

<template>
	<div class="setting">
		<UserSetting />
	</div>
</template>

<style lang="postcss" scoped>
.setting {
	@apply w-full h-full flex flex-col justify-center items-center py-12;
}
</style>
