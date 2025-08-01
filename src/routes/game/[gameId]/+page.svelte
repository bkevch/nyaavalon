<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import io from 'socket.io-client';

  /**
     * @type {import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>}
     */
  let socket;
  /** @type {{ name: string }[]} */
  let users = [];
  let lobbyId = page.params.gameId || '';
  let userName = '';
  let hasJoined = false;

  onMount(() => {
    socket = io();

    socket.on('connect', () => {
      console.log('connected to server');
    });

    socket.on('updateUsers', (updatedUsers) => {
      users = updatedUsers;
    });

    socket.on('error', (error) => {
      alert(error.message);
    });

    return () => {
      socket.disconnect();
    };
  });

  function joinLobby() {
    if (userName) {
      socket.emit('joinLobby', { lobbyId, userName });
      hasJoined = true;
    }
  }
</script>

<h1>Lobby: {lobbyId}</h1>

{#if !hasJoined}
  <input type="text" bind:value={userName} placeholder="Enter your name" />
  <button on:click={joinLobby}>Join Lobby</button>
{:else}
  <h2>Users in lobby: {users.length}</h2>
  <ul>
    {#each users as user}
      <li>{user.name}</li>
    {/each}
  </ul>
{/if}



<!-- src/routes/game/[gameId]/+page.svelte
<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import io, { type Socket } from 'socket.io-client';
  // Import our shared type!
  import type { Game, Player } from '$lib/types'; 

  // Define the event types for the client-side socket
  // This should match the server-side definition for full type safety
  interface ServerToClientEvents {
    // 'update-lobby': (players: Player[]) => void;
    'game-created': (gameId: string) => void;
  }
  interface ClientToServerEvents {
    'join-game': (gameId: string) => void;
    'create-game': (hostName: string) => void;
  }

  let socket;
  let players = [];

  let gameId: string = page.params.gameId ?? ''; // just to get rid of the error, complains about it being possibly undefined
  
  let myPlayerId: string | null = null;
  let playerName: string = '';
  let hasJoined: boolean = false;
  let players: Player[] = []; // This array is now strongly typed


  onMount(() => {
    socket = io();

    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
    });

  });

  async function joinGame() {
    if (!playerName.trim()) return;

    const response = await fetch('/api/join-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, playerName })
    });

    const result = await response.json();

    if (response.ok) {
      myPlayerId = result.playerId;
      hasJoined = true;
    } else {
      alert(`Error: ${result.error}`);
    }
  }
</script>

The HTML part of the component remains exactly the same.
<main>
    <h1>Avalon Lobby</h1>
    <p>Game ID: <strong>{gameId}</strong></p>
    <button on:click={() => {
        playerName = 'Guest' + Math.floor(Math.random() * 1000);
        joinGame();
    }}>
        Quick Join as Guest
    </button>
    {#if !hasJoined}
        <div class="join-form">
            <input type="text" bind:value={playerName} placeholder="Enter your name" />
            <button on:click={joinGame}>Join Game</button>
        </div>

    {:else}
        <h2>Players in Lobby: {players.length}</h2>
        <p>Your name: <strong>{players.find(p => p.id === myPlayerId)?.name || ''}</strong></p>

        <ul class="player-list">
            {#each players as player (player.id)}
                <li>
                    <span>{player.name}</span>
                    <div class="controls">
                        {#if player.id === myPlayerId}
                            <button on:click={() => changeName(player.id)}>
                                Edit
                            </button>
                        {/if}
                        <button on:click={() => movePlayer(player.id, 'up')}>▲</button>
                        <button on:click={() => movePlayer(player.id, 'down')}>▼</button>
                    </div>
                </li>
            {/each}
        </ul>
        <button class="start-game-btn">Start Game (Host Only)</button>
          {#if hasJoined && gameId}
    <div class="game-link-container">
      <h2>Your Game Room is Ready!</h2>
      <p>Share this link with your friends:</p>
      <div class="link-box">
        <input type="text" value="{window.location.origin}/game/{gameId}" readonly />
        <button on:click={copyLink}>{copyButtonText}</button>
      </div>
      <p><strong>You are the host. </strong></p>
    </div>
  {/if}
    {/if}
</main> -->

<!-- Styles remain the same -->
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

  button:hover {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .game-link-container {
    margin-top: 2rem;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .link-box {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .link-box input {
    font-size: 1rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 300px;
    background-color: #fff;
  }
</style>
