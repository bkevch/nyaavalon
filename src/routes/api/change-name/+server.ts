import { json, type RequestHandler } from '@sveltejs/kit';
import { updateGame } from '$lib/server/game-store';

export const POST: RequestHandler = async ({ request }) => {
    const { gameId, playerId, newName } = await request.json() as { gameId: string, playerId: string, newName: string };

    updateGame(gameId, (game) => {
        const player = game.players.find(p => p.id === playerId);
        if (player && newName) {
            player.name = newName;
        }
    });

    return json({ success: true });
};
