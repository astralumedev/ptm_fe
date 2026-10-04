import { useMemo } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import type { FloorId, WayfindingLocation, WayfindingStore } from '../../../types/wayfinding';
import { SECTORS, type Sector } from '../../../content/blocks/categories';
import { PLACE_CAT } from '../../../services/wayfindingService';
import { CategoryIcon } from './CategoryIcon';
import { EntryMark, entryKindLabel } from './mapEntries';
import { fill, firstUnit, useFloorTexts, useMapCategories, useMapCopy } from './useMapContent';
import styles from './Wayfinding.module.css';

const FACILITIES = [
  { cat: 'restroom', match: ['restroom'] },
  { cat: 'elevator', match: ['elevator'] },
  { cat: 'stairs', match: ['stairs'] },
] as const;

interface Props {
  floorId: FloorId;
  /** Everything a visitor can look up (stores and places), all floors. */
  entries: WayfindingStore[];
  floorLocations: WayfindingLocation[];
  activeCategory: string | null;
  onSelect: (entry: WayfindingStore) => void;
  onCategoryChange: (cat: string | null) => void;
  onMinimize: () => void;
}

/**
 * "What's on this floor": the floor's places, its stores grouped by sector, and its
 * facilities, which highlight on the plan when tapped. Filtering by a category narrows it
 * to one flat list.
 */
export function FloorOverview({ floorId, entries, floorLocations, activeCategory, onSelect, onCategoryChange, onMinimize }: Props) {
  const copy = useMapCopy();
  const floors = useFloorTexts();
  const categories = useMapCategories();
  const floorText = floors.items.find((f) => f.id === floorId);
  const floorName = floors.names[floorId];

  const here = useMemo(
    () => entries.filter((e) => e.shutters?.some((s) => s.startsWith(`${floorId}:`))).sort((a, b) => a.name.localeCompare(b.name)),
    [entries, floorId],
  );
  const places = here.filter((e) => e.kind === 'place');
  const stores = here.filter((e) => e.kind !== 'place');

  const groups = useMemo(() => {
    const by = new Map<Sector | 'other', WayfindingStore[]>();
    for (const s of stores) {
      const sector = categories.find(s.cat)?.sector || 'other';
      by.set(sector, [...(by.get(sector) || []), s]);
    }
    return [...SECTORS.map((s) => ({ key: s.value, label: s.label })), { key: 'other' as const, label: copy.otherGroup }]
      .map((g) => ({ ...g, items: by.get(g.key) || [] }))
      .filter((g) => g.items.length);
  }, [stores, categories, copy.otherGroup]);

  const facilities = FACILITIES
    .map((f) => ({ ...f, count: floorLocations.filter((l) => (f.match as readonly string[]).includes(l.cat)).length }))
    .filter((f) => f.count > 0);

  const filtered = activeCategory ? here.filter((e) => categories.entryMatches(e, activeCategory)) : null;
  const filterIsFacility = FACILITIES.some((f) => f.cat === activeCategory);

  const row = (e: WayfindingStore) => {
    const unit = firstUnit(e.shutters);
    return (
      <li key={e.id}>
        <button type="button" className={styles.floorRow} onClick={() => onSelect(e)}>
          <EntryMark entry={e} size={34} radius={9} />
          <span className={styles.floorRowText}>
            <span className={styles.floorRowName}>{e.name}</span>
            <span className={styles.floorRowMeta}>
              {entryKindLabel(e, categories)}
              {unit && <><span aria-hidden="true"> · </span>{fill(copy.unitLabel, { unit })}</>}
            </span>
          </span>
          <ChevronRight size={14} className={styles.floorRowChevron} aria-hidden="true" />
        </button>
      </li>
    );
  };

  return (
    <div className={styles.floorOverview}>
      <header className={styles.floorHead}>
        <div className="min-w-0">
          <h2 className={styles.floorTitle}>{fill(copy.directoryTitle, { floor: floorName })}</h2>
          {floorText?.desc && <p className={styles.floorDesc}>{floorText.desc}</p>}
          <p className={styles.floorCounts}>
            {fill(copy.storesCount, { count: stores.length })}
            {places.length > 0 && <><span aria-hidden="true"> · </span>{fill(copy.placesCount, { count: places.length })}</>}
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={onMinimize} title={copy.minimize} aria-label={copy.minimize}>
          <ChevronDown size={15} />
        </button>
      </header>

      {facilities.length > 0 && (
        <div className={styles.facilityRow} role="group" aria-label={copy.facilitiesHeading}>
          {facilities.map((f) => {
            const on = activeCategory === f.cat;
            const color = categories.info(f.cat).color;
            return (
              <button
                key={f.cat}
                type="button"
                aria-pressed={on}
                className={`${styles.facilityChip} ${on ? styles.facilityChipOn : ''}`}
                style={{ ['--chip' as string]: color }}
                onClick={() => onCategoryChange(on ? null : f.cat)}
                title={copy.facilityHint}
              >
                <CategoryIcon category={f.cat} size={14} color={color} />
                <span>{categories.info(f.cat).label}</span>
                <span className={styles.facilityCount}>{f.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {filtered ? (
        filterIsFacility ? (
          <p className={styles.floorNote}>{copy.facilityShown}</p>
        ) : filtered.length ? (
          <section>
            <div className={styles.groupHead}>
              <h3>{categories.info(activeCategory).label}</h3>
              <button className={styles.groupClear} onClick={() => onCategoryChange(null)}><X size={12} /> {copy.clearFilter}</button>
            </div>
            <ul className={styles.floorList}>{filtered.map(row)}</ul>
          </section>
        ) : (
          <div className={styles.floorEmpty}>
            <p>{fill(copy.noMatch, { floor: floorName })}</p>
            <button onClick={() => onCategoryChange(null)}>{copy.clearFilter}</button>
          </div>
        )
      ) : here.length === 0 ? (
        <p className={styles.floorNote}>{fill(copy.floorEmpty, { floor: floorName })}</p>
      ) : (
        <>
          {places.length > 0 && (
            <section>
              <div className={styles.groupHead}>
                <h3>{copy.placesHeading}</h3>
                <button className={styles.groupClear} onClick={() => onCategoryChange(PLACE_CAT)}>{copy.showOnMap}</button>
              </div>
              <ul className={styles.floorList}>{places.map(row)}</ul>
            </section>
          )}
          {groups.map((g) => (
            <section key={g.key}>
              <div className={styles.groupHead}>
                <h3>{g.label}</h3>
                <span className={styles.groupCount}>{g.items.length}</span>
              </div>
              <ul className={styles.floorList}>{g.items.map(row)}</ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
