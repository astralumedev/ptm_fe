import type { QrPoint } from '../../types/wayfinding';

/** The address printed in a QR code. It carries only the code, so moving the point never needs a reprint. */
export const qrUrl = (code: string) => `${window.location.origin}/q/${encodeURIComponent(code)}`;

const lib = () => import('qrcode');

export async function qrSvg(code: string, color = '#16181d') {
  const QR = await lib();
  return QR.toString(qrUrl(code), { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: color, light: '#ffffff' } });
}

export async function qrPng(code: string, size = 1024) {
  const QR = await lib();
  return QR.toDataURL(qrUrl(code), { errorCorrectionLevel: 'M', margin: 2, width: size, color: { dark: '#16181d', light: '#ffffff' } });
}

function download(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadPng(code: string) { download(await qrPng(code), `ptm-map-${code}.png`); }
export async function downloadSvg(code: string) {
  const url = URL.createObjectURL(new Blob([await qrSvg(code)], { type: 'image/svg+xml' }));
  download(url, `ptm-map-${code}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Opens a print-ready sheet: one A5 sign per QR point with the mall logo, "Scan for directions"
 * in English and Nepali, the point's name and its code (so staff can tell signs apart).
 */
export async function printSigns(points: QrPoint[], floorName: (id: string) => string) {
  const w = window.open('', '_blank');
  if (!w) return false;
  const svgs = await Promise.all(points.map((p) => qrSvg(p.code, '#1f2170')));
  const logo = `${window.location.origin}/tm_logo_nobg.png`;
  const pages = points.map((p, i) => `
    <section class="sign">
      <img class="logo" src="${logo}" alt="" />
      <h1>Scan for directions</h1>
      <p class="np">दिशा निर्देशनका लागि स्क्यान गर्नुहोस्</p>
      <div class="qr">${svgs[i]}</div>
      <p class="here">You are here</p>
      <p class="name">${esc(p.name)}</p>
      <p class="meta">${esc(floorName(p.floorId))} · ${esc(p.code)}</p>
      <p class="hint">Open your phone camera and point it at the code. No app needed.</p>
    </section>`).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Map QR signs</title>
    <style>
      @page { size: A5; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: 'Segoe UI', system-ui, sans-serif; color: #16181d; }
      .sign { width: 148mm; height: 210mm; padding: 14mm 14mm 10mm; display: flex; flex-direction: column; align-items: center; text-align: center; page-break-after: always; border-top: 6mm solid #801424; }
      .logo { height: 16mm; margin-bottom: 6mm; }
      h1 { margin: 0; font-size: 26pt; letter-spacing: -0.02em; color: #1f2170; }
      .np { margin: 2mm 0 7mm; font-size: 14pt; color: #4a505c; }
      .qr { width: 92mm; height: 92mm; padding: 4mm; border: 1.2mm solid #1f2170; border-radius: 6mm; }
      .qr svg { width: 100%; height: 100%; display: block; }
      .here { margin: 7mm 0 0; font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #801424; }
      .name { margin: 1mm 0 0; font-size: 17pt; font-weight: 650; }
      .meta { margin: 1.5mm 0 0; font-size: 10.5pt; color: #6b7280; }
      .hint { margin: auto 0 0; font-size: 9pt; color: #6b7280; }
      @media screen { body { background: #e5e7eb; } .sign { background: #fff; margin: 8mm auto; box-shadow: 0 2px 12px rgba(0,0,0,.15); } }
    </style></head><body>${pages}
    <script>window.onload = () => setTimeout(() => window.print(), 300);</script></body></html>`);
  w.document.close();
  return true;
}
