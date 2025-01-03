import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { parse } from 'url';
import { IncomingMessage } from 'http';

class LobbyState {
    questionId: number;
    question: string | null;
    aVotes: number;
    bVotes: number;
    voteA: string | null;
    voteB: string | null;
    clientVotes: Map<string, string>;

    constructor() {
        this.questionId = 0;
        this.question = null;
        this.aVotes = 0;
        this.bVotes = 0;
        this.voteA = null;
        this.voteB = null;
        this.clientVotes = new Map<string, string>();
    }

    resetVotes() {
        this.aVotes = 0;
        this.bVotes = 0;
        this.clientVotes = new Map<string, string>();
    }
}

dotenv.config();

const wss = new WebSocketServer({ port: 8080, path: '/api' });

const clients = new Map<WebSocket, string>();
const lobbies = new Map<string, LobbyState>();

function generateLobbyCode(): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 6) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    if (lobbies.get(result)) {
        return generateLobbyCode();
    }
    return result;
}

function resetVotes(lobby: string | undefined): void {
    if (!lobby) { return; }
    const lobbyState: LobbyState | undefined = lobbies.get(lobby);
    lobbyState?.resetVotes();
    lobbies.set(lobby, lobbyState || new LobbyState());

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'votes', aVotes: 0, bVotes: 0 }));
            client.send(JSON.stringify({ type: 'votes-resetted' }));
        }
    });
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const params = parse(req.url || '', true).query;
    let lobbyCode: string | undefined = typeof params?.lobby === 'string' ? params.lobby : undefined;
    const clientId: string | undefined = typeof params?.clientId === 'string' ? params.clientId : undefined;
    let lobby: LobbyState | undefined = lobbies.get(lobbyCode || '');
    console.log(lobbyCode, 'New client connected');

    if (lobby) {
        if (clientId && lobby.clientVotes.get(clientId)) {
            ws.send(JSON.stringify({ type: 'my-vote', vote: lobby.clientVotes.get(clientId)}));
        }
        ws.send(JSON.stringify({ type: 'votes', aVotes: lobby.aVotes, bVotes: lobby.bVotes }));
        ws.send(JSON.stringify({ type: 'current-question', id: lobby.questionId, question: lobby.question, voteA: lobby.voteA, voteB: lobby.voteB }));
    }

    if (lobbyCode) {
        clients.set(ws, lobbyCode);
    }

    ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        if (!lobbyCode && data.lobby) {
            lobbyCode = data.lobby;
            lobby = lobbies.get(lobbyCode || '');
        }

        if (lobby) {
            if (data.type === 'vote') {
                console.log(lobbyCode, 'New vote from', data.clientId);
                const previousVote = lobby.clientVotes.get(data.clientId);
                const voteChanged = !previousVote || previousVote !== data.vote;
    
                if (voteChanged) {
                    if (previousVote === 'a') {
                        lobby.aVotes--;
                    } else if (previousVote === 'b') {
                        lobby.bVotes--;
                    }
    
                    lobby.clientVotes.set(data.clientId, data.vote);
    
                    if (data.vote === 'a') {
                        lobby.aVotes++;
                    } else if (data.vote === 'b') {
                        lobby.bVotes++;
                    }
    
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ lobby: lobbyCode, type: 'votes', aVotes: lobby?.aVotes, bVotes: lobby?.bVotes }));
                        }
                    });
                }
            } else if (data.type === 'reset-votes') {
                resetVotes(lobbyCode);
                console.log(lobbyCode, 'Votes resetted');
            } else if (data.type === 'set-question') {
                resetVotes(lobbyCode);
                lobby.questionId = data.id;
                lobby.question = data.question;
                lobby.voteA = data.voteA;
                lobby.voteB = data.voteB;
                console.log(lobbyCode, 'Question set');
    
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ lobby: lobbyCode, type: 'question-changed', id: data.id, question: data.question, voteA: data.voteA, voteB: data.voteB }));
                    }
                });
            } else if (data.type === 'close-lobby') {
                lobbies.delete(data.lobby);

                clients.forEach((lobbyCode: string, client: WebSocket) => {
                    if (client.readyState === WebSocket.OPEN && lobbyCode === data.lobby) {
                        client.send(JSON.stringify({ type: 'lobby-closed' }));
                    }
                });
            }
        } else {
            if (data.type === 'generate-lobby') {
                const lobbyCode = generateLobbyCode();
                lobbies.set(lobbyCode, new LobbyState());

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ lobby: lobbyCode, type: 'lobby-generated' }));
                    }
                });
                console.log(lobbyCode, 'lobby created');
            }
        }
    });
});

console.log(`WebSocket server is running on ${process.env.NEXT_PUBLIC_WEB_SOCKET || 'wss://vote.sovd.it'}/api`);
