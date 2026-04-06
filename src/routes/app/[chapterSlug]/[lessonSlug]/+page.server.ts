import { error } from '@sveltejs/kit';
import {
	getChapter,
	getLesson,
	getNextLesson,
	getPreviousLesson,
	listChapters,
	listLessonsForChapter
} from '$lib/server/course';

export const load = async ({ params }) => {
	const currentChapter = getChapter(params.chapterSlug);
	const currentLesson = getLesson(params.chapterSlug, params.lessonSlug);

	if (!currentChapter || !currentLesson) {
		error(404, {
			message: 'Lesson not found',
			kind: 'lesson_not_found',
			timestamp: Date.now()
		});
	}

	const chapters = listChapters();
	const lessonsInChapter = listLessonsForChapter(params.chapterSlug);

	return {
		chapters,
		currentChapter,
		lessonsInChapter,
		currentLesson,
		previousLesson: getPreviousLesson(params.chapterSlug, params.lessonSlug),
		nextLesson: getNextLesson(params.chapterSlug, params.lessonSlug),
		chapterTargets: Object.fromEntries(
			chapters.map((chapter) => {
				const firstLesson = listLessonsForChapter(chapter.slug)[0];
				return [
					chapter.slug,
					firstLesson
						? {
								chapterSlug: chapter.slug,
								lessonSlug: firstLesson.slug
							}
						: null
				];
			})
		)
	};
};
