import { json, type RequestHandler } from '@sveltejs/kit';
import { activeGames } from '$lib/server/game-store.js';
import type { Game } from '$lib/types';

export const POST: RequestHandler = async () => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newGame: Game = {
        id: gameId,
        players: [],
        state: 'lobby',
    };

    activeGames.set(gameId, newGame);
    console.log(`Game room created: ${gameId}.`);
    return json({ gameId });
};
