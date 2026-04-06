import { Effect } from 'effect';
import { api } from '../../../convex/_generated/api';
import { createGenericError } from '$lib/runtime';
import { ConvexPrivateService } from '$lib/services/convex';
import type { ChapterSummary, CourseSequenceItem, LessonSummary } from '$lib/types';
import type {
	PublishedCourseNavigation,
	PublishedLessonEvaluator,
	PublishedLessonRuntime
} from './types';

export const DEFAULT_COURSE_SLUG = 'python';

const toLessonSummary = (lesson: CourseSequenceItem): LessonSummary => ({
	slug: lesson.slug,
	chapterSlug: lesson.chapterSlug,
	order: lesson.order,
	title: lesson.title,
	mode: lesson.mode
});

const getPublishedNavigation = (courseSlug: string) =>
	Effect.gen(function* () {
		const convex = yield* ConvexPrivateService;
		const navigation = yield* convex.query({
			func: api.private.courses.getPublishedNavigation,
			args: { courseSlug }
		});

		if (!navigation) {
			return yield* Effect.fail(
				createGenericError({
					message: 'No published course navigation found',
					status: 404,
					kind: 'published_course_not_found'
				})
			);
		}

		return navigation as PublishedCourseNavigation;
	});

export const getAppEntryLesson = (courseSlug = DEFAULT_COURSE_SLUG) =>
	Effect.gen(function* () {
		const navigation = yield* getPublishedNavigation(courseSlug);
		const firstLesson = navigation.sequence[0];

		if (!firstLesson) {
			return yield* Effect.fail(
				createGenericError({
					message: 'No lessons configured',
					status: 500,
					kind: 'course_registry_error'
				})
			);
		}

		return firstLesson;
	});

export const loadCoursePageData = ({
	courseSlug = DEFAULT_COURSE_SLUG,
	chapterSlug,
	lessonSlug
}: {
	courseSlug?: string;
	chapterSlug: string;
	lessonSlug: string;
}) =>
	Effect.gen(function* () {
		const convex = yield* ConvexPrivateService;
		const navigation = yield* getPublishedNavigation(courseSlug);
		const currentLesson = (yield* convex.query({
			func: api.private.courses.getPublishedLessonBySlugs,
			args: {
				courseSlug,
				chapterSlug,
				lessonSlug
			}
		})) as PublishedLessonRuntime | null;

		if (!currentLesson) {
			return yield* Effect.fail(
				createGenericError({
					message: 'Lesson not found',
					status: 404,
					kind: 'lesson_not_found'
				})
			);
		}

		const currentChapter = navigation.chapters.find(
			(chapter: ChapterSummary) => chapter.slug === chapterSlug
		);

		if (!currentChapter) {
			return yield* Effect.fail(
				createGenericError({
					message: 'Chapter not found',
					status: 404,
					kind: 'chapter_not_found'
				})
			);
		}

		const lessonsInChapter = navigation.sequence
			.filter((lesson: CourseSequenceItem) => lesson.chapterSlug === chapterSlug)
			.map(toLessonSummary);
		const currentIndex = navigation.sequence.findIndex(
			(item: CourseSequenceItem) => item.chapterSlug === chapterSlug && item.slug === lessonSlug
		);

		if (currentIndex < 0) {
			return yield* Effect.fail(
				createGenericError({
					message: 'Lesson not found in navigation',
					status: 404,
					kind: 'lesson_not_found'
				})
			);
		}

		const chapterTargets = Object.fromEntries(
			navigation.chapters.map((chapter: ChapterSummary) => {
				const firstLesson = navigation.sequence.find(
					(item: CourseSequenceItem) => item.chapterSlug === chapter.slug
				);
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
		);

		return {
			chapters: navigation.chapters as ChapterSummary[],
			currentChapter,
			lessonsInChapter,
			currentLesson: currentLesson as PublishedLessonRuntime,
			previousLesson: navigation.sequence[currentIndex - 1] ?? null,
			nextLesson: navigation.sequence[currentIndex + 1] ?? null,
			chapterTargets
		};
	});

export const getPublishedLessonEvaluator = ({
	courseSlug = DEFAULT_COURSE_SLUG,
	lessonSlug
}: {
	courseSlug?: string;
	lessonSlug: string;
}) =>
	Effect.gen(function* () {
		const convex = yield* ConvexPrivateService;
		const lesson = yield* convex.query({
			func: api.private.courses.getPublishedLessonEvaluatorBySlug,
			args: {
				courseSlug,
				lessonSlug
			}
		});

		if (!lesson) {
			return yield* Effect.fail(
				createGenericError({
					message: 'Lesson not found',
					status: 404,
					kind: 'lesson_not_found'
				})
			);
		}

		return lesson as PublishedLessonEvaluator;
	});
