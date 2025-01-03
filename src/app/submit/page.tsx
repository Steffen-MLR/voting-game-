'use client';
import { useState } from 'react';
import './page.css';
import { saveInterest } from '@/actions/saveInterest';

export default function Home() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await saveInterest(name, email);
    if (res) {
      setSubmitted(true);
    } else {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      height: '100vh',
      gap: '1rem'
    }}>
      {submitted ? <>
        <h1 style={{fontSize: '4rem'}}>Vielen Dank!</h1>
        <span style={{fontSize: '2rem'}}>Wir melden Uns bei Dir.</span>
      </> : <>
        <h1 style={{fontSize: '4rem'}}>Wir haben Dein Interesse geweckt?</h1>
        <span style={{fontSize: '2rem'}}>Dann fülle dieses Formular aus:</span>
        <input style={{fontSize: '3rem', width: '40%', color: 'black'}} type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
        <input style={{fontSize: '3rem', width: '40%', color: 'black'}} type="text" placeholder="E-Mail Addresse" onChange={(e) => setEmail(e.target.value)}/>
        <button className="button" style={{height: '3rem'}} disabled={submitting} onClick={handleSubmit}>Abschicken</button>
      </>
      }
    </div>
  );
}
