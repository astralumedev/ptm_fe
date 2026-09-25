// Regenerates api/_lib/seed.json from the in-repo mock data. Run: npm run seed:export
import { writeFileSync } from 'fs';
import { mockStores, mockBlogs, mockSiteSettings, mockPages } from '../src/data/mockMallData';
import { mockEvents, mockOffers } from '../src/data/latestData';

const seed = {
  stores: mockStores,
  blogs: mockBlogs,
  pages: mockPages,
  events: mockEvents,
  offers: mockOffers,
  settings: mockSiteSettings,
};
writeFileSync('api/_lib/seed.json', JSON.stringify(seed));
console.log('seed.json written');
