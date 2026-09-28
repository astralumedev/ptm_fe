import { request } from './http';
import type { FloorData, FloorId, QrPoint } from '../../types/wayfinding';

export interface QrRow {
  code: string;
  data: Omit<QrPoint, 'code'>;
  scans: number;
  last_scan_at: string | null;
  created_at?: string;
}

export interface MapVersion { id: number; note: string | null; created_at: string }

export const mapApi = {
  load: () => request<{ floors: { id: FloorId; data: FloorData; updated_at: string }[]; qr: QrRow[] }>('/api/admin/map'),
  history: (floor: FloorId) => request<{ items: MapVersion[] }>(`/api/admin/map?history=${floor}`),
  version: (id: number) => request<{ version: { id: number; floor_id: FloorId; data: FloorData; note: string | null; created_at: string } }>(`/api/admin/map?version=${id}`),
  save: (floors: Partial<Record<FloorId, FloorData>>, stores: { id: number; mapFloor: string; mapUnits: string[] }[], note?: string) =>
    request<{ ok: true; saved: FloorId[] }>('/api/admin/map', { method: 'POST', json: { action: 'save', floors, stores, note } }),
  saveQr: (code: string, data: Omit<QrPoint, 'code'>, previousCode?: string) =>
    request<{ item: QrRow }>('/api/admin/map', { method: 'POST', json: { action: 'qr', code, data, previousCode } }),
  deleteQr: (code: string) => request('/api/admin/map', { method: 'POST', json: { action: 'deleteQr', code } }),
};
