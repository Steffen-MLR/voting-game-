'use client';
import { useEffect, useState } from 'react';
import './page.css';
import { saveInterest } from '@/actions/saveInterest';
import { useSearchParams } from 'next/navigation';

export default function SubmitPageClient() {
  const searchParams = useSearchParams();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [host, setHost] = useState<string>('');
  const [hostImage, setHostImage] = useState<string>('');
  const [hostEmail, setHostEmail] = useState<string>('');
  const [source, setSource] = useState<string>('');

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await saveInterest(name, email);
    if (res) {
      setSubmitted(true);
    } else {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const data: string | null = searchParams.get('data');
    const source: string | null = searchParams.get('source');
    if (source) {
      setSource(source);
    }
    if (data) {
        const object = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        setHost(object.host);
        setHostImage(object.image);
        setHostEmail(object.email);
    }
  }, []);

  return (
    <div className="content">
      {submitted ? <>
        <h1 style={{fontSize: '4rem'}}>Vielen Dank!</h1>
        <span style={{fontSize: '2rem'}}>Wir melden Uns bei Dir.</span>
      </> : <div className="not-submitted">
        <div className="logo">
          <img src="/images/sovdwaer_full.png"/>
        </div>
        <h1>Wir haben Dein Interesse geweckt?</h1>
        <div className="contact">
          {hostImage && hostEmail && <>
            <div className="contact-left">
              <div className={`circle-photo ${source}`}>
                <img
                  src={hostImage}
                  style={{borderRadius: '50%'}}
                />
              </div>
              <div className={`contact-info ${source}`}>
                <span className="headline">Kontakt</span>
                <br/>
                <span>{host}</span>
                <br/>
                <span>Email: <a href="mailto:jobs.it-schule@sovdwaer.de">{hostEmail}</a></span>
              </div>
            </div>
            {source === 'vote' &&
              <div className="divider"/>
            }
          </>}
          {source === 'vote' &&
            <div className="contact-right">
              <span>Oder fülle direkt dieses Formular aus:</span>
              <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
              <input type="text" placeholder="E-Mail Addresse" onChange={(e) => setEmail(e.target.value)}/>
              <button className="button" style={{height: '3rem'}} disabled={submitting || !name || !email} onClick={handleSubmit}>Abschicken</button>
            </div>
          }
        </div>
      </div>
      }
    </div>
  );
}
