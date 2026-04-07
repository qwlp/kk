import { effectRunner } from '$lib/runtime';
import { loadAppNavigationData } from '$lib/server/course';

export const load = async () => await effectRunner(loadAppNavigationData());
