import { Suspense } from 'react';
import SubmitPageClient from './pageClient';

export default function SubmitPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SubmitPageClient />
    </Suspense>
  );
}