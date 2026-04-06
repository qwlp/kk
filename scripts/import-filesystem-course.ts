import { ConvexHttpClient } from 'convex/browser';
import { api } from '../src/convex/_generated/api';
import { readFilesystemCourseImportSnapshot } from '../src/lib/server/course/import-source';

const convexUrl =
	process.env.PUBLIC_CONVEX_URL?.trim() ?? process.env.VITE_CONVEX_URL?.trim() ?? '';

if (!convexUrl) {
	throw new Error('PUBLIC_CONVEX_URL or VITE_CONVEX_URL is required');
}

const convex = new ConvexHttpClient(convexUrl);
const apiKey = process.env.CONVEX_PRIVATE_BRIDGE_KEY?.trim() ?? '';

const withApiKey = <T extends Record<string, unknown>>(args: T) => ({
	...args,
	apiKey
});

const snapshot = await readFilesystemCourseImportSnapshot();

console.log(
	`Preparing import for course "${snapshot.slug}" with ${snapshot.chapters.length} chapters`
);

await convex.mutation(
	api.private.courseImport.importFilesystemCourse,
	withApiKey({
		courseSlug: snapshot.slug,
		title: snapshot.title,
		description: snapshot.description,
		language: snapshot.language,
		resetDraft: true
	})
);

for (const chapter of snapshot.chapters) {
	console.log(
		`Importing chapter ${chapter.order}: ${chapter.slug} (${chapter.lessons.length} lessons)`
	);

	await convex.mutation(
		api.private.courseImport.importFilesystemCourse,
		withApiKey({
			courseSlug: snapshot.slug,
			title: snapshot.title,
			description: snapshot.description,
			language: snapshot.language,
			chapter: {
				slug: chapter.slug,
				order: chapter.order,
				title: chapter.title,
				description: chapter.description
			},
			lessons: chapter.lessons
		})
	);
}

const published = await convex.mutation(
	api.private.coursePublish.publishDraft,
	withApiKey({
		courseSlug: snapshot.slug
	})
);

console.log(
	`Published ${snapshot.slug} version ${published.courseVersionNumber} at ${new Date(
		published.publishedAt
	).toISOString()}`
);
