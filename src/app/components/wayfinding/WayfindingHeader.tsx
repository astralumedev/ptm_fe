import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { WayfindingStore, CATEGORIES, FLOOR_LABELS, FloorId } from '../../../types/wayfinding';
import styles from './Wayfinding.module.css';

interface WayfindingHeaderProps {
  stores: WayfindingStore[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onSelectStore: (store: WayfindingStore) => void;
}

export const WayfindingHeader: React.FC<WayfindingHeaderProps> = ({
  stores,
  activeCategory,
  onCategoryChange,
  onSelectStore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter search suggestions
  const suggestions = searchQuery.trim()
    ? stores
        .filter((store) => {
          const q = searchQuery.toLowerCase();
          const matchName = store.name.toLowerCase().includes(q);
          const matchCat = store.cat.toLowerCase().includes(q);
          const matchShutter = store.shutters?.some((s) => s.toLowerCase().includes(q));
          return matchName || matchCat || matchShutter;
        })
        .slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (store: WayfindingStore) => {
    setSearchQuery(store.name);
    setIsPopoverOpen(false);
    onSelectStore(store);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        <Link to="/" className={styles.logo} title="Return to Pokhara Trade Mall Home">
          <img
            src="/tm_logo_tp.png"
            alt="Pokhara Trade Mall Logo"
            className={styles.logoImg}
          />
          <div className={styles.logoText}>
            <h1>POKHARA TRADE MALL</h1>
            <span>MALL WAYFINDING MAP</span>
          </div>
        </Link>

        <div className={styles.searchBox} ref={searchRef}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search stores, brands, services..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsPopoverOpen(true);
            }}
            onFocus={() => setIsPopoverOpen(true)}
          />
          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setSearchQuery('');
                setIsPopoverOpen(false);
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {isPopoverOpen && suggestions.length > 0 && (
            <div className={styles.suggestionsPopover}>
              {suggestions.map((store) => {
                const catInfo = CATEGORIES[store.cat] || CATEGORIES.service;
                const shutterLabel =
                  store.shutters && store.shutters[0]
                    ? store.shutters[0].split(':')[1] || store.id
                    : store.id;

                return (
                  <div
                    key={store.id}
                    className={styles.suggestionItem}
                    onClick={() => handleSelectSuggestion(store)}
                  >
                    <span className={styles.suggestionShutter}>{shutterLabel}</span>
                    <div className={styles.suggestionDetails}>
                      <div className={styles.suggestionName}>{store.name}</div>
                      <div className={styles.suggestionFloor}>
                        {store.floor
                          ? FLOOR_LABELS[store.floor as FloorId] || store.floor
                          : 'Ground Floor'}
                      </div>
                    </div>
                    <div
                      className={styles.suggestionDot}
                      style={{ backgroundColor: catInfo.color }}
                      title={catInfo.label}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.categorySelectContainer}>
        <select
          className={styles.selectInput}
          value={activeCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORIES)
            .filter(([k]) => !['stairs', 'elevator', 'restroom', 'service', 'void', 'atrium'].includes(k))
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
        </select>
      </div>
    </header>
  );
};
