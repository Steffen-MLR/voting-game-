import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let aVotes = 0;
let bVotes = 0;
const clients = new Map<string, string>();

function resetVotes() {
    aVotes = 0;
    bVotes = 0;
    clients.clear();

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'votes', aVotes, bVotes }));
            client.send(JSON.stringify({ type: 'votes-resetted' }));
        }
    });
}

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.send(JSON.stringify({ type: 'votes', aVotes, bVotes }));

    ws.on('message', (message: string) => {
        const data = JSON.parse(message);

        if (data.type === 'vote') {
            const previousVote = clients.get(data.clientId);
            const voteChanged = !previousVote || previousVote !== data.vote;

            if (voteChanged) {
                if (previousVote === 'yes') {
                    aVotes--;
                } else if (previousVote === 'no') {
                    bVotes--;
                }

                clients.set(data.clientId, data.vote);

                if (data.vote === 'yes') {
                    aVotes++;
                } else if (data.vote === 'no') {
                    bVotes++;
                }

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'votes', aVotes, bVotes }));
                    }
                });
            }
        } else if (data.type === 'reset-votes') {
            resetVotes();
        } else if (data.type === 'set-question') {
            resetVotes();

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'question-changed', question: data.question, voteA: data.voteA, voteB: data.voteB }));
                }
            });
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
