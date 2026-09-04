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
    <>
      <div className={styles.floatingControlsLeft}>
        <button
          className={styles.controlBtn}
          onClick={onToggleQrSim}
          title="Simulate QR Code Entrance Scan"
        >
          <QrCode size={20} />
        </button>
      </div>

      <div className={styles.floatingControlsRight}>
        <button className={styles.controlBtn} onClick={onZoomIn} title="Zoom In">
          <Plus size={20} />
        </button>
        <button className={styles.controlBtn} onClick={onZoomOut} title="Zoom Out">
          <Minus size={20} />
        </button>
        <button
          className={`${styles.controlBtn} ${styles.fitBtn}`}
          onClick={onZoomFit}
          title="Fit Map to Screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </>
  );
};
