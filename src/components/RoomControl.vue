<script lang="ts" setup></script>

<template>
	<div id="room-control">
		<form class="room">
			<input type="text" class="room-name" placeholder="房间编号*" required />
			<input type="password" class="room-key" placeholder="密钥（选填）" />
			<input type="submit" value="加入房间" />
		</form>
	</div>
</template>

<style lang="postcss" scoped>
#room-control {
	@apply w-full h-full flex py-4 px-2;
}

form.room {
	@apply w-full h-full flex flex-wrap gap-2;
}

.room-name {
	@apply w-72;
}
</style>
