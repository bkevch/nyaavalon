<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import io, { Socket } from 'socket.io-client';

  const enterYourNamePlaceholder = 'enter your nyame';
  const createLobbyButtonText = 'cweate wobby';

  let socket: Socket;
  let hostName = '';
  let hasJoined = true;

  onMount(() => {
    socket = io();

    socket.on('gameCreated', (data) => {
      if (data.gameId) {
        console.log(`Server created room, navigating to: /game/${data.gameId}`);
        // Use goto to perform client-side navigation
        goto(`/game/${data.gameId}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  });

  // Only host can create a lobby
  function createLobby() {
    if (hostName.trim() && socket) {
      socket.emit('create-game', { hostName });
    }
  }
</script>

<main>
  <h1 class="title">nyaavalon</h1>
  <div>
    <input type="text" bind:value={hostName} placeholder={enterYourNamePlaceholder} />
  </div>
  <div>
    <button on:click={createLobby} disabled={!hostName.trim()}>{createLobbyButtonText}</button>
  </div>  
</main>

<style>
  main {
    text-align: center;
    padding: 2rem;
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    background: linear-gradient(135deg, #232526 0%, #414345 100%);
    min-height: 100vh;
  }

  .title {
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #fff;
    text-shadow:
      0 2px 8px rgba(0,0,0,0.3),
      0 1px 0 #007bff,
      0 0px 40px #007bff44;
    margin-bottom: 2rem;
    margin-top: 0.5em;
    background: linear-gradient(90deg, #007bff 30%, #00c6ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  input[type="text"] {
    font-size: 1.2rem;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    border: 1px solid #007bff;
    margin-bottom: 1.5rem;
    width: 250px;
    max-width: 90vw;
    outline: none;
    transition: border-color 0.2s;
  }

  input[type="text"]:focus {
    border-color: #00c6ff;
    box-shadow: 0 0 0 2px #00c6ff33;
  }

  button {
    font-size: 1.2rem;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px #007bff33;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
    box-shadow: 0 4px 16px #007bff44;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    box-shadow: none;
  }

</style>