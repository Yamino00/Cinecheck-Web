'use client';

import { Suspense } from 'react';
import SearchResults from '@/app/search/SearchResults';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-400">Caricamento...</p>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
