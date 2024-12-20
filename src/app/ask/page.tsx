'use client';
import React, { useEffect, useState } from 'react';
import './page.css';
import QRCode from 'react-qr-code';
import { useSearchParams } from 'next/navigation';

const AskPage = () => {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    if (code) {
        sessionStorage.setItem('session', code);
        window.history.replaceState(null, '', '/ask');
    }

    const [yesVotes, setYesVotes] = useState<number>(0);
    const [noVotes, setNoVotes] = useState<number>(0);
    const [question, setQuestion] = useState<string>('');
    const [voteA, setVoteA] = useState<string>();
    const [voteB, setVoteB] = useState<string>();
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socketConnection = new WebSocket('ws://localhost:8080');
        setSocket(socketConnection);

        socketConnection.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'votes') {
                setYesVotes(data.yesVotes);
                setNoVotes(data.noVotes);
            } else if (data.type === 'question-changed') {
                setQuestion(data.question);
                setVoteA(data.voteA);
                setVoteB(data.voteB);
            }
        };

        return () => {
            socketConnection.close();
        };
    }, []);

    return (<>
        <div className="content">
            <div className="left">
                <div className="qr-code">
                    <QRCode 
                        size={400}
                        style={{border: '3px solid white'}}
                        value="https://localhost:3000/vote"
                    />
                </div>
                <h1>{question}</h1>
            </div>
            <div className="right">
                <div className="yes">
                    <div className="count">
                        {yesVotes}
                    </div>
                    <h1>{voteA}</h1>
                    <div className="figures">
                        {Array.from({ length: yesVotes }, (_, index) => <img key={index} src="/images/figure.svg" width={50} />)}
                    </div>
                </div>
                <div className="no">
                    <div className="count">
                        {noVotes}
                    </div>
                    <h1>{voteB}</h1>
                    <div className="figures">
                        {Array.from({ length: noVotes }, (_, index) => <img key={index} src="/images/figure.svg" width={50} />)}
                    </div>
                </div>
            </div>
        </div>
    </>);
};

export default AskPage;