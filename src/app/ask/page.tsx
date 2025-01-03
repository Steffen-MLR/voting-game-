import { Suspense } from 'react';
import AskPageClient from './pageClient';

export default function AskPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <AskPageClient />
    </Suspense>
  );
}