import { FloorId } from '../../../types/wayfinding';
import styles from './Wayfinding.module.css';
import { useFloorTexts } from './useMapContent';

interface FloorSelectorProps {
  currentFloor: FloorId;
  onFloorChange: (floor: FloorId) => void;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onFloorChange,
}) => {
  const { items } = useFloorTexts();
  return (
    <div
      className={styles.floorSelectorPills}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {items.map((item) => {
        const isSelected = currentFloor === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onFloorChange(item.id)}
            className={`${styles.floorPillBtn} ${isSelected ? styles.floorPillBtnActive : ''}`}
            title={item.desc ? `${item.label} — ${item.desc}` : item.label}
          >
            <span className={styles.floorPillShort}>{item.short}</span>
            <span className={styles.floorPillLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
