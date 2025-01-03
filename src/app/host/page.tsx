import { Suspense } from 'react';
import HostPageClient from './pageClient';

export default function HostPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <HostPageClient />
    </Suspense>
  );
}