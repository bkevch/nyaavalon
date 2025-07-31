// src/lib/server/game-store.ts

import type { Game, Player } from '$lib/types';
import { getIO } from '$lib/server/socket-server';

// The Map is now strongly typed: it maps a string (gameId) to a Game object.
export const activeGames: Map<string, Game> = new Map();

// This helper function now uses the Game and Player types for its parameters.
export function updateGame(gameId: string, updateFunction: (game: Game) => void): Game | null {
    const game = activeGames.get(gameId);
    if (!game) {
        console.error(`Attempted to update non-existent game: ${gameId}`);
        return null;
    }
    
    updateFunction(game);
    
    activeGames.set(gameId, game);

    // Broadcast the updated player list to the room
    const io = getIO();
    io.to(gameId).emit('update-lobby', game.players);

    return game;
}
