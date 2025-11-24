<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div>
    <h3>
      {{ msg }}
    </h3>
  </div>
</template>
