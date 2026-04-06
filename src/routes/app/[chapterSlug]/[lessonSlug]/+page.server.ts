import { error } from '@sveltejs/kit';
import { effectRunner } from '$lib/runtime';
import { loadCoursePageData } from '$lib/server/course';

export const load = async ({ params }) => {
	const pageData = await effectRunner(
		loadCoursePageData({
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
