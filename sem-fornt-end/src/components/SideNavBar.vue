<template>
    <v-navigation-drawer app width="200">
        <v-list density="compact"
          nav>

          <v-list-item link to="/chat" title="Smart Agent" append-icon="mdi mdi-face-agent" ></v-list-item>
        <v-list-item link to="/dashboard" title="Dashboard" append-icon="mdi mdi-monitor-dashboard" ></v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts" setup>
// No additional setup needed for this simple component
</script>

<style scoped>

</style>
