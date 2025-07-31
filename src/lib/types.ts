// src/lib/types.ts

export interface Player {
    id: string; // Unique ID for each player
    name: string;
}

export interface Game {
    id: string;
    players: Player[];
    state: 'lobby' | 'in-progress' | 'finished';
    // We can add more game state properties here later
}
