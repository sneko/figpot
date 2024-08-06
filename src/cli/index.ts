#!/usr/bin/env node
import { program } from '@figpot/src/cli/program';
import { gracefulExit } from '@figpot/src/utils/system';

console.warn('--- ⚠️⚠️⚠️ ---');
console.warn(
  'the ownership of this package has been tranferred to https://github.com/betagouv/figpot. Please use `npx @betagouv/figpot` instead of `npx figpot` to benefit from latest updates'
);
console.warn('--- ⚠️⚠️⚠️ ---');

program.parseAsync().catch((error) => {
  gracefulExit(error);
});
