import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let yesVotes = 0;
let noVotes = 0;
const clients = new Map<string, string>();

function resetVotes() {
    yesVotes = 0;
    noVotes = 0;
    clients.clear();

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'votes', yesVotes, noVotes }));
            client.send(JSON.stringify({ type: 'votes-resetted' }));
        }
    });
}

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.send(JSON.stringify({ type: 'votes', yesVotes, noVotes }));

    ws.on('message', (message: string) => {
        const data = JSON.parse(message);

        if (data.type === 'vote') {
            const previousVote = clients.get(data.clientId);
            const voteChanged = !previousVote || previousVote !== data.vote;

            if (voteChanged) {
                if (previousVote === 'yes') {
                    yesVotes--;
                } else if (previousVote === 'no') {
                    noVotes--;
                }

                clients.set(data.clientId, data.vote);

                if (data.vote === 'yes') {
                    yesVotes++;
                } else if (data.vote === 'no') {
                    noVotes++;
                }

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'votes', yesVotes, noVotes }));
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
