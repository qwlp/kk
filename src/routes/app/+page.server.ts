import { error, redirect } from '@sveltejs/kit';
import { getFirstLesson } from '$lib/server/course';

export const load = async () => {
	const firstLesson = getFirstLesson();

	if (!firstLesson) {
		error(500, {
			message: 'No lessons configured',
			kind: 'course_registry_error',
			timestamp: Date.now()
		});
	}

	redirect(307, `/app/${firstLesson.chapterSlug}/${firstLesson.slug}`);
};
