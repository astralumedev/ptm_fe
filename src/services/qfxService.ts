// Centralized service for QFX Cinemas data with 1-day local caching

const CACHE_KEY = 'ptm_qfx_movies_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface QfxRawRecord {
  movie_id: number | string;
  original_movie_title?: string;
  title?: string;
  rating?: string;
  runtime?: number;
  mrrdr_runtime?: number;
  genres?: { g_name: string }[];
  movie_languages?: { lang_name: string }[];
  movie_content?: {
    artwork?: string;
    mc_plot?: string;
    director?: string;
    cast?: string;
  }[];
  showCount?: number;
  is_upcoming?: string;
  original_release_date?: string;
  screens?: any[];
}

export interface ParsedQfxMovie {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: string;
  duration: string;
  format: string;
  posterUrl: string;
  synopsis: string;
  releaseDate?: string;
  director?: string;
  cast?: string;
  bookingUrl: string;
  isUpcoming: boolean;
  showCount: number;
}

interface CachePayload {
  date: string; // YYYY-MM-DD
  timestamp: number;
  movies: ParsedQfxMovie[];
}

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseQfxRecords(records: any[]): ParsedQfxMovie[] {
  if (!Array.isArray(records)) return [];

  return records
    .map((m: any) => {
      const id = String(m.movie_id || '');
      const title = m.original_movie_title || m.title || 'Movie';
      const rating = m.rating || 'PG';
      const mins = m.runtime || m.mrrdr_runtime || 120;
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      const duration = hours > 0 ? `${hours}h ${remMins.toString().padStart(2, '0')}m` : `${mins}m`;

      const genres = (m.genres || []).map((g: any) => g.g_name).filter(Boolean);
      const genre = genres.length > 0 ? genres.join(' / ') : 'Drama';

      const langs = (m.movie_languages || []).map((l: any) => l.lang_name).filter(Boolean);
      const language = langs.length > 0 ? langs.join(' / ') : 'Nepali';

      const mc = m.movie_content || [];
      const artwork = mc[0]?.artwork || '';
      const synopsis = mc[0]?.mc_plot || '';
      const director = mc[0]?.director || '';
      const cast = mc[0]?.cast || '';

      const showCount = typeof m.showCount === 'number' ? m.showCount : 0;
      const isUpcoming = showCount < 7 || m.is_upcoming === 'Y';

      let releaseDate: string | undefined;
      if (m.original_release_date) {
        try {
          releaseDate = new Date(m.original_release_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } catch {
          // ignore
        }
      }

      return {
        id,
        title,
        genre,
        language,
        rating,
        duration,
        format: '2D / 3D ATMOS',
        posterUrl: artwork,
        synopsis,
        director,
        cast,
        releaseDate,
        bookingUrl: `https://www.qfxcinemas.com/movie/${id}`,
        isUpcoming,
        showCount,
      };
    })
    .filter((m) => Boolean(m.posterUrl));
}

/**
 * Synchronously retrieves cached QFX movies if valid and from today/within 24h.
 */
export function getCachedQfxMovies(): ParsedQfxMovie[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const payload: CachePayload = JSON.parse(raw);
    const today = getTodayKey();
    const isToday = payload.date === today;
    const isFresh = Date.now() - payload.timestamp < CACHE_TTL_MS;

    if ((isToday || isFresh) && Array.isArray(payload.movies) && payload.movies.length > 0) {
      return payload.movies;
    }
  } catch {
    // ignore corrupted cache
  }
  return null;
}

/**
 * Saves movies to localStorage cache.
 */
export function saveCachedQfxMovies(movies: ParsedQfxMovie[]): void {
  try {
    const payload: CachePayload = {
      date: getTodayKey(),
      timestamp: Date.now(),
      movies,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be full or disabled
  }
}

/**
 * Fetches latest movies from QFX API with 1-day caching.
 */
export async function fetchQfxMoviesWithCache(): Promise<ParsedQfxMovie[]> {
  // Check cache first
  const cached = getCachedQfxMovies();
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    const res = await fetch('https://web-api.qfxcinemas.com/api/v3/external/available-movie-shows', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const records = data?.Records || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No records returned from QFX API');
    }

    const parsed = parseQfxRecords(records);
    if (parsed.length > 0) {
      saveCachedQfxMovies(parsed);
      return parsed;
    }
    throw new Error('No valid movies parsed');
  } catch (err) {
    // If network fails, try returning any existing cache even if slightly stale
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const payload: CachePayload = JSON.parse(raw);
        if (Array.isArray(payload.movies) && payload.movies.length > 0) {
          return payload.movies;
        }
      }
    } catch {
      // ignore
    }
    throw err;
  }
}
