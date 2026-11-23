// The generators in this folder use harita's plan helpers, bound to this story.
import { fileURLToPath } from 'url';
import { planWriter } from '@openbooknetwork/harita/plans';
export { frame } from '@openbooknetwork/harita/plans';
export const writePlan = planWriter(fileURLToPath(new URL('..', import.meta.url)));
