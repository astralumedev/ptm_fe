import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { WayfindingStore, FloorId } from '../../../types/wayfinding';
import { fill, firstUnit, useFloorTexts, useMapCategories, useMapCopy } from './useMapContent';
import styles from './Wayfinding.module.css';
import { EntryMark, entryColor, entryKindLabel, searchEntries } from './mapEntries';
import { PLACE_CAT } from '../../../services/wayfindingService';

interface WayfindingHeaderProps {
  stores: WayfindingStore[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onSelectStore: (store: WayfindingStore) => void;
  /** Pre-filled search text, e.g. from /mall-map?search=… */
  initialQuery?: string;
}

const AMENITY_KEYS = ['restroom', 'elevator', 'stairs'];

export const WayfindingHeader: React.FC<WayfindingHeaderProps> = ({
  stores,
  activeCategory,
  onCategoryChange,
  onSelectStore,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const copy = useMapCopy();
  const { names: floorNames } = useFloorTexts();
  const categories = useMapCategories();

  const suggestions = searchEntries(stores, searchQuery, categories);
  const hasPlaces = stores.some((s) => s.kind === 'place');

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
    <div className={styles.headerControlsBar}>
      {/* Search Input Box */}
      <div className={styles.searchBox} ref={searchRef}>
        <Search className={styles.searchIcon} size={16} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={copy.searchPlaceholder}
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
              const color = entryColor(store, categories);
              const unit = firstUnit(store.shutters);

              return (
                <div
                  key={store.id}
                  className={styles.suggestionItem}
                  onClick={() => handleSelectSuggestion(store)}
                >
                  <EntryMark entry={store} size={32} radius={8} />

                  <div className={styles.suggestionDetails}>
                    <div className={styles.suggestionName}>{store.name}</div>
                    <div className={styles.suggestionFloor}>
                      <MapPin size={10} className="inline mr-1 text-[#801424]" />
                      {unit && store.floor ? (
                        <>
                          {floorNames[store.floor as FloorId] || store.floor}
                          <span className="mx-1.5 opacity-40">&bull;</span>
                          <span className={styles.suggestionShutter}>{fill(copy.unitLabel, { unit })}</span>
                        </>
                      ) : (
                        <span className={styles.suggestionShutter}>{copy.notPlaced}</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={styles.suggestionCategoryBadge}
                    style={{ backgroundColor: `${color}25`, color, borderColor: `${color}50` }}
                  >
                    {entryKindLabel(store, categories)}
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
          <option value="">{fill(copy.allCategories, { count: categories.visible.length })}</option>
          {categories.visible.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.shortName || cat.name}
            </option>
          ))}
          {hasPlaces && <option value={PLACE_CAT}>{categories.info(PLACE_CAT).label}</option>}
          {AMENITY_KEYS.map((key) => (
            <option key={key} value={key}>
              {categories.info(key).label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
