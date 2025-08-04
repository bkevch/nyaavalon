<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { socketStore } from '$lib/socket-store';

  onMount(() => {
    // Initialize the socket connection when the app starts
    socketStore.connect();

    // Cleanup on app exit (optional)
    return () => {
      // Usually you don't want to disconnect on page navigation,
      // only when the user closes the entire app
    };
  });
</script>

<main>
  <slot />
</main>

<style>
  /* Your app-wide styles */
  main {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
</style>
