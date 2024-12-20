'use client';
import { useEffect, useState } from 'react';
import './page.css';
import { useSearchParams } from "next/navigation";

const HostPage = () => {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    if (code) {
        sessionStorage.setItem('session', code);
        window.history.replaceState(null, '', '/host');
    }

    const [yesVotes, setYesVotes] = useState<number>(0);
    const [noVotes, setNoVotes] = useState<number>(0);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [customQuestion, setCustomQuestion] = useState<string>();
    const [customVoteA, setCustomVoteA] = useState<string>("Ja");
    const [customVoteB, setCustomVoteB] = useState<string>("Nein");
    const [question, setQuestion] = useState<string>();
    const [voteA, setVoteA] = useState<string>();
    const [voteB, setVoteB] = useState<string>();

    function resetVotes() {
        socket?.send(JSON.stringify({ type: 'reset-votes' }));
    };

    function insertCustomQuestion() {
        socket?.send(JSON.stringify({
            type: 'set-question',
            question: customQuestion,
            voteA: customVoteA,
            voteB: customVoteB
        }));
    }

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

    return (
        <>
            <div className="content">
                <div className="top">
                    <div className="button reset-votes" onClick={resetVotes}>
                        Votes zurücksetzen
                    </div>
                    <div className="button next-question">
                        Nächste Frage
                    </div>
                </div>
                <div className="bottom">
                    <div className="information">
                        <div className="info-top">
                            <div className="info-left">
                                <h1>Aktuelle Frage</h1>
                                {question}
                            </div>
                            <div className="info-right">
                                <h1>Stimmen</h1>
                                {voteA}: {yesVotes}<br/>
                                {voteB}: {noVotes}
                            </div>
                        </div>
                        <div className="info-bottom">
                            <h1>Nächste Frage</h1>
                            Dies ist die nächste Frage?sdsdssdsdsdsddsss
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
                </div>
            </div>
        </>
    )
}

export default HostPage;