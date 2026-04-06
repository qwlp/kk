import type { ChapterSummary, CourseSequenceItem, LessonSummary, PublicLesson } from '$lib/types';
import { renderLessonMarkdown, renderMarkdownFragment } from './markdown';
import type {
	ChapterDefinition,
	ChapterManifest,
	ConsoleLessonDefinition,
	ConsoleLessonManifest,
	LessonDefinition,
	LessonManifest,
	QuizLessonDefinition,
	QuizLessonManifest,
	UnitLessonDefinition,
	UnitLessonManifest
} from './types';

const CHAPTER_COUNT = 14;
const LESSONS_PER_CHAPTER = 10;

const chapterManifestModules = import.meta.glob('./python/*/chapter.json', {
	eager: true,
	import: 'default'
}) as Record<string, ChapterManifest>;

const lessonManifestModules = import.meta.glob('./python/*/lessons/*/lesson.json', {
	eager: true,
	import: 'default'
}) as Record<string, LessonManifest>;

const lessonReadmeModules = import.meta.glob('./python/*/lessons/*/readme.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const starterCodeModules = import.meta.glob('./python/*/lessons/*/code.py', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const solutionCodeModules = import.meta.glob('./python/*/lessons/*/complete.py', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const testFileModules = import.meta.glob('./python/*/lessons/*/main_test.py', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const invariant = (condition: boolean, message: string): void => {
	if (!condition) {
		throw new Error(`Course validation failed: ${message}`);
	}
};

const getParentDirectory = (modulePath: string) => {
	const separatorIndex = modulePath.lastIndexOf('/');
	return separatorIndex >= 0 ? modulePath.slice(0, separatorIndex) : modulePath;
};

const toAssetDirectory = (lessonDirectory: string) =>
	`src/lib/server/course/${lessonDirectory.replace(/^\.\//, '')}`;

const getRequiredModule = (modules: Record<string, string>, modulePath: string, label: string) => {
	const value = modules[modulePath];
	invariant(typeof value === 'string', `${modulePath} is missing ${label}`);
	return value;
};

const toLessonSummary = (lesson: LessonDefinition): LessonSummary => ({
	slug: lesson.slug,
	chapterSlug: lesson.chapterSlug,
	order: lesson.order,
	title: lesson.title,
	mode: lesson.mode
});

const toCourseSequenceItem = (lesson: LessonDefinition): CourseSequenceItem => ({
	slug: lesson.slug,
	chapterSlug: lesson.chapterSlug,
	title: lesson.title,
	order: lesson.order,
	globalOrder: lesson.globalOrder,
	mode: lesson.mode
});

const toPublicLesson = (lesson: LessonDefinition): PublicLesson => {
	if (lesson.mode === 'quiz') {
		return {
			slug: lesson.slug,
			chapterSlug: lesson.chapterSlug,
			chapterTitle: lesson.chapterTitle,
			order: lesson.order,
			globalOrder: lesson.globalOrder,
			title: lesson.title,
			prompt: lesson.prompt,
			lessonHtml: lesson.lessonHtml,
			mode: lesson.mode,
			question: lesson.question,
			questionHtml: lesson.questionHtml,
			choices: lesson.choices
		};
	}

	if (lesson.mode === 'console') {
		return {
			slug: lesson.slug,
			chapterSlug: lesson.chapterSlug,
			chapterTitle: lesson.chapterTitle,
			order: lesson.order,
			globalOrder: lesson.globalOrder,
			title: lesson.title,
			prompt: lesson.prompt,
			lessonHtml: lesson.lessonHtml,
			mode: lesson.mode,
			starterCode: lesson.starterCode,
			solutionCode: lesson.solutionCode,
			sampleInput: lesson.sampleInput
		};
	}

	return {
		slug: lesson.slug,
		chapterSlug: lesson.chapterSlug,
		chapterTitle: lesson.chapterTitle,
		order: lesson.order,
		globalOrder: lesson.globalOrder,
		title: lesson.title,
		prompt: lesson.prompt,
		lessonHtml: lesson.lessonHtml,
		mode: lesson.mode,
		starterCode: lesson.starterCode,
		solutionCode: lesson.solutionCode,
		testFileName: lesson.testFileName,
		testFileContent: lesson.testFileContent,
		functionName: lesson.functionName
	};
};

const parseConsoleLesson = ({
	chapter,
	manifest,
	lessonDirectory,
	globalOrder
}: {
	chapter: ChapterManifest;
	manifest: ConsoleLessonManifest;
	lessonDirectory: string;
	globalOrder: number;
}): ConsoleLessonDefinition => ({
	slug: manifest.slug,
	chapterSlug: chapter.slug,
	chapterTitle: chapter.title,
	order: manifest.order,
	globalOrder,
	title: manifest.title,
	prompt: manifest.prompt,
	lessonHtml: renderLessonMarkdown(
		getRequiredModule(lessonReadmeModules, `${lessonDirectory}/readme.md`, 'readme.md')
	),
	mode: 'console',
	starterCode: getRequiredModule(starterCodeModules, `${lessonDirectory}/code.py`, 'code.py'),
	solutionCode: getRequiredModule(
		solutionCodeModules,
		`${lessonDirectory}/complete.py`,
		'complete.py'
	),
	sampleInput: manifest.sampleInput,
	publicCases: manifest.publicCases,
	hiddenCases: manifest.hiddenCases,
	assetDir: toAssetDirectory(lessonDirectory)
});

const parseUnitLesson = ({
	chapter,
	manifest,
	lessonDirectory,
	globalOrder
}: {
	chapter: ChapterManifest;
	manifest: UnitLessonManifest;
	lessonDirectory: string;
	globalOrder: number;
}): UnitLessonDefinition => ({
	slug: manifest.slug,
	chapterSlug: chapter.slug,
	chapterTitle: chapter.title,
	order: manifest.order,
	globalOrder,
	title: manifest.title,
	prompt: manifest.prompt,
	lessonHtml: renderLessonMarkdown(
		getRequiredModule(lessonReadmeModules, `${lessonDirectory}/readme.md`, 'readme.md')
	),
	mode: 'unit',
	starterCode: getRequiredModule(starterCodeModules, `${lessonDirectory}/code.py`, 'code.py'),
	solutionCode: getRequiredModule(
		solutionCodeModules,
		`${lessonDirectory}/complete.py`,
		'complete.py'
	),
	testFileName: 'main_test.py',
	testFileContent: getRequiredModule(
		testFileModules,
		`${lessonDirectory}/main_test.py`,
		'main_test.py'
	),
	functionName: manifest.functionName,
	publicCases: manifest.publicCases,
	hiddenCases: manifest.hiddenCases,
	assetDir: toAssetDirectory(lessonDirectory)
});

const parseQuizLesson = ({
	chapter,
	manifest,
	lessonDirectory,
	globalOrder
}: {
	chapter: ChapterManifest;
	manifest: QuizLessonManifest;
	lessonDirectory: string;
	globalOrder: number;
}): QuizLessonDefinition => {
	invariant(
		manifest.choices.some((choice) => choice.id === manifest.correctChoiceId),
		`${chapter.slug}/${manifest.slug} has an invalid correctChoiceId`
	);
	invariant(
		new Set(manifest.choices.map((choice) => choice.id)).size === manifest.choices.length,
		`${chapter.slug}/${manifest.slug} has duplicate quiz choice ids`
	);

	return {
		slug: manifest.slug,
		chapterSlug: chapter.slug,
		chapterTitle: chapter.title,
		order: manifest.order,
		globalOrder,
		title: manifest.title,
		prompt: manifest.prompt,
		lessonHtml: renderLessonMarkdown(
			getRequiredModule(lessonReadmeModules, `${lessonDirectory}/readme.md`, 'readme.md')
		),
		mode: 'quiz',
		question: manifest.question,
		questionHtml: renderMarkdownFragment(manifest.question),
		choices: manifest.choices.map((choice) => ({
			...choice,
			labelHtml: renderMarkdownFragment(choice.label)
		})),
		correctChoiceId: manifest.correctChoiceId,
		assetDir: toAssetDirectory(lessonDirectory)
	};
};

const parseLesson = ({
	chapter,
	lessonDirectory,
	manifest,
	globalOrder
}: {
	chapter: ChapterManifest;
	lessonDirectory: string;
	manifest: LessonManifest;
	globalOrder: number;
}): LessonDefinition => {
	if (manifest.mode === 'console') {
		return parseConsoleLesson({
			chapter,
			manifest,
			lessonDirectory,
			globalOrder
		});
	}

	if (manifest.mode === 'unit') {
		return parseUnitLesson({
			chapter,
			manifest,
			lessonDirectory,
			globalOrder
		});
	}

	return parseQuizLesson({
		chapter,
		manifest,
		lessonDirectory,
		globalOrder
	});
};

const validateChapterModeRules = (chapter: ChapterDefinition) => {
	const modes = new Set(chapter.lessons.map((lesson) => lesson.mode));

	if (chapter.order <= 4) {
		invariant(!modes.has('unit'), `chapter ${chapter.slug} cannot contain unit lessons`);
	}

	if (chapter.order >= 5 && chapter.order <= 13) {
		invariant(
			modes.has('console') && modes.has('unit') && modes.has('quiz'),
			`chapter ${chapter.slug} must include console, unit, and quiz lessons`
		);
	}

	if (chapter.order === 14) {
		invariant(modes.size === 1 && modes.has('quiz'), `chapter ${chapter.slug} must be quiz-only`);
	}
};

const buildCourse = () => {
	const chapterEntries = Object.entries(chapterManifestModules)
		.map(([modulePath, manifest]) => ({
			modulePath,
			chapterDirectory: getParentDirectory(modulePath),
			manifest
		}))
		.sort((left, right) => left.manifest.order - right.manifest.order);

	invariant(
		chapterEntries.length === CHAPTER_COUNT,
		`expected ${CHAPTER_COUNT} chapters, found ${chapterEntries.length}`
	);

	const chapterSlugSet = new Set<string>();
	const lessonSlugSet = new Set<string>();
	const chapters: ChapterDefinition[] = [];
	const lessonBySlug = new Map<string, LessonDefinition>();
	const lessonByChapterSlug = new Map<string, Map<string, LessonDefinition>>();
	const sequence: CourseSequenceItem[] = [];

	let globalOrder = 1;

	for (const [chapterIndex, chapterEntry] of chapterEntries.entries()) {
		invariant(
			chapterEntry.manifest.order === chapterIndex + 1,
			`chapter ${chapterEntry.chapterDirectory} has order ${chapterEntry.manifest.order}, expected ${chapterIndex + 1}`
		);
		invariant(
			!chapterSlugSet.has(chapterEntry.manifest.slug),
			`duplicate chapter slug ${chapterEntry.manifest.slug}`
		);
		chapterSlugSet.add(chapterEntry.manifest.slug);

		const lessonEntries = Object.entries(lessonManifestModules)
			.filter(([modulePath]) => modulePath.startsWith(`${chapterEntry.chapterDirectory}/lessons/`))
			.map(([modulePath, manifest]) => ({
				lessonDirectory: getParentDirectory(modulePath),
				manifest
			}))
			.sort((left, right) => left.manifest.order - right.manifest.order);

		invariant(
			lessonEntries.length === LESSONS_PER_CHAPTER,
			`chapter ${chapterEntry.manifest.slug} must contain exactly ${LESSONS_PER_CHAPTER} lessons`
		);

		const lessons = lessonEntries.map((lessonEntry, lessonIndex) => {
			const lesson = parseLesson({
				chapter: chapterEntry.manifest,
				lessonDirectory: lessonEntry.lessonDirectory,
				manifest: lessonEntry.manifest,
				globalOrder
			});

			invariant(
				lesson.order === lessonIndex + 1,
				`lesson ${chapterEntry.manifest.slug}/${lesson.slug} has order ${lesson.order}, expected ${lessonIndex + 1}`
			);
			invariant(!lessonSlugSet.has(lesson.slug), `duplicate lesson slug ${lesson.slug}`);

			lessonSlugSet.add(lesson.slug);
			lessonBySlug.set(lesson.slug, lesson);
			globalOrder += 1;
			sequence.push(toCourseSequenceItem(lesson));

			return lesson;
		});

		const chapter: ChapterDefinition = {
			...chapterEntry.manifest,
			lessonCount: lessons.length,
			lessons
		};

		validateChapterModeRules(chapter);

		chapters.push(chapter);
		lessonByChapterSlug.set(chapter.slug, new Map(lessons.map((lesson) => [lesson.slug, lesson])));
	}

	invariant(
		sequence.length === CHAPTER_COUNT * LESSONS_PER_CHAPTER,
		`expected ${CHAPTER_COUNT * LESSONS_PER_CHAPTER} total lessons, found ${sequence.length}`
	);

	return {
		chapters,
		lessonBySlug,
		lessonByChapterSlug,
		sequence
	};
};

const isDev = process.env.NODE_ENV !== 'production';
let cachedCourse: ReturnType<typeof buildCourse> | null = null;

const getCourseData = () => {
	if (isDev) {
		return buildCourse();
	}

	if (!cachedCourse) {
		cachedCourse = buildCourse();
	}

	return cachedCourse;
};

export const listChapters = (): ChapterSummary[] =>
	getCourseData().chapters.map(({ slug, order, title, description, lessonCount }) => ({
		slug,
		order,
		title,
		description,
		lessonCount
	}));

export const getChapter = (chapterSlug: string): ChapterSummary | undefined => {
	const chapter = getCourseData().chapters.find((item) => item.slug === chapterSlug);
	if (!chapter) return undefined;

	return {
		slug: chapter.slug,
		order: chapter.order,
		title: chapter.title,
		description: chapter.description,
		lessonCount: chapter.lessonCount
	};
};

export const listLessonsForChapter = (chapterSlug: string): LessonSummary[] => {
	const chapter = getCourseData().chapters.find((item) => item.slug === chapterSlug);
	return chapter ? chapter.lessons.map(toLessonSummary) : [];
};

export const getLesson = (chapterSlug: string, lessonSlug: string): PublicLesson | undefined => {
	const lesson = getCourseData().lessonByChapterSlug.get(chapterSlug)?.get(lessonSlug);
	return lesson ? toPublicLesson(lesson) : undefined;
};

export const getLessonDefinition = (lessonSlug: string): LessonDefinition | undefined =>
	getCourseData().lessonBySlug.get(lessonSlug);

export const getFirstLesson = (): CourseSequenceItem | undefined => getCourseData().sequence[0];

const getAdjacentLesson = ({
	chapterSlug,
	lessonSlug,
	offset
}: {
	chapterSlug: string;
	lessonSlug: string;
	offset: -1 | 1;
}): CourseSequenceItem | null => {
	const course = getCourseData();
	const lesson = course.lessonByChapterSlug.get(chapterSlug)?.get(lessonSlug);
	if (!lesson) return null;

	const sequenceIndex = lesson.globalOrder - 1 + offset;
	return course.sequence[sequenceIndex] ?? null;
};

export const getPreviousLesson = (chapterSlug: string, lessonSlug: string) =>
	getAdjacentLesson({ chapterSlug, lessonSlug, offset: -1 });

export const getNextLesson = (chapterSlug: string, lessonSlug: string) =>
	getAdjacentLesson({ chapterSlug, lessonSlug, offset: 1 });
