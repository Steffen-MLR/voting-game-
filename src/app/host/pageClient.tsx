'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import './page.css';
import { useSearchParams } from "next/navigation";
import { QrCodeData, Question } from '../create/pageClient';

const HostPage = () => {
    const searchParams = useSearchParams();

    const [data, setData] = useState<QrCodeData>();
    const [questionId, setQuestionId] = useState<number>(0);
    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const [aVotes, setAVotes] = useState<number>(0);
    const [bVotes, setBVotes] = useState<number>(0);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [customQuestion, setCustomQuestion] = useState<string>();
    const [customVoteA, setCustomVoteA] = useState<string>("Ja");
    const [customVoteB, setCustomVoteB] = useState<string>("Nein");
    const [lobby, setLobby] = useState<string>();

    function resetVotes() {
        socket?.send(JSON.stringify({ type: 'reset-votes' }));
    };

    function goToNextQuestion() {
        console.log(questionId);
        if (!data) { return; }
        resetVotes();
        socket?.send(JSON.stringify({
            lobby,
            type: 'set-question',
            id: questionId + 1,
            question: data.questions[questionId + 1].question,
            voteA: data.questions[questionId + 1].voteA,
            voteB: data.questions[questionId + 1].voteB
        }));
    }

    function insertCustomQuestion() {
        socket?.send(JSON.stringify({
            type: 'set-question',
            lobby,
            id: questionId,
            question: customQuestion,
            voteA: customVoteA,
            voteB: customVoteB
        }));
        setCustomQuestion('');
        setCustomVoteA('Ja');
        setCustomVoteB('Nein');
        setLocalQuestion({
            id: questionId,
            question: customQuestion || '',
            voteA: customVoteA,
            voteB: customVoteB
        })
    }

    function setLocalQuestion(q: Question) {
        setQuestion(q);
    }

    function handleLobbyClose() {
        const userConfirmed = window.confirm('Bist du sicher, dass du die Lobby schließen möchtest?');
        console.log(socket);
        if (userConfirmed) {
            const content = JSON.stringify({
                type: 'close-lobby',
                lobby: lobby,
                data: {
                    host: data?.host,
                    image: data?.hostImage,
                    email: data?.hostEmail
                }
            });
            console.log(content);
            const res = socket?.send(content);
            console.log(res);
            sessionStorage.removeItem('lobby');
            setLobby(undefined);
        }
    }

    useEffect(() => {
        if (!data) { return; }
        setLocalQuestion({
            id: questionId,
            question: data.questions[questionId]?.question,
            voteA: data.questions[questionId]?.voteA,
            voteB: data.questions[questionId]?.voteB
        });
    }, [questionId]);

    useEffect(() => {
        const lobbyCode:string | null = sessionStorage.getItem('lobby');
        const socketConnection = new WebSocket(lobbyCode ? `${process.env.NEXT_PUBLIC_WEB_SOCKET || 'wss://vote.sovd.it'}/api?lobby=${lobbyCode}` : `${process.env.NEXT_PUBLIC_WEB_SOCKET || 'wss://vote.sovd.it'}/api`);
        setSocket(socketConnection);

        socketConnection.onopen = () => {
            setInterval(() => {
                if (socketConnection.readyState === WebSocket.OPEN) {
                    socketConnection.send(JSON.stringify({ type: 'ping' }));
                }
            }, 10000);
        }

        const data: string | null = searchParams.get('data');
        if (data) {
            const base64 = data.replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(data.length + (4 - (data.length % 4)) % 4, "=");
            setData(JSON.parse(Buffer.from(base64, 'base64').toString('utf-8')));
        }
        
        if (lobbyCode) {
            setLobby(lobbyCode);
        } else {
            socketConnection.onopen = () => {
                socketConnection.send(JSON.stringify({ type: 'generate-lobby' }));
            }
        }

        socketConnection.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'votes') {
                setAVotes(data.aVotes);
                setBVotes(data.bVotes);
            } else if (data.type === 'question-changed') {
                setQuestionId(data.id);
            } else if (data.type === 'lobby-generated') {
                setLobby(data.lobby);
                sessionStorage.setItem('lobby', data.lobby);
            } else if (data.type === 'current-question') {
                setQuestionId(data.id);
            }
        };

        return () => {
            socketConnection.close();
        };
    }, []);

    return (
        <>
            <div className="content">
                <div className="top">
                    <div className="button reset-votes" onClick={resetVotes}>
                        Votes zurücksetzen
                    </div>
                    {((question && data?.questions[question?.id + 1]) || questionId === 0) && 
                        <div className="button next-question" onClick={goToNextQuestion}>
                            {(question?.id || 0) > 0 ? 'Nächste Frage' : 'Start'}
                        </div>
                    }
                </div>
                <div className="bottom">
                    <div className="information">
                        <div className="lobby-code">
                            <h1>Lobby Code</h1>
                            {lobby}
                        </div>
                        <div className="info-top">
                            {question && <>
                                <div className="info-left">
                                    <h1>Aktuelle Frage</h1>
                                    {question.question}
                                </div>
                                <div className="info-right">
                                    <h1>Stimmen</h1>
                                    {question.voteA}: {aVotes}<br/>
                                    {question.voteB}: {bVotes}
                                </div>
                            </>}
                        </div>
                        <div className="info-bottom">
                            {data && question && data.questions[question.id + 1] && <>
                                <h1>Nächste Frage</h1>
                                {data.questions[question.id + 1].question}
                            </>}
                        </div>
                    </div>
                    <div className="custom-question">
                        <h1>Custom Frage:</h1>
                        <textarea placeholder="Frage eingeben" value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)} />
                        <div className="decisions">
                            <input placeholder='Antwort A' value={customVoteA} onChange={(e) => setCustomVoteA(e.target.value)} />
                            <input placeholder='Antwort B' value={customVoteB} onChange={(e) => setCustomVoteB(e.target.value)} />
                        </div>
                        <div className="button insert-custom-question" onClick={insertCustomQuestion}>Custom Frage einschieben</div>
                    </div>
                    <div className="close-lobby">
                        <div className="button close-lobby-button" onClick={handleLobbyClose}>Lobby schließen</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HostPage;