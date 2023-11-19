<script lang="ts" setup>
import { useStorage } from "@vueuse/core"

import { useHelpers } from "../composables/useHelper"
import { rawDatatoObject } from "../composables/utils"
import { useConstants } from "../composables/useConstant"

import type { UserRank } from "../shared"

const { DefaultUserRank, DefaultUser } = useConstants()

const selectedUser = useStorage("rocox-rank-selected-user", DefaultUser)
const userRank = useStorage<UserRank>("rocox-user-rank", DefaultUserRank)

const { translateRankStars, compareRank } = useHelpers()
</script>

<template>
	<div class="rank-helper">
		选定 {{ selectedUser.username }}
		{{ translateRankStars(rawDatatoObject(selectedUser.userRank)) }}
		你与其相距
		{{ compareRank(userRank, rawDatatoObject(selectedUser.userRank)) }} 星
	</div>
</template>

<style lang="postcss" scoped></style>
