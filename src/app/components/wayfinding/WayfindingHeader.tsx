import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Store } from 'lucide-react';
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
          const matchCat = (store.cat || '').toLowerCase().includes(q);
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

  // Distinct category keys for dropdown
  const categoryKeys = [
    'womens-fashion',
    'mens-fashion',
    'kids',
    'lingerie',
    'footwear-bags',
    'jewelry-watches',
    'beauty-fragrance',
    'electronics',
    'home-living',
    'handicrafts',
    'thakali',
    'restaurant',
    'cafe',
    'fast-food',
    'cinema',
    'gaming',
    'beauty-wellness',
    'finance',
    'education',
    'it-tech',
    'health-fitness',
    'professional',
    'restroom',
    'elevator',
    'stairs',
  ];

  return (
    <div className={styles.headerControlsBar}>
      {/* Search Input Box */}
      <div className={styles.searchBox} ref={searchRef}>
        <Search className={styles.searchIcon} size={16} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search stores, brands, eateries, services, shutter..."
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
            <X size={15} />
          </button>
        )}

        {/* Autocomplete Suggestions */}
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
                  {/* Thumbnail / Logo */}
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className={styles.suggestionLogo}
                    />
                  ) : (
                    <div className={styles.suggestionLogoFallback}>
                      <Store size={14} />
                    </div>
                  )}

                  <div className={styles.suggestionDetails}>
                    <div className={styles.suggestionName}>{store.name}</div>
                    <div className={styles.suggestionFloor}>
                      <MapPin size={10} className="inline mr-1 text-[#801424]" />
                      {store.floor
                        ? FLOOR_LABELS[store.floor as FloorId] || store.floor
                        : 'Ground Floor'}
                      <span className="mx-1.5 opacity-40">&bull;</span>
                      <span className={styles.suggestionShutter}>Unit {shutterLabel}</span>
                    </div>
                  </div>

                  <span
                    className={styles.suggestionCategoryBadge}
                    style={{ backgroundColor: `${catInfo.color}25`, color: catInfo.color, borderColor: `${catInfo.color}50` }}
                  >
                    {catInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Dropdown */}
      <div className={styles.categorySelectContainer}>
        <select
          className={styles.selectInput}
          value={activeCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
        >
          <option value="">All Categories ({categoryKeys.length})</option>
          {categoryKeys.map((key) => {
            const cat = CATEGORIES[key];
            if (!cat) return null;
            return (
              <option key={key} value={key}>
                {cat.label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};
