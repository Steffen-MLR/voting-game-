'use client';
export const dynamic = 'force-dynamic';
import QRCode from "react-qr-code";
import './page.css';
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

export type Question = {
    id: number;
    question: string;
    voteA: string;
    voteB: string;
}

const CreatePage = () => {
    const [questions, setQuestions] = useState<{[id: number]: Question}>({});

    function updateQuestion(id: number, updatedQuestion: Question) {
        setQuestions((prevQuestions) => ({
            ...prevQuestions,
            [id]: updatedQuestion, 
        }));
    }

    function addQuestion() {
        const questionsArray = Object.values(questions);
        const lastQuestionId: number = questionsArray.map(q => q.id).sort()[questionsArray.length - 1] ?? 0;
        updateQuestion(lastQuestionId+1, {id: lastQuestionId+1, question: '', voteA: 'Ja', voteB: 'Nein'});
    }

    function removeQuestion(id: number) {
        setQuestions((prevQuestions) => {
            const newQuestions = { ...prevQuestions }; 
            delete newQuestions[id];
            return newQuestions;
        });
    }

    return (
        <>
            <div className="content">
                <div className="left">
                    <QRCode
                        className="qr-code"
                        size={512}
                        value={`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/host?data=${btoa(JSON.stringify(questions))}`}
                    />
                    {process.env.NODE_ENV === 'development' && <a className="button" href={`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/host?data=${btoa(JSON.stringify(questions))}`}>Create Game</a>}
                </div>
                <div className="right">
                    {Object.values(questions).map((q: Question) => {
                        return (<div className="question-input" key={q.id}>
                            {q.id}
                            <input placeholder="Frage" className="question" value={q.question} onChange={(e) => updateQuestion(q.id, {id: q.id, question: e.target.value, voteA: q.voteA, voteB: q.voteB})} />
                            <input placeholder="Antwort A" className="voteA" value={q.voteA} onChange={(e) => updateQuestion(q.id, {id: q.id, question: q.question, voteA: e.target.value, voteB: q.voteB})}/>
                            <input placeholder="Antwort B" className="voteB" value={q.voteB} onChange={(e) => updateQuestion(q.id, {id: q.id, question: q.question, voteA: q.voteA, voteB: e.target.value})}/>
                            <MdDeleteForever style={{cursor: 'pointer'}} onClick={() => removeQuestion(q.id)} size={40} color="#C1001F" />
                        </div>);
                    })}
                    <div className="button add-question" onClick={addQuestion}>
                        <FaPlus/>
                        Add Question
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreatePage;