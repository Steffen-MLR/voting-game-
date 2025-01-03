import './page.css';

export default function Home() {
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
    <input style={{fontSize: '3rem', width: '40%', color: 'black'}} type="text" placeholder="E-Mail Addresse"/>
    <button className="button" style={{height: '3rem'}}>Ich bin interessiert!</button>
  </div>);
}
