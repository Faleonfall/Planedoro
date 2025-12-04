<template>
  <Planedoro/>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Planedoro from "./components/Planedoro.vue";

export default defineComponent({
  name: "App",
  components: {Planedoro},
});
</script>

<style scoped>
</style>
