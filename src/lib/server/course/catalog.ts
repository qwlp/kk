import { Effect } from 'effect';
import { api } from '../../../convex/_generated/api';
import { createGenericError } from '$lib/runtime';
import { ConvexPrivateService } from '$lib/services/convex';
import type {
	ChapterLessonTargetMap,
	ChapterSummary,
	CourseSequenceItem,
	LessonRouteTarget
} from '$lib/types';
import type {
	PublishedCourseNavigation,
	PublishedLessonEvaluator,
	PublishedLessonRuntime
} from './types';
import { getFilesystemLessonDefinition } from './filesystem';

export const DEFAULT_COURSE_SLUG = 'python';

const buildChapterTargets = (navigation: PublishedCourseNavigation): ChapterLessonTargetMap =>
	Object.fromEntries(
		navigation.chapters.map((chapter: ChapterSummary) => {
			const firstLesson = navigation.sequence.find(
				(item: CourseSequenceItem) => item.chapterSlug === chapter.slug
			);
			const target: LessonRouteTarget | null = firstLesson
				? {
						chapterSlug: chapter.slug,
						lessonSlug: firstLesson.slug
					}
				: null;

			return [chapter.slug, target];
		})
	);

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

export const loadAppNavigationData = (courseSlug = DEFAULT_COURSE_SLUG) =>
	Effect.gen(function* () {
		const navigation = yield* getPublishedNavigation(courseSlug);

		return {
			chapters: navigation.chapters as ChapterSummary[],
			sequence: navigation.sequence as CourseSequenceItem[],
			chapterTargets: buildChapterTargets(navigation)
		};
	});

export const loadPublishedLessonRuntime = ({
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

		const lessonWithUnitFallback =
			currentLesson.mode === 'unit' &&
			((currentLesson.testFileName ?? '').trim().length === 0 ||
				(currentLesson.testFileContent ?? '').trim().length === 0)
				? (() => {
						const filesystemLesson = getFilesystemLessonDefinition(lessonSlug);
						if (!filesystemLesson || filesystemLesson.mode !== 'unit') {
							return currentLesson;
						}

						return {
							...currentLesson,
							testFileName: filesystemLesson.testFileName,
							testFileContent: filesystemLesson.testFileContent
						};
					})()
				: currentLesson;

		return {
			currentLesson: lessonWithUnitFallback as PublishedLessonRuntime
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
