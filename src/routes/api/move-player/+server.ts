import { json, type RequestHandler } from '@sveltejs/kit';
import { updateGame } from '$lib/server/game-store';

export const POST: RequestHandler = async ({ request }) => {
    const { gameId, playerId, direction } = await request.json() as { gameId: string, playerId: string, direction: 'up' | 'down' };

    updateGame(gameId, (game) => {
        const index = game.players.findIndex(p => p.id === playerId);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            [game.players[index - 1], game.players[index]] = [game.players[index], game.players[index - 1]];
        } else if (direction === 'down' && index < game.players.length - 1) {
            [game.players[index], game.players[index + 1]] = [game.players[index + 1], game.players[index]];
        }
    });

    return json({ success: true });
};
