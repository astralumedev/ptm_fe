import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  X,
  Clock,
  Phone,
  MapPin,
  Building,
  Layers,
  ExternalLink,
  ArrowRight,
  Compass,
  Search,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import {
  WayfindingStore,
  WayfindingLocation,
  FloorId,
  PathResult,
} from '../../../types/wayfinding';
import { SECTORS } from '../../../content/blocks/categories';
import { PLACE_CAT } from '../../../services/wayfindingService';
import { FloorOverview } from './FloorOverview';
import { EntryMark, entryColor, entryKindLabel, searchEntries } from './mapEntries';
import { fill, firstUnit, useFloorTexts, useMapCategories, useMapCopy } from './useMapContent';

const AMENITY_KEYS = ['elevator', 'stairs', 'restroom'];
import styles from './Wayfinding.module.css';

interface StoreDetailsDrawerProps {
  currentFloor: FloorId;
  stores: WayfindingStore[];
  activeCategory: string | null;
  selectedStore: WayfindingStore | null;
  selectedLocation: WayfindingLocation | null;
  startLocation: { name: string; floorId: FloorId } | null;
  routeResult: PathResult | null;
  activeStepIndex: number;
  floorLocations: WayfindingLocation[];
  onCategoryChange: (cat: string | null) => void;
  onSelectStore: (store: WayfindingStore) => void;
  onGetDirections: () => void;
  onStepChange: (index: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  /** Plays the walking animation for the current step again. */
  onReplay?: () => void;
  onCloseDetails: () => void;
  onCloseDirections: () => void;
}

export const StoreDetailsDrawer: React.FC<StoreDetailsDrawerProps> = ({
  currentFloor,
  stores,
  activeCategory,
  selectedStore,
  selectedLocation,
  startLocation,
  routeResult,
  activeStepIndex,
  floorLocations,
  onCategoryChange,
  onSelectStore,
  onGetDirections,
  onStepChange,
  onNextStep,
  onPrevStep,
  onReplay,
  onCloseDetails,
  onCloseDirections,
}) => {
  const copy = useMapCopy();
  const { names: FLOOR_LABELS } = useFloorTexts();
  const categories = useMapCategories();
  const isNavigating = Boolean(routeResult);
  const hasSelection = Boolean(selectedStore || selectedLocation);

  // Mobile Bottom Sheet State: 'peek' (minimal ~72px) | 'expanded' (~52vh) | 'full' (~82vh)
  const [sheetMode, setSheetMode] = useState<'peek' | 'expanded' | 'full'>('peek');
  const touchStartY = useRef<number | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // While navigating on a phone, keep the sheet low so the walk on the map stays in view.
  useEffect(() => {
    if (isNavigating) setSheetMode(window.innerWidth < 1024 ? 'peek' : 'expanded');
  }, [isNavigating]);

  // Handle Swipe Gesture on Handle Area
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    // Swiped up (deltaY negative) -> Expand
    if (deltaY < -35) {
      setSheetMode((prev) => (prev === 'peek' ? 'expanded' : 'full'));
    }
    // Swiped down (deltaY positive) -> Minimize / Peek
    else if (deltaY > 35) {
      setSheetMode((prev) => (prev === 'full' ? 'expanded' : 'peek'));
    }
    touchStartY.current = null;
  };

  const toggleSheetMode = () => {
    setSheetMode((prev) => (prev === 'peek' ? 'expanded' : 'peek'));
  };

  const suggestions = useMemo(() => searchEntries(stores, searchQuery, categories), [searchQuery, stores, categories]);
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
    setSearchQuery('');
    setIsPopoverOpen(false);
    onSelectStore(store);
  };

  // Stores present on current floor
  const floorCounts = useMemo(() => {
    const here = stores.filter((s) => s.shutters?.some((k) => k.startsWith(`${currentFloor}:`)));
    const places = here.filter((s) => s.kind === 'place').length;
    return { stores: here.length - places, places };
  }, [stores, currentFloor]);

  const getCategoryBadge = () => {
    const catInfo = selectedStore
      ? { color: entryColor(selectedStore, categories), label: selectedStore.kind === 'place' ? categories.info(PLACE_CAT).label : entryKindLabel(selectedStore, categories) }
      : categories.info(selectedLocation?.cat || 'shop', categories.info('shop'));
    return (
      <span
        className={styles.drawerCategoryBadge}
        style={{
          backgroundColor: `${catInfo.color}25`,
          color: catInfo.color,
          borderColor: `${catInfo.color}60`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full inline-block mr-1"
          style={{ backgroundColor: catInfo.color }}
        />
        {catInfo.label}
      </span>
    );
  };

  const selectedUnit = firstUnit(selectedStore?.shutters) || selectedLocation?.id;
  const unitText = selectedUnit ? fill(copy.unitLabel, { unit: selectedUnit }) : copy.notPlaced;
  // Floor shown for the selection: the store's own floor when it is not on the floor being viewed
  const selectionFloor = ((selectedStore && !selectedLocation && selectedStore.floor) || currentFloor) as FloorId;

  const drawerClass = `${styles.drawer} ${
    sheetMode === 'peek'
      ? styles.drawerPeek
      : sheetMode === 'full'
      ? styles.drawerFull
      : styles.drawerExpanded
  }`;

  return (
    <div
      className={drawerClass}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Mobile Drag Handle & Swipe Zone */}
      <div
        className={styles.drawerHandleArea}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={toggleSheetMode}
        role="button"
        tabIndex={0}
        aria-label={sheetMode === 'peek' ? 'Expand details sheet' : 'Minimize details sheet'}
      >
        <div className={styles.drawerHandle} />
      </div>

      {/* Mobile Peek State Quick Action Bar (Visible only when peeked on mobile) */}
      {sheetMode === 'peek' && (
        <div
          className={styles.drawerPeekBar}
          onClick={toggleSheetMode}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isNavigating && routeResult ? (
            <>
              <div className={styles.drawerPeekInfo}>
                <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Navigation size={15} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className={styles.drawerPeekTitle}>
                    {fill(copy.peekStep, { n: activeStepIndex + 1, text: routeResult.steps[activeStepIndex]?.text || copy.navigating })}
                  </div>
                  <div className={styles.drawerPeekSubtitle}>
                    <span>{FLOOR_LABELS[routeResult.steps[activeStepIndex]?.floorId || currentFloor]}</span>
                    <span>&bull;</span>
                    <span>{fill(copy.walkTime, { minutes: routeResult.estTimeMinutes })}</span>
                  </div>
                </div>
              </div>

              <div className={styles.drawerPeekActions} onClick={(e) => e.stopPropagation()}>
                {activeStepIndex < routeResult.steps.length - 1 ? (
                  <button className={styles.drawerPeekBtn} onClick={onNextStep}>
                    <span>{copy.next}</span>
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <button className={styles.drawerPeekBtn} onClick={onCloseDirections} style={{ backgroundColor: '#059669' }}>
                    <span>{copy.finish}</span>
                  </button>
                )}
                <button
                  className={styles.drawerToggleBtn}
                  onClick={toggleSheetMode}
                  title="Expand Route Details"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </>
          ) : hasSelection ? (
            <>
              <div className={styles.drawerPeekInfo}>
                {selectedStore ? <EntryMark entry={selectedStore} size={32} radius={8} /> : (
                  <div className="w-8 h-8 rounded-lg bg-[#801424]/20 border border-[#801424]/40 flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} className="text-red-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className={styles.drawerPeekTitle}>
                    {selectedStore?.name || selectedLocation?.name || selectedLocation?.id}
                  </div>
                  <div className={styles.drawerPeekSubtitle}>
                    <span>{FLOOR_LABELS[selectionFloor]}</span>
                    <span>&bull;</span>
                    <span>{unitText}</span>
                  </div>
                </div>
              </div>

              <div className={styles.drawerPeekActions} onClick={(e) => e.stopPropagation()}>
                {selectedLocation && (
                  <button
                    className={styles.drawerPeekBtn}
                    onClick={() => {
                      setSheetMode('expanded');
                      onGetDirections();
                    }}
                  >
                    <Navigation size={12} />
                    <span>{copy.go}</span>
                  </button>
                )}
                <button
                  className={styles.drawerToggleBtn}
                  onClick={toggleSheetMode}
                  title="Expand Details"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  className={styles.drawerToggleBtn}
                  onClick={onCloseDetails}
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.drawerPeekInfo}>
                <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 flex items-center justify-center flex-shrink-0">
                  <Layers size={16} />
                </div>
                <div className="min-w-0">
                  <div className={styles.drawerPeekTitle}>{FLOOR_LABELS[currentFloor]}</div>
                  <div className={styles.drawerPeekSubtitle}>
                    <span>{fill(copy.storesCount, { count: floorCounts.stores })}{floorCounts.places > 0 && ` · ${fill(copy.placesCount, { count: floorCounts.places })}`}</span>
                    <span>&bull;</span>
                    <span className="text-indigo-400">{copy.tapToBrowse}</span>
                  </div>
                </div>
              </div>

              <div className={styles.drawerPeekActions} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.drawerToggleBtn}
                  onClick={toggleSheetMode}
                  title="Expand Directory"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Desktop Sticky Header: Search Bar & Category Filter Chips */}
      <div className={styles.sidebarHeaderSection}>
        {/* Search Input Box with Live Dropdown */}
        <div className={styles.sidebarSearchBox} ref={searchRef}>
          <Search className={styles.searchIcon} size={15} />
          <input
            type="text"
            className={styles.sidebarSearchInput}
            placeholder={copy.sidebarSearchPlaceholder}
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
              <X size={14} />
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
                      <div className={styles.suggestionMeta}>
                        <span
                          className={styles.suggestionCat}
                          style={{ color }}
                        >
                          {entryKindLabel(store, categories)}
                        </span>
                        <span>&bull;</span>
                        <span>{unit ? fill(copy.unitLabel, { unit }) : copy.notPlaced}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Filter Dropdown Control */}
        <div className={styles.sidebarCategorySelectContainer}>
          <div className={styles.sidebarCategorySelectWrapper}>
            <SlidersHorizontal size={13} className={styles.sidebarCategorySelectIcon} />
            <select
              className={styles.sidebarCategorySelect}
              value={activeCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value ? e.target.value : null)}
            >
              <option value="">{copy.sidebarAllCategories}</option>
              {SECTORS.map((sector) => {
                const list = categories.bySector(sector.value);
                if (!list.length) return null;
                return (
                  <optgroup key={sector.value} label={sector.label}>
                    {list.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.shortName || cat.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              {hasPlaces && <option value={PLACE_CAT}>{copy.placesFilter}</option>}
              <optgroup label={copy.amenitiesGroup}>
                {AMENITY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {categories.info(key).label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          {activeCategory && (
            <button
              className={styles.sidebarClearCategoryBtn}
              onClick={() => onCategoryChange(null)}
              title="Clear Category Filter"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.drawerContent}>
        <AnimatePresence mode="wait">
          {/* 1. ACTIVE NAVIGATION ROUTE VIEW */}
          {isNavigating && routeResult ? (
            <motion.div
              key="nav-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              <div className="flex items-start justify-between pb-3 border-b border-gray-800/80">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#f87171] mb-1">
                    <Navigation size={14} className="animate-pulse" />
                    <span>{copy.activeNavigation}</span>
                  </div>
                  <h3
                    className="text-base sm:text-lg font-bold text-white leading-tight"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    {fill(copy.navTo, { name: selectedStore?.name || selectedLocation?.name || selectedLocation?.id || '' })}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                    <Compass size={12} className="text-[#801424] flex-shrink-0" />
                    <span>{fill(copy.navFrom, { name: startLocation?.name || copy.mainEntrance })}</span>
                    <span className="opacity-40">&bull;</span>
                    <span className="text-white font-semibold">
                      {fill(copy.walkTime, { minutes: routeResult.estTimeMinutes })}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setSheetMode('peek')}
                    title={copy.minimize}
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    className={styles.btnSecondary}
                    onClick={onCloseDirections}
                    title="Close Navigation"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Prominent Active Step Banner */}
              {routeResult.steps[activeStepIndex] && (
                <div className={styles.activeStepCard}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={styles.activeStepBadge}>
                        {fill(copy.stepOf, { n: activeStepIndex + 1, total: routeResult.steps.length })}
                      </span>
                      <span className={styles.stepFloorBadge}>
                        {FLOOR_LABELS[routeResult.steps[activeStepIndex].floorId] ||
                          routeResult.steps[activeStepIndex].floorId}
                      </span>
                    </div>
                    {activeStepIndex === routeResult.steps.length - 1 && (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        {copy.destinationFloor}
                      </span>
                    )}
                  </div>

                  <p className={styles.activeStepText}>
                    {routeResult.steps[activeStepIndex].text}
                  </p>
                  {onReplay && (
                    <button onClick={onReplay} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#fca5a5] hover:text-white transition-colors">
                      <RotateCcw size={12} /> {copy.replay}
                    </button>
                  )}

                  {/* Step Action Buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
                    <button
                      className={styles.stepBtnSecondary}
                      onClick={onPrevStep}
                      disabled={activeStepIndex === 0}
                      style={{ opacity: activeStepIndex === 0 ? 0.35 : 1, cursor: activeStepIndex === 0 ? 'default' : 'pointer' }}
                    >
                      {copy.prev}
                    </button>

                    {activeStepIndex < routeResult.steps.length - 1 ? (
                      <button className={styles.stepBtnPrimary} onClick={onNextStep}>
                        <span>{copy.nextStep}</span>
                        <span>&rarr;</span>
                      </button>
                    ) : (
                      <button className={styles.stepBtnPrimarySuccess} onClick={onCloseDirections}>
                        <span>{copy.finishNavigation}</span>
                        <span>✓</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Turn-by-Turn Steps List */}
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{copy.routeSteps}</span>
                  <span className="text-gray-500 font-normal">{copy.routeStepsHint}</span>
                </div>

                <div className={styles.stepsList}>
                  {routeResult.steps.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`${styles.stepItem} ${isActive ? styles.stepItemActive : ''}`}
                        onClick={() => onStepChange(idx)}
                      >
                        <div className={`${styles.stepNum} ${isActive ? styles.stepNumActive : ''}`}>
                          {idx + 1}
                        </div>
                        <div className={styles.stepContent}>
                          <p className={styles.stepText}>{step.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={styles.stepFloorBadge}>
                              {FLOOR_LABELS[step.floorId] || step.floorId}
                            </span>
                            {isActive && (
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                {copy.current}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  className={styles.btnSecondary}
                  onClick={() => setSheetMode('peek')}
                  style={{ flex: 1 }}
                >
                  <ChevronDown size={14} />
                  <span>{copy.minimize}</span>
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={onCloseDirections}
                  style={{ flex: 1 }}
                >
                  {copy.endNavigation}
                </button>
              </div>
            </motion.div>
          ) : hasSelection ? (
            /* 2. SELECTED STORE / LOCATION DETAILS VIEW */
            <motion.div
              key="details-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              {/* Header with Image if available */}
              {selectedStore?.image && (
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  <img loading="lazy" decoding="async"
                    src={selectedStore.image}
                    alt={selectedStore.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e122b] via-transparent to-transparent" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {selectedStore && <EntryMark entry={selectedStore} size={48} radius={12} />}
                  <div className="min-w-0">
                    {getCategoryBadge()}
                    <h2
                      className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug text-balance"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {selectedStore?.name || selectedLocation?.name || selectedLocation?.id}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setSheetMode('peek')}
                    title={copy.minimize}
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    className={styles.btnSecondary}
                    onClick={onCloseDetails}
                    title="Close Details"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Location & Floor Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                  <MapPin size={14} className="text-[#801424] flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">{copy.floorLevel}</span>
                    <strong className="text-white">{FLOOR_LABELS[selectionFloor] || copy.notPlaced}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                  <Building size={14} className="text-[#801424] flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">{copy.unitShutter}</span>
                    <strong className="text-white">{unitText}</strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedStore?.kind === 'place' && selectedStore.subtitle && (
                <p className="text-[13px] text-gray-200 leading-relaxed">{selectedStore.subtitle}</p>
              )}
              {selectedStore?.desc && (
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
                  {selectedStore.desc}
                </p>
              )}

              {/* Hours & Phone */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-1 border-t border-gray-800/80">
                {selectedStore?.hours && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#801424]" />
                    <span>{selectedStore.hours}</span>
                  </div>
                )}
                {selectedStore?.phone && (
                  <a
                    href={`tel:${selectedStore.phone}`}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                  >
                    <Phone size={13} className="text-[#801424]" />
                    <span>{selectedStore.phone}</span>
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 w-full">
                {selectedLocation && (
                  <button className={styles.btnPrimary} onClick={onGetDirections}>
                    <Navigation size={15} />
                    <span>{copy.getDirections}</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                {selectedStore?.kind === 'place' ? (
                  selectedStore.partOf && (
                    <Link to={`/shops/details/${selectedStore.partOf.slug}`} className={styles.btnSecondaryAction}>
                      <Building size={15} />
                      <span>{fill(copy.partOf, { name: selectedStore.partOf.name })}</span>
                      <ExternalLink size={13} />
                    </Link>
                  )
                ) : selectedStore?.slug ? (
                  <Link
                    to={`/shops/details/${selectedStore.slug}`}
                    className={styles.btnSecondaryAction}
                  >
                    <Building size={15} />
                    <span>{copy.storeProfile}</span>
                    <ExternalLink size={13} />
                  </Link>
                ) : (
                  <Link to="/shops/directory" className={styles.btnSecondaryAction}>
                    <Building size={15} />
                    <span>{copy.storeDirectory}</span>
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            /* 3. WHAT'S ON THIS FLOOR */
            <motion.div
              key="default-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FloorOverview
                floorId={currentFloor}
                entries={stores}
                floorLocations={floorLocations}
                activeCategory={activeCategory}
                onSelect={onSelectStore}
                onCategoryChange={onCategoryChange}
                onMinimize={() => setSheetMode('peek')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
