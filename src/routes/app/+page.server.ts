import { error, redirect } from '@sveltejs/kit';
import { effectRunner } from '$lib/runtime';
import { getAppEntryLesson } from '$lib/server/course';

export const load = async () => {
	const firstLesson = await effectRunner(getAppEntryLesson());

	if (!firstLesson) {
		error(500, {
			message: 'No lessons configured',
			kind: 'course_registry_error',
			timestamp: Date.now()
		});
	}

	redirect(307, `/app/${firstLesson.chapterSlug}/${firstLesson.slug}`);
};
