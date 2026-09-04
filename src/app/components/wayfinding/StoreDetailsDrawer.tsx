import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  X,
  Clock,
  Phone,
  MapPin,
  Building,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Compass,
} from 'lucide-react';
import {
  WayfindingStore,
  WayfindingLocation,
  FloorId,
  FLOOR_LABELS,
  CATEGORIES,
  PathResult,
} from '../../../types/wayfinding';
import styles from './Wayfinding.module.css';

interface StoreDetailsDrawerProps {
  currentFloor: FloorId;
  selectedStore: WayfindingStore | null;
  selectedLocation: WayfindingLocation | null;
  startLocation: { name: string; floorId: FloorId } | null;
  routeResult: PathResult | null;
  floorLocations: WayfindingLocation[];
  onGetDirections: () => void;
  onCloseDetails: () => void;
  onCloseDirections: () => void;
}

export const StoreDetailsDrawer: React.FC<StoreDetailsDrawerProps> = ({
  currentFloor,
  selectedStore,
  selectedLocation,
  startLocation,
  routeResult,
  floorLocations,
  onGetDirections,
  onCloseDetails,
  onCloseDirections,
}) => {
  const isNavigating = Boolean(routeResult);
  const hasSelection = Boolean(selectedStore || selectedLocation);

  const getCategoryBadge = () => {
    const catKey = selectedStore?.cat || selectedLocation?.cat || 'shop';
    const catInfo = CATEGORIES[catKey] || CATEGORIES.shop || { label: 'Retail', color: '#801424' };
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

  const shutterLabel =
    selectedStore?.shutters?.[0]?.split(':')[1] || selectedLocation?.id || 'Main';

  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHandle} />

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
              className="space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-gray-800/80">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#f87171] mb-1">
                    <Navigation size={14} className="animate-pulse" />
                    <span>Active Route Navigation</span>
                  </div>
                  <h3
                    className="text-lg font-bold text-white leading-tight"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    To {selectedStore?.name || selectedLocation?.name || selectedLocation?.id}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    <Compass size={12} className="text-[#801424]" />
                    <span>From: {startLocation?.name || 'Main Entrance'}</span>
                    <span className="opacity-40">&bull;</span>
                    <span className="text-white font-semibold">Est. {routeResult.estTimeMinutes} min walk</span>
                  </p>
                </div>

                <button
                  className={styles.btnSecondary}
                  onClick={onCloseDirections}
                  title="Close Navigation"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Turn-by-Turn Steps */}
              <div className={styles.stepsList}>
                {routeResult.steps.map((step, idx) => (
                  <div key={idx} className={styles.stepItem}>
                    <div className={styles.stepNum}>{idx + 1}</div>
                    <div className={styles.stepContent}>
                      <p className={styles.stepText}>{step.text}</p>
                      <span className={styles.stepFloorBadge}>
                        {FLOOR_LABELS[step.floorId] || step.floorId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  className={styles.btnSecondary}
                  onClick={onCloseDirections}
                  style={{ width: '100%' }}
                >
                  Close Directions
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
              className="space-y-4"
            >
              {/* Header with Image/Logo if available */}
              {selectedStore?.image && (
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  <img
                    src={selectedStore.image}
                    alt={selectedStore.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11142e] via-transparent to-transparent" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {selectedStore?.logo && (
                    <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-700 flex-shrink-0 shadow-sm overflow-hidden">
                      <img
                        src={selectedStore.logo}
                        alt={selectedStore.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    {getCategoryBadge()}
                    <h2
                      className="text-xl font-bold text-white mt-1 leading-snug"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {selectedStore?.name || selectedLocation?.name || selectedLocation?.id}
                    </h2>
                  </div>
                </div>

                <button
                  className={styles.btnSecondary}
                  onClick={onCloseDetails}
                  title="Close Details"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Location & Floor Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                  <MapPin size={14} className="text-[#801424] flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">Floor Level</span>
                    <strong className="text-white">{FLOOR_LABELS[currentFloor]}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                  <Building size={14} className="text-[#801424] flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">Unit / Shutter</span>
                    <strong className="text-white">Unit {shutterLabel}</strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedStore?.desc && (
                <p className="text-xs text-gray-300 leading-relaxed font-light">
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
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                <button
                  className={styles.btnPrimary}
                  onClick={onGetDirections}
                >
                  <Navigation size={15} />
                  <span>Get Directions</span>
                  <ArrowRight size={13} />
                </button>

                {selectedStore?.slug ? (
                  <Link
                    to={`/shops/details/${selectedStore.slug}`}
                    className={styles.btnSecondaryAction}
                  >
                    <Building size={15} />
                    <span>Store Details</span>
                    <ExternalLink size={13} />
                  </Link>
                ) : (
                  <Link
                    to="/shops/directory"
                    className={styles.btnSecondaryAction}
                  >
                    <Building size={15} />
                    <span>Store Details</span>
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            /* 3. DEFAULT FLOOR SUMMARY VIEW */
            <motion.div
              key="default-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
                  <Sparkles className="text-[#801424]" size={16} />
                  <span style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
                    {FLOOR_LABELS[currentFloor]} Directory Overview
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
                  {floorLocations.length} Shutter Spaces
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Click any store or shutter unit on the interactive map to inspect outlet details, operating hours, and calculate live turn-by-turn walking directions.
              </p>

              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{floorLocations.filter((l) => !['stairs', 'elevator', 'restroom', 'service', 'void', 'atrium'].includes(l.cat)).length}</div>
                  <div className={styles.statLabel}>Shops & Eateries</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{floorLocations.filter((l) => l.cat === 'restroom').length || 2}</div>
                  <div className={styles.statLabel}>Restrooms</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{floorLocations.filter((l) => ['stairs', 'elevator'].includes(l.cat)).length || 3}</div>
                  <div className={styles.statLabel}>Lifts / Stairs</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
