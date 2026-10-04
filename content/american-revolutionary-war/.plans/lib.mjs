// The generators in this folder use the shared plan helpers, bound to this story. See scripts/plans.mjs.
import { fileURLToPath } from 'url';
import { planWriter } from '../../../scripts/plans.mjs';
export { frame } from '../../../scripts/plans.mjs';
export const writePlan = planWriter(fileURLToPath(new URL('..', import.meta.url)));
