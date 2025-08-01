<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import io, { Socket } from 'socket.io-client';

  let socket: Socket;
  let hostName = '';

  onMount(() => {
    socket = io();

    socket.on('gameCreated', ({ gameId }) => {
      goto(`/game/${gameId}`);
    });

    return () => {
      socket.disconnect();
    };
  });

  // Only host can create a lobby
  function createLobby() {
    if (hostName) {
      socket.emit('create-game', { hostName });
    }
  }
</script>

<main>
  <h1>Create a Lobby</h1>
  <input type="text" bind:value={hostName} placeholder="Enter your name" />
  <button class="bottom-button" on:click={createLobby} disabled={!hostName}>Create Lobby</button>
</main>

<style>
  main {
    text-align: center;
    padding: 2rem;
    font-family: sans-serif;
  }

  button {
    font-size: 1.2rem;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .bottom-button {
    position: fixed;
    left: 50%;
    bottom: 2rem;
    transform: translateX(-50%);
    z-index: 100;
    width: max-content;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

</style>