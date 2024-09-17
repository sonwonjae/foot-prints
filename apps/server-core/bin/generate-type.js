/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

execSync(
  `npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID} > ${path.resolve(__dirname, '../src/supabase/supabase.types.ts')}`,
  { stdio: 'pipe' },
);
