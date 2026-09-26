// Refreshes the site-section (block) part of api/_lib/seed.json from the block definitions.
// Run after adding or changing a block: npm run seed:blocks
// The next admin sign-in inserts any block the database does not have yet; existing ones are untouched.
import { readFileSync, writeFileSync } from 'fs';
import { ALL_BLOCKS } from '../src/content/blocks';

const path = 'api/_lib/seed.json';
const seed = JSON.parse(readFileSync(path, 'utf8'));
seed.blocks = ALL_BLOCKS.map((b) => ({ slug: b.key, status: 'published', ...b.defaults }));
writeFileSync(path, JSON.stringify(seed));
console.log(`seed.json: ${seed.blocks.length} blocks`);
