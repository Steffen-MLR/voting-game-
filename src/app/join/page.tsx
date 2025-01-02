'use client';
import React, { useEffect, useState } from 'react';
import './page.css';
import QRCode from 'react-qr-code';
import { useSearchParams } from 'next/navigation';

const AskPage = () => {
    const searchParams = useSearchParams();
    const lobbyCode = searchParams.get('lobby');

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socketConnection = new WebSocket(`${process.env.NEXT_PUBLIC_WEB_SOCKET}?lobby=${lobbyCode}`);
        setSocket(socketConnection);

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

export default AskPage;