<script lang="ts" setup></script>

<template>
	<div id="room-control">
		<form class="room">
			<input type="text" class="room-name" placeholder="房间编号*" required />
			<input type="password" class="room-name" placeholder="密钥（选填）" />
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

input[type="text"],
input[type="password"] {
	@apply inline-flex items-center py-1 px-2
  text-base font-bold
  border-2 border-gray-300 dark:border-gray-500 caret-slate-400
  bg-slate-100 dark:bg-slate-600
  focus:ring-2 focus:border-green-300 dark:focus:border-green-500 ring-green-300 dark:ring-green-500
  outline-none shadow-lg transition-all rounded
	selection:bg-green-400 selection:dark:bg-green-600;
}
input[type="text"]::placeholder,
input[type="password"]::placeholder {
	@apply select-none transition-all;
}

input[type="submit"] {
	@apply inline-flex items-center py-1 px-2
  text-base font-bold
  border-2 border-gray-300 dark:border-gray-500 caret-slate-400
  bg-slate-100 dark:bg-slate-600
  focus:ring-2 focus:border-green-300 dark:focus:border-green-500 ring-green-300 dark:ring-green-500
  outline-none shadow-lg transition-all rounded;
}

.room-name {
	@apply w-72;
}
</style>
