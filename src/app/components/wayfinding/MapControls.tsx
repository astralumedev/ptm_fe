import React from 'react';
import { QrCode, Plus, Minus, Maximize2 } from 'lucide-react';
import styles from './Wayfinding.module.css';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToggleQrSim: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onToggleQrSim,
}) => {
  return (
    <div
      className={styles.floatingControlsStack}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className={styles.controlBtnGroup}>
        <button className={styles.controlBtn} onClick={onZoomIn} title="Zoom In" aria-label="Zoom in">
          <Plus size={18} />
        </button>
        <button className={styles.controlBtn} onClick={onZoomOut} title="Zoom Out" aria-label="Zoom out">
          <Minus size={18} />
        </button>
        <button
          className={`${styles.controlBtn} ${styles.fitBtn}`}
          onClick={onZoomFit}
          title="Fit Floor to Screen"
          aria-label="Fit floor to screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <button
        className={styles.controlBtn}
        onClick={onToggleQrSim}
        title="Simulate QR Code Entrance / You Are Here"
        aria-label="Select entrance location"
      >
        <QrCode size={18} />
      </button>
    </div>
  );
};
