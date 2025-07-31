import { json, type RequestHandler } from '@sveltejs/kit';
import { activeGames } from '$lib/server/game-store.js';
import { getIO } from '$lib/server/socket-server.js';
import type { Player, Game } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
    const { gameId, playerName } = await request.json() as { gameId: string, playerName: string };

    if (!gameId || !playerName) {
        return json({ error: 'Game ID and Player Name are required.' }, { status: 400 });
    }

    const game = activeGames.get(gameId);
    if (!game) {
        return json({ error: 'Game not found.' }, { status: 404 });
    }

    const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: playerName,
    };

    game.players.push(newPlayer);
    activeGames.set(gameId, game);

    const io = getIO();
    io.to(gameId).emit('update-lobby', game.players);

    console.log(`Player ${playerName} joined game ${gameId}`);
    return json({ success: true, playerId: newPlayer.id });
};
