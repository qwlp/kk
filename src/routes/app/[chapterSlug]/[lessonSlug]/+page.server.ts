import { error } from '@sveltejs/kit';
import { effectRunner } from '$lib/runtime';
import { loadPublishedLessonRuntime } from '$lib/server/course';

export const load = async ({ params }) => {
	const pageData = await effectRunner(
		loadPublishedLessonRuntime({
			chapterSlug: params.chapterSlug,
			lessonSlug: params.lessonSlug
		})
	);

	if (!pageData) {
		error(404, {
			message: 'Lesson not found',
			kind: 'lesson_not_found',
			timestamp: Date.now()
		});
	}

	return pageData;
};
