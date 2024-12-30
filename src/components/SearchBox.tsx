import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { countries } from '../data/countries';
import { useDebounce } from '../hooks/useDebounce';

export function SearchBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const filteredSuggestions = debouncedSearchTerm
    ? countries.filter(country => 
        country.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).slice(0, 5)
    : countries.slice(0, 5);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    const maxIndex = searchTerm 
      ? filteredSuggestions.length 
      : filteredSuggestions.length - 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex(prev => (prev >= maxIndex ? -1 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex(prev => (prev <= -1 ? maxIndex : prev - 1));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[15vh]">
      <div
        ref={containerRef}
        className="w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search countries..."
            className="w-full pl-11 pr-10 py-3 border-b focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-2 top-2 p-1.5 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                focusIndex === index ? 'bg-gray-100' : ''
              }`}
              onMouseEnter={() => setFocusIndex(index)}
            >
              {suggestion}
            </button>
          ))}
          
          {searchTerm && (
            <div className="px-4 py-3 text-sm text-gray-500 border-t">
              Press enter to search for "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}