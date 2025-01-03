'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import './page.css';
import { useSearchParams } from "next/navigation";
import { Question } from '../create/pageClient';

const HostPage = () => {
    const searchParams = useSearchParams();

    const [questions, setQuestions] = useState<{[id: number]: Question}>({});
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
        resetVotes();
        socket?.send(JSON.stringify({
            lobby,
            type: 'set-question',
            id: questionId + 1,
            question: questions[questionId + 1].question,
            voteA: questions[questionId + 1].voteA,
            voteB: questions[questionId + 1].voteB
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

        if (userConfirmed) {
            socket?.send(JSON.stringify({
                type: 'close-lobby',
                lobby: lobby
            }));
            sessionStorage.removeItem('lobby');
            setLobby(undefined);
        }
    }

    useEffect(() => {
        setLocalQuestion({
            id: questionId,
            question: questions[questionId]?.question,
            voteA: questions[questionId]?.voteA,
            voteB: questions[questionId]?.voteB
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
            setQuestions(JSON.parse(atob(data)));
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
                    {(question?.id || 0) <= Object.keys(questions).length && 
                    <div className="button next-question" onClick={goToNextQuestion}>
                        {(question?.id || 0) > 0 ? 'Nächste Frage' : 'Start'}
                    </div> }
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
                            {question && questions[question.id + 1] && <>
                                <h1>Nächste Frage</h1>
                                {questions[question.id + 1].question}
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