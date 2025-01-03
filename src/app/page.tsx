import { useState } from 'react';
import './page.css';
import { saveInterest } from '@/actions/saveInterest';

export default function Home() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const handleSubmit = async () => {
    await saveInterest(name, email);
  }

  return (<div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '1rem'
  }}>
    <h1 style={{fontSize: '4rem'}}>Wir haben Dein Interesse geweckt?</h1>
    <span style={{fontSize: '2rem'}}>Dann melde dich bei uns!</span>
    <input style={{fontSize: '3rem', width: '40%', color: 'black'}} type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
    <input style={{fontSize: '3rem', width: '40%', color: 'black'}} type="text" placeholder="E-Mail Addresse" onChange={(e) => setEmail(e.target.value)}/>
    <button className="button" style={{height: '3rem'}} onClick={handleSubmit}>Ich bin interessiert!</button>
  </div>);
}
