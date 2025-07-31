
import { json, type RequestHandler } from '@sveltejs/kit';
import { activeGames } from '$lib/server/game-store.js';
import type { Game, Player } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
    const { playerName } = await request.json();
    if (!playerName || !playerName.trim()) {
        return json({ error: 'Player name is required.' }, { status: 400 });
    }

    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = crypto.randomUUID();
    const hostPlayer: Player = {
        id: playerId,
        name: playerName.trim(),
    };

    const newGame: Game = {
        id: gameId,
        players: [hostPlayer],
        state: 'lobby',
    };

    activeGames.set(gameId, newGame);
    console.log(`Game room created: ${gameId} by host ${hostPlayer.name}.`);
    return json({ gameId, playerId });
};
