<script lang="ts">
  import { onMount } from 'svelte';
  import io, { Socket } from 'socket.io-client';

  // This `data` prop is passed from your +page.server.ts load function
  export let data;
  const { gameId } = data;

  let socket: Socket;
  let users: { name: string, id: string }[] = [];
  let host: { name: string, id: string } | null = null;
  let hasJoined = false;
  let username = '';
  let errorMsg = '';

  onMount(() => {
    socket = io();

    // If the user is the host, they will already be in the room.
    // If they are joining, they will join via the form.
    // We can also have a 'request-lobby-data' for viewers or refreshers.
    socket.on('connect', () => {
        console.log('Connected to socket server. Requesting lobby data...');
        socket.emit('request-lobby-data', gameId);
    });

    // Listen for the full user list (sent on join or on request)
    socket.on('updateUsers', (updatedUsers) => {
      console.log('Received user list:', updatedUsers);
      users = updatedUsers;
      // The host is typically the first user in the list
      if (users.length > 0) {
        host = users[0]; // this is sinning but it works for now
      }
    });

    socket.on('error', (error) => {
      alert(error.message);
    });

    return () => {
      socket.disconnect();
    };
  });

  // Host should not call this function, only other users
  function handleJoinLobby() {
    if (username.trim() && socket) {
      socket.emit('join-lobby', { gameId, username });
      hasJoined = true;
    }
  }
</script>

<svelte:head>
  <title>Game Lobby: {gameId}</title>
</svelte:head>

<div class="lobby-container">
  <h1 class="title">Game Lobby</h1>
  <p>Lobby ID: <strong>{gameId}</strong></p>

  {#if errorMsg}
    <p class="error">Error: {errorMsg}</p>
  {:else}
    {#if !hasJoined}
      <div class="join-form">
        <input
          type="text"
          bind:value={username}
          placeholder="Enter your name"
        />
        <button on:click={handleJoinLobby} disabled={!username.trim()}>
          Join Lobby
        </button>
      </div>
    {/if}

    {#if users.length > 0}
      <div>
        {#if host}
          <!-- <h2>Host: {host.name}</h2> -->
        {/if}
        <h3>Players ({users.length}):</h3>
        <ul>
          {#each users as user (user.id)}
            <li>{user.name} {#if user.name === host?.name}(Host){/if}</li>
          {/each}
        </ul>
      </div>
    {:else if !hasJoined}
        <p>Joining lobby...</p>
    {:else}
        <p>Waiting for players...</p>
    {/if}
  {/if}
</div>

<style>
  .lobby-container {
    text-align: center;
    padding: 2rem;
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    background: linear-gradient(135deg, #232526 0%, #414345 100%);
    min-height: 100vh;
    color: #fff;
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

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  li {
    font-size: 1.1rem;
    margin: 0.5rem 0;
    color: #fff;
  }

  .error {
    color: #ff4d4f;
    font-weight: bold;
    margin-top: 1rem;
  }
</style>
