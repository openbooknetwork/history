// The generators in this folder use harita's plan helpers, bound to this story.
import { fileURLToPath } from 'url';
import { planWriter } from '@openhistoryatlas/harita/plans';
export { frame } from '@openhistoryatlas/harita/plans';
export const writePlan = planWriter(fileURLToPath(new URL('..', import.meta.url)));
