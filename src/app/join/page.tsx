import { Suspense } from 'react';
import JoinPageClient from './pageClient';

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <JoinPageClient />
    </Suspense>
  );
}