'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import './page.css';
import { useSearchParams } from 'next/navigation';
import { set } from 'mongoose';
import { GrStatusGoodSmall } from 'react-icons/gr';

const VotePage = () => {
    const searchParams = useSearchParams();
    const lobbyCode = searchParams.get('lobby');
    
    const [selectedSide, setSelectedSide] = useState<string>('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [waitingForHost, setWaitingForHost] = useState<boolean>(true);
    const [question, setQuestion] = useState<string>();
    const [voteA, setVoteA] = useState<string>();
    const [voteB, setVoteB] = useState<string>();
    const [clientId, setClientId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
    
    useEffect(() => {
        localStorage.setItem('Bewirb dich jetzt!', 'Herzlichen Glückwunsch, du hast dir dein Vorstellungsgespräch gesichert. Mach hier von ein Screenshot und melde dich bei uns mit deiner Bewerbung (jobs@sovdwaer.de)');
        if (!localStorage.getItem('clientId')) {
            const newClientId = Math.random().toString(36).substring(2);
            localStorage.setItem('clientId', newClientId);
            setClientId(newClientId);
        }

        const socketConnection = new WebSocket(`${process.env.NEXT_PUBLIC_WEB_SOCKET || 'wss://vote.sovd.it'}/api?lobby=${lobbyCode}&clientId=${localStorage.getItem('clientId')}`);
        setSocket(socketConnection);
        setConnectionStatus('connecting');

        socketConnection.onopen = () => {
            setConnectionStatus('open');
            setInterval(() => {
                if (socketConnection.readyState === WebSocket.OPEN) {
                    socketConnection.send(JSON.stringify({ type: 'ping' }));
                }
            }, 10000);
        }

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
            } else if (data.type === 'lobby-closed') {
                socketConnection.close();
                const hostInfo = Buffer.from(JSON.stringify(data.data), 'utf8').toString('base64');
                window.location.href = `/submit?data=${hostInfo}&source=vote`;
            }
        };

        socketConnection.onclose = () => {
            setConnectionStatus('closed');
        };

        socketConnection.onerror = () => {
            setConnectionStatus('closed');
        };

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
            <div className="connection-status" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px', margin: '0.5rem'}}>
                <GrStatusGoodSmall color={connectionStatus === 'open' ? '#4fc145' : '#c22f2f'} />
                <span>{connectionStatus === 'open' ? 'verbunden' : 'getrennt (Seite neuladen, um sich zu verbinden)'}</span>
            </div>
            <div className="up">
                <h1>{waitingForHost ? 'Warte auf Host...' : question}</h1>
            </div>
            <div className="down">
                <div className="left" onClick={() => handleVote('a')}>
                    <h1>{voteA}</h1>
                    <p style={{ display: selectedSide === 'a' ? 'block' : 'none' }}>Du hast &apos;{voteA}&apos; gewählt.</p>
                </div>
                <div className="right" onClick={() => handleVote('b')}>
                    <h1>{voteB}</h1>
                    <p style={{ display: selectedSide === 'b' ? 'block' : 'none' }}>Du hast &apos;{voteB}&apos; gewählt.</p>
                </div>
            </div>
        </div>
    );
};

export default VotePage;
