'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import './page.css';
import QRCode from 'react-qr-code';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const AskPage = () => {
    const searchParams = useSearchParams();
    const lobbyCode = searchParams.get('lobby');

    const [aVotes, setAVotes] = useState<number>(0);
    const [bVotes, setBVotes] = useState<number>(0);
    const [question, setQuestion] = useState<string>('');
    const [voteA, setVoteA] = useState<string>();
    const [voteB, setVoteB] = useState<string>();
    const [started, setStarted] = useState<boolean>(false);

    useEffect(() => {
        const socketConnection = new WebSocket(`${process.env.NEXT_PUBLIC_WEB_SOCKET || 'wss://vote.sovd.it'}/api?lobby=${lobbyCode}`);

        socketConnection.onopen = () => {
            setInterval(() => {
                if (socketConnection.readyState === WebSocket.OPEN) {
                    socketConnection.send(JSON.stringify({ type: 'ping' }));
                }
            }, 10000);
        }

        socketConnection.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'votes') {
                setAVotes(data.aVotes);
                setBVotes(data.bVotes);
            } else if ((data.type === 'question-changed' || data.type === 'current-question') && data.lobby === lobbyCode) {
                if (data.id > 0) {
                    setStarted(true);
                }
                setQuestion(data.question);
                setVoteA(data.voteA);
                setVoteB(data.voteB);
            } else if (data.type === 'lobby-closed') {
                socketConnection.close();
                const hostInfo = Buffer.from(JSON.stringify(data.data), 'utf8').toString('base64');
                window.location.href = `/submit?data=${hostInfo}&source=ask`;
            }
        };

        return () => {
            socketConnection.close();
        };
    }, []);

    return (<>
        <div className="content">
            {started ? <>
                <div className="left">
                    <div className="qr-code">
                        <QRCode 
                            size={400}
                            style={{border: '3px solid white'}}
                            value={`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/vote?lobby=${lobbyCode}`}
                        />
                    </div>
                    <h1>{question}</h1>
                </div>
                <div className="right">
                    <div className="yes">
                        <div className="count">
                            {aVotes}
                        </div>
                        <h1>{voteA}</h1>
                        <div className="figures">
                            {Array.from({ length: aVotes }, (_, index) => <Image key={index} src="/images/figure.svg" width={50} height={50} alt="Figure" />)}
                        </div>
                    </div>
                    <div className="no">
                        <div className="count">
                            {bVotes}
                        </div>
                        <h1>{voteB}</h1>
                        <div className="figures">
                            {Array.from({ length: bVotes }, (_, index) => <Image key={index} src="/images/figure.svg" width={50} height={50} alt="Figure" />)}
                        </div>
                    </div>
                </div>
            </> : <>
                {lobbyCode && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <QRCode
                        size={700}
                        style={{border: '3px solid white'}}
                        value={`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/vote?lobby=${lobbyCode}`}
                    />
                    <span style={{fontSize: '5rem'}}>{`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/vote?lobby=${lobbyCode}`}</span>
                </div>}
            </>}
        </div>
    </>);
};

export default AskPage;