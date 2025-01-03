import { Suspense } from 'react';
import VotePageClient from './pageClient';

export default function VotePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <VotePageClient />
    </Suspense>
  );
}