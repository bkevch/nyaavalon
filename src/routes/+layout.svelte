<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { socketStore, type ISocket } from '$lib/socketClient';
  import { io } from 'socket.io-client';

  onMount(() => {
    const socket: ISocket = io({ autoConnect: false });
    // check if we already had a session.
    const sessionID = localStorage.getItem("sessionID");    
    if (sessionID) {
      // move the client side sessionID storage to layout?
      // usernameAlreadySelected = true;
      // socketStore.auth = { sessionID };
      // socketStore.connect();
    }


    // when the username is decided, we should connect the socket.
    // socketStore.connect();

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
