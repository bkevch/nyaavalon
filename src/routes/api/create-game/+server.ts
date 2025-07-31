// src/routes/api/create-game/+server.js

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// We'll use a simple in-memory Map to store our active games for now.
// The key will be the gameId, and the value will be the game state object.
const activeGames = new Map();

export const POST: RequestHandler = async () => {
    // Task: Generate a unique URL or a short code for each new game instance.
    // We'll generate a simple 6-character alphanumeric ID.
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Store a new game object in our in-memory storage.
    // For now, it can be a simple object; we'll add players to it later.
    activeGames.set(gameId, {
        id: gameId,
        players: [],
        state: 'lobby',
    });

    // Return the new gameId to the frontend.
    return json({ gameId });
}
