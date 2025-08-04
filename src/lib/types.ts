export interface Game {
    id: string;
    players: User[];
    state: 'lobby' | 'in-progress' | 'finished';
    hostId: string;
    // We can add more game state properties here later
}

export interface Lobby { 
    gameId: string;
    users: User[];
    hostId: string;
}
    
export interface User {
    name: string;
    id: string;
}

export interface GameState {
    users: User[];
    host: User | null;
    gameId: string | null;
    hasJoined: boolean; // is this only front end?
    errorMsg: string;
}
