'use client';
export const dynamic = 'force-dynamic';
import QRCode from "react-qr-code";
import './page.css';
import { useEffect, useState } from "react";
import { FaCheck, FaPlus, FaRegCopy } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { CopyButton } from "@/components/CopyButton";

export type Question = {
    id: number;
    question: string;
    voteA: string;
    voteB: string;
}

export type QrCodeData = {
    questions: {[id: number]: Question};
    host: string;
    hostImage: string;
    hostEmail: string;
}

const CreatePage = () => {
    const [questions, setQuestions] = useState<{[id: number]: Question}>({});
    const [data, setData] = useState<QrCodeData | null>(null);
    const [base64, setBase64] = useState<string>('');
    const [host, setHost] = useState<string>('');
    const [hostImage, setHostImage] = useState<string>('');
    const [hostEmail, setHostEmail] = useState<string>('');

    function updateQuestion(id: number, updatedQuestion: Question) {
        setQuestions((prevQuestions) => ({
            ...prevQuestions,
            [id]: updatedQuestion, 
        }));
        console.log(JSON.stringify(questions));
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

    useEffect(() => {
        const updatedData: QrCodeData = { questions, host, hostImage, hostEmail };
        setData(updatedData);
        setBase64(Buffer.from(JSON.stringify(updatedData), "utf-8").toString('base64').replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
    }, [questions, host, hostImage, hostEmail]);

    return (
        <>
            <div className="content">
                <div className="left">
                    <input type="text" placeholder="Vortragender" onChange={(e) => setHost(e.target.value)}/>
                    <input type="text" placeholder="Vortragender Bild-Link" onChange={(e) => setHostImage(e.target.value)}/>
                    <input type="text" placeholder="E-Mail" onChange={(e) => setHostEmail(e.target.value)}/>
                    <QRCode
                        className="qr-code"
                        value={`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/host?data=${base64}`}
                    />
                    <CopyButton
                        tooltip="Link Kopieren"
                        preClicked={<FaRegCopy color="white" size={30} />}
                        postClicked={<FaCheck color="white" size={30} />}
                        toCopy={`${process.env.NEXT_PUBLIC_DOMAIN || 'https://vote.sovd.it'}/host?data=${base64}`}
                    />
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