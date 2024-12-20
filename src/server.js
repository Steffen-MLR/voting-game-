"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var wss = new ws_1.WebSocketServer({ port: 8080 });
var yesVotes = 0;
var noVotes = 0;
var clients = new Map();
function resetVotes() {
    yesVotes = 0;
    noVotes = 0;
    clients.clear();
    wss.clients.forEach(function (client) {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'votes', yesVotes: yesVotes, noVotes: noVotes }));
            client.send(JSON.stringify({ type: 'votes-resetted' }));
        }
    });
}
wss.on('connection', function (ws) {
    console.log('New client connected');
    ws.send(JSON.stringify({ type: 'votes', yesVotes: yesVotes, noVotes: noVotes }));
    ws.on('message', function (message) {
        var data = JSON.parse(message);
        if (data.type === 'vote') {
            var previousVote = clients.get(data.clientId);
            var voteChanged = !previousVote || previousVote !== data.vote;
            if (voteChanged) {
                if (previousVote === 'yes') {
                    yesVotes--;
                }
                else if (previousVote === 'no') {
                    noVotes--;
                }
                clients.set(data.clientId, data.vote);
                if (data.vote === 'yes') {
                    yesVotes++;
                }
                else if (data.vote === 'no') {
                    noVotes++;
                }
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'votes', yesVotes: yesVotes, noVotes: noVotes }));
                    }
                });
            }
        }
        else if (data.type === 'reset-votes') {
            resetVotes();
        }
        else if (data.type === 'set-question') {
            resetVotes();
            wss.clients.forEach(function (client) {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'question-changed', question: data.question, voteA: data.voteA, voteB: data.voteB }));
                }
            });
        }
    });
});
console.log('WebSocket server is running on ws://localhost:8080');
