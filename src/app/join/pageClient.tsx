'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect } from 'react';
import './page.css';
import QRCode from 'react-qr-code';
import { useSearchParams } from 'next/navigation';

const JoinPage = () => {
    const searchParams = useSearchParams();
    const lobbyCode = searchParams.get('lobby');

    useEffect(() => {
        const socketConnection = new WebSocket(`wss://vote.sovd.it/api?lobby=${lobbyCode}`);

        socketConnection.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.lobby === lobbyCode && data.type === 'question-changed' && data.id === 1) {
                window.location.href = `/ask?lobby=${lobbyCode}`;
            }
        };

        return () => {
            socketConnection.close();
        };
    }, []);

    return (
        <div className="content">
            <div className="qr-code">
                {lobbyCode && <QRCode 
                    size={800}
                    style={{border: '3px solid white'}}
                    value={`${process.env.NEXT_PUBLIC_DOMAIN}/vote?lobby=${lobbyCode}`}
                />}
            </div>
        </div>
    );
};

export default JoinPage;