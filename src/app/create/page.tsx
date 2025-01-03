import { Suspense } from 'react';
import CreatePageClient from './pageClient';

export default function CreatePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <CreatePageClient />
    </Suspense>
  );
}