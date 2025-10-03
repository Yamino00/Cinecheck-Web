'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Film, Tv } from 'lucide-react';
import './SearchBar.css';

type FilterType = 'all' | 'movie' | 'tv';

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({
        q: query.trim(),
        ...(filter !== 'all' && { type: filter }),
      });
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const cycleFilter = () => {
    setFilter((prev) => {
      if (prev === 'all') return 'movie';
      if (prev === 'movie') return 'tv';
      return 'all';
    });
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className={`search-bar-wrapper ${className}`}>
      <div className="search-grid"></div>
      <div id="search-poda">
        <div className="search-glow"></div>
        <div className="search-darkBorderBg"></div>
        <div className="search-darkBorderBg"></div>
        <div className="search-darkBorderBg"></div>

        <div className="search-white"></div>

        <div className="search-border"></div>

        <form id="search-main" onSubmit={handleSearch}>
          <input
            ref={inputRef}
            placeholder="Search movies, series, anime..."
            type="text"
            name="search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
          />
          <div id="search-pink-mask"></div>
          <div className="search-filterBorder"></div>
          
          <button
            type="button"
            id="search-filter-icon"
            aria-label="Filter search"
            onClick={cycleFilter}
            title={`Filter: ${filter === 'all' ? 'All' : filter === 'movie' ? 'Movies' : 'TV Series'}`}
          >
            {filter === 'all' && (
              <div className="filter-content">
                <Film size={14} />
                <Tv size={14} />
              </div>
            )}
            {filter === 'movie' && <Film size={18} strokeWidth={2} />}
            {filter === 'tv' && <Tv size={18} strokeWidth={2} />}
          </button>

          <div id="search-search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              height="24"
              fill="none"
              className="search-icon-svg"
            >
              <circle stroke="url(#searchGradient)" r="8" cy="11" cx="11"></circle>
              <line
                stroke="url(#searchLineGradient)"
                y2="16.65"
                y1="22"
                x2="16.65"
                x1="22"
              ></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="searchGradient">
                  <stop stopColor="#ffffff" offset="0%"></stop>
                  <stop stopColor="#e8e8e8" offset="50%"></stop>
                </linearGradient>
                <linearGradient id="searchLineGradient">
                  <stop stopColor="#e8e8e8" offset="0%"></stop>
                  <stop stopColor="#b8b8b8" offset="50%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </form>
      </div>
    </div>
  );
}
