import { FloorId } from '../../../types/wayfinding';
import styles from './Wayfinding.module.css';

interface FloorSelectorProps {
  currentFloor: FloorId;
  onFloorChange: (floor: FloorId) => void;
}

const FLOOR_ITEMS: Array<{ id: FloorId; short: string; label: string; desc: string }> = [
  { id: 'lower_ground_floor', short: 'LG', label: 'Lower Ground', desc: 'Basement Parking & Groceries' },
  { id: 'ground_floor', short: 'G', label: 'Ground Floor', desc: 'Jewelry, Tech & Banking' },
  { id: 'first_floor', short: '1F', label: '1st Floor', desc: 'Fashion, Denim & Footwear' },
  { id: 'second_floor', short: '2F', label: '2nd Floor', desc: 'Kids, Couture & Java Cafe' },
  { id: 'third_floor', short: '3F', label: '3rd Floor', desc: 'Education & Luxury Spas' },
  { id: 'fourth_floor', short: '4F', label: '4th Floor', desc: 'Food Court & Engineering' },
  { id: 'fifth_floor', short: '5F', label: '5th Floor', desc: 'QFX Cineplex & 4D VR' },
];

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onFloorChange,
}) => {
  return (
    <div
      className={styles.floorSelectorPills}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {FLOOR_ITEMS.map((item) => {
        const isSelected = currentFloor === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onFloorChange(item.id)}
            className={`${styles.floorPillBtn} ${isSelected ? styles.floorPillBtnActive : ''}`}
            title={`${item.label} — ${item.desc}`}
          >
            <span className={styles.floorPillShort}>{item.short}</span>
            <span className={styles.floorPillLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
