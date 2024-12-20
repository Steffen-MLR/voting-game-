'use client';
import React, { useState, useEffect } from 'react';
import './page.css';

const AnswerPage = () => {
    const [selectedSide, setSelectedSide] = useState<string>('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [question, setQuestion] = useState<string>();
    const [voteA, setVoteA] = useState<string>();
    const [voteB, setVoteB] = useState<string>();
    const [clientId, setClientId] = useState<string | null>(localStorage.getItem('clientId'));
    localStorage.setItem('Bewirb dich jetzt!', 'Herzlichen Glückwunsch, du hast dir dein Vorstellungsgespräch gesichert. Mach hier von ein Screenshot und melde dich bei uns mit deiner Bewerbung (jobs@sovdwaer.de)');

    useEffect(() => {
        if (!clientId) {
            const newClientId = Math.random().toString(36).substring(2);
            localStorage.setItem('clientId', newClientId);
            setClientId(newClientId);
        }

        const socketConnection = new WebSocket('ws://localhost:8080');
        setSocket(socketConnection);

        socketConnection.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'error') {
                setErrorMessage(data.message);
            }
            else if (data.type === 'votes-resetted') {
                setSelectedSide('');
            }
            else if (data.type === 'question-changed') {
                setQuestion(data.question);
                setVoteA(data.voteA);
                setVoteB(data.voteB);
            }
        };

        return () => {
            socketConnection.close();
        };
    }, []);

    const handleVote = (side: string) => {
        if (socket) {
            socket.send(JSON.stringify({ type: 'vote', vote: side, clientId: clientId }));
            setSelectedSide(side);
        }
    };

    return (
        <div className="content">
            <div className="up">
                <h1>{question}</h1>
            </div>
            <div className="down">
                <div className="left" onClick={() => handleVote('yes')}>
                    <h1>{voteA}</h1>
                    <p style={{ display: selectedSide === 'yes' ? 'block' : 'none' }}>Du hast Ja gewählt.</p>
                </div>
                <div className="right" onClick={() => handleVote('no')}>
                    <h1>{voteB}</h1>
                    <p style={{ display: selectedSide === 'no' ? 'block' : 'none' }}>Du hast Nein gewählt.</p>
                </div>
            </div>
            {errorMessage && <div className="error">{errorMessage}</div>}
        </div>
    );
};

export default AnswerPage;
