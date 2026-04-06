import type { QueryCtx } from '../_generated/server';
import type { Doc } from '../_generated/dataModel';

type CourseDoc = Doc<'courses'>;
type CourseDraftDoc = Doc<'courseDrafts'>;
type ReaderDb = QueryCtx['db'];

export const getCourseBySlug = async (db: ReaderDb, slug: string) =>
	await db
		.query('courses')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.unique();

export const getPublishedCourseContext = async (db: ReaderDb, courseSlug: string) => {
	const course = await getCourseBySlug(db, courseSlug);

	if (!course || course.publishedVersionNumber === undefined) {
		return null;
	}

	const courseVersion = await db
		.query('courseVersions')
		.withIndex('by_courseId_versionNumber', (q) =>
			q.eq('courseId', course._id).eq('versionNumber', course.publishedVersionNumber ?? -1)
		)
		.unique();

	if (!courseVersion) {
		return null;
	}

	return {
		course,
		courseVersion
	};
};

export const getCourseNavigation = async (
	db: ReaderDb,
	courseId: CourseDoc['_id'],
	courseVersionNumber: number
) =>
	await db
		.query('courseVersionNavigation')
		.withIndex('by_courseId_version', (q) =>
			q.eq('courseId', courseId).eq('courseVersionNumber', courseVersionNumber)
		)
		.unique();

export const getActiveDraftContext = async (db: ReaderDb, courseSlug: string) => {
	const course = await getCourseBySlug(db, courseSlug);

	if (!course) {
		return null;
	}

	let draft: CourseDraftDoc | null = null;

	if (course.activeDraftId) {
		draft = await db.get(course.activeDraftId);
	}

	if (!draft) {
		draft = await db
			.query('courseDrafts')
			.withIndex('by_courseId_status', (q) => q.eq('courseId', course._id).eq('status', 'active'))
			.unique();
	}

	if (!draft) {
		return { course, draft: null };
	}

	return { course, draft };
};

export const getNextDraftNumber = async (db: ReaderDb, courseId: CourseDoc['_id']) => {
	const drafts = await db
		.query('courseDrafts')
		.withIndex('by_courseId_draftNumber', (q) => q.eq('courseId', courseId))
		.collect();

	const maxDraftNumber = drafts.reduce(
		(currentMax, draft) => Math.max(currentMax, draft.draftNumber),
		0
	);

	return maxDraftNumber + 1;
};
