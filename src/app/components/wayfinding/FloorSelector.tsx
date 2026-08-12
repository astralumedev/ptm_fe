import React from 'react';
import { FloorId, FLOOR_LABELS } from '../../../types/wayfinding';
import styles from './Wayfinding.module.css';

interface FloorSelectorProps {
  currentFloor: FloorId;
  onFloorChange: (floor: FloorId) => void;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onFloorChange,
}) => {
  return (
    <div className={styles.floorSelectorContainer}>
      <select
        className={styles.floorSelect}
        value={currentFloor}
        onChange={(e) => onFloorChange(e.target.value as FloorId)}
      >
        {Object.entries(FLOOR_LABELS).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
