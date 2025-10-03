'use client';

import SearchResults from '@/app/search/SearchResults';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchResults />
      </div>
    </div>
  );
}
