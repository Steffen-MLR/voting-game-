'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import './page.css';
import { useSearchParams } from 'next/navigation';

const VotePage = () => {
    const searchParams = useSearchParams();
    const lobbyCode = searchParams.get('lobby');
    
    const [selectedSide, setSelectedSide] = useState<string>('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [waitingForHost, setWaitingForHost] = useState<boolean>(true);
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

        const socketConnection = new WebSocket(`${process.env.NEXT_PUBLIC_WEB_SOCKET || 'wss://vote.sovd.it'}/api?lobby=${lobbyCode}&clientId=${localStorage.getItem('clientId')}`);
        setSocket(socketConnection);

        socketConnection.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'votes-resetted') {
                setSelectedSide('');
            }
            else if (data.type === 'question-changed' || data.type === 'current-question') {
                if (data.question) {
                    setWaitingForHost(false);
                }
                setQuestion(data.question);
                setVoteA(data.voteA);
                setVoteB(data.voteB);
            } else if (data.type === 'my-vote') {
                setSelectedSide(data.vote);
            }
        };

        socketConnection.onclose = () => {
            window.location.href = '/';
        }

        return () => {
            socketConnection.close();
        };
    }, []);

    const handleVote = (side: string) => {
        if (socket && !waitingForHost) {
            socket.send(JSON.stringify({ type: 'vote', vote: side, clientId: clientId }));
            setSelectedSide(side);
        }
    };

    return (
        <div className="content">
            <div className="up">
                <h1>{waitingForHost ? 'Warte auf Host...' : question}</h1>
            </div>
            <div className="down">
                <div className="left" onClick={() => handleVote('a')}>
                    <h1>{voteA}</h1>
                    <p style={{ display: selectedSide === 'a' ? 'block' : 'none' }}>Du hast Ja gewählt.</p>
                </div>
                <div className="right" onClick={() => handleVote('b')}>
                    <h1>{voteB}</h1>
                    <p style={{ display: selectedSide === 'b' ? 'block' : 'none' }}>Du hast Nein gewählt.</p>
                </div>
            </div>
        </div>
    );
};

export default VotePage;
