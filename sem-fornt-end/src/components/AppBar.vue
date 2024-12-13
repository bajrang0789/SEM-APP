<template>
  <v-app-bar flat height="40" class="bg-color">
    <template #prepend>
      <v-img class="ml-3" aspectRatio="1/1" width="30" src="../assets/SEM-favicon.svg"></v-img>
  </template>
    <v-app-bar-title class="text-white pr-2">
      Smart Expense Manager
    </v-app-bar-title>
  </v-app-bar>
</template>

<script lang="ts" setup>
//
</script>
<style scoped>
.bg-color {
background: linear-gradient(to left, #78ffd6, #007991) !important;
}

</style>