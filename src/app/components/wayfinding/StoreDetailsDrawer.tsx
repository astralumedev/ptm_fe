import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, Clock, Phone, MapPin, Building, Sparkles } from 'lucide-react';
import {
  WayfindingStore,
  WayfindingLocation,
  FloorId,
  FLOOR_LABELS,
  CATEGORIES,
  PathResult
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
  const shopCount = floorLocations.filter((l) => l.cat === 'shop').length;
  const restroomCount = floorLocations.filter((l) => l.cat === 'restroom').length;
  const transitCount = floorLocations.filter((l) => ['stairs', 'elevator'].includes(l.cat)).length;

  const isNavigating = Boolean(routeResult);
  const hasSelection = Boolean(selectedStore || selectedLocation);

  const getCategoryBadge = () => {
    const catKey = selectedStore?.cat || selectedLocation?.cat || 'service';
    const catInfo = CATEGORIES[catKey] || CATEGORIES.service;
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5"
        style={{ backgroundColor: catInfo.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        {catInfo.label}
      </span>
    );
  };

  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHandle} />

      <div className={styles.drawerContent}>
        <AnimatePresence mode="wait">
          {isNavigating && routeResult ? (
            <motion.div
              key="nav-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-arizona-flare">
                    <Navigation className="text-[#f87171]" size={20} />
                    Wayfinding Navigation
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    From {startLocation?.name || 'Entrance'} &bull; Est. {routeResult.estTimeMinutes} min walk
                  </p>
                </div>

                <button
                  className={styles.btnSecondary}
                  onClick={onCloseDirections}
                  title="Close Navigation"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.stepsList}>
                {routeResult.steps.map((step, idx) => (
                  <div key={idx} className={styles.stepItem}>
                    <div className={styles.stepNum}>{idx + 1}</div>
                    <div className={styles.stepText}>{step.text}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : hasSelection ? (
            <motion.div
              key="details-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  {getCategoryBadge()}
                  <h2 className="text-xl font-extrabold text-white mt-2 font-arizona-flare">
                    {selectedStore?.name || selectedLocation?.name || selectedLocation?.id}
                  </h2>
                </div>

                <button
                  className={styles.btnSecondary}
                  onClick={onCloseDetails}
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-300">
                <div className="flex items-center gap-2 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800">
                  <MapPin size={14} className="text-[#f87171]" />
                  <div>
                    <span className="text-gray-500 block text-[10px]">Floor</span>
                    {FLOOR_LABELS[currentFloor]}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800">
                  <Building size={14} className="text-[#f87171]" />
                  <div>
                    <span className="text-gray-500 block text-[10px]">Location / Shutter</span>
                    {selectedStore?.shutters?.[0]?.split(':')[1] || selectedLocation?.id || 'Main'}
                  </div>
                </div>
              </div>

              {selectedStore?.desc && (
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  {selectedStore.desc}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                {selectedStore?.hours && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-500" />
                    <span>{selectedStore.hours}</span>
                  </div>
                )}
                {selectedStore?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-500" />
                    <span>{selectedStore.phone}</span>
                  </div>
                )}
              </div>

              <button className={styles.btnPrimary} onClick={onGetDirections}>
                <Navigation size={18} />
                Get Directions
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="default-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-gray-200 font-arizona-flare">
                <Sparkles className="text-[#f87171]" size={18} />
                <span>{FLOOR_LABELS[currentFloor]} Directory Summary</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select any store or location on the map to inspect details or calculate route directions.
              </p>

              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{shopCount}</div>
                  <div className={styles.statLabel}>Stores</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{restroomCount}</div>
                  <div className={styles.statLabel}>Restrooms</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{transitCount}</div>
                  <div className={styles.statLabel}>Stairs/Lifts</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
