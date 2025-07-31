<!-- src/routes/game/[gameId]/+page.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import io, { type Socket } from 'socket.io-client';
    // Import our shared type!
    import type { Player } from '$lib/types'; 

    // Define the event types for the client-side socket
    // This should match the server-side definition for full type safety
    interface ServerToClientEvents {
        'update-lobby': (players: Player[]) => void;
    }
    interface ClientToServerEvents {
        'join-room': (gameId: string) => void;
    }

    const gameId = $page.params.gameId;
    
    let myPlayerId: string | null = null;
    let playerName: string = '';
    let hasJoined: boolean = false;
    let players: Player[] = []; // This array is now strongly typed
    let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    onMount(() => {
        socket = io();

        socket.emit('join-room', gameId);

        // The `updatedPlayers` parameter is now known to be `Player[]`
        socket.on('update-lobby', (updatedPlayers) => {
            players = updatedPlayers;
        });

        return () => {
            socket.disconnect();
        };
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

    // Parameters are now typed
    async function movePlayer(playerId: string, direction: 'up' | 'down') {
        await fetch('/api/move-player', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, playerId, direction })
        });
    }

    async function changeName(playerId: string) {
        const newName = prompt('Enter new name:');
        if (!newName || !newName.trim()) return;
        await fetch('/api/change-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, playerId, newName })
        });
    }
</script>

<!-- The HTML part of the component remains exactly the same. -->
<main>
    <h1>Avalon Lobby</h1>
    <p>Game ID: <strong>{gameId}</strong></p>

    {#if !hasJoined}
        <div class="join-form">
            <input type="text" bind:value={playerName} placeholder="Enter your name" />
            <button on:click={joinGame}>Join Game</button>
        </div>
    {:else}
        <h2>Players in Lobby</h2>
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
    {/if}
</main>

<!-- Styles remain the same -->
<style>
    /* ... */
</style>
