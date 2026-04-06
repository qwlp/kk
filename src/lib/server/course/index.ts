import type { ChapterSummary, CourseSequenceItem, LessonSummary, PublicLesson } from '$lib/types';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
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

const COURSE_ROOT = path.join(process.cwd(), 'src/lib/server/course/python');
const CHAPTER_COUNT = 14;
const LESSONS_PER_CHAPTER = 10;

const readJson = <T>(filePath: string): T => JSON.parse(readFileSync(filePath, 'utf8')) as T;

const readRequiredText = (filePath: string) => readFileSync(filePath, 'utf8');

const listDirectories = (dirPath: string) =>
	readdirSync(dirPath, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

const invariant = (condition: boolean, message: string): void => {
	if (!condition) {
		throw new Error(`Course validation failed: ${message}`);
	}
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
	lessonDir,
	globalOrder
}: {
	chapter: ChapterManifest;
	manifest: ConsoleLessonManifest;
	lessonDir: string;
	globalOrder: number;
}): ConsoleLessonDefinition => {
	const starterCodePath = path.join(lessonDir, 'code.py');
	const solutionCodePath = path.join(lessonDir, 'complete.py');

	invariant(existsSync(starterCodePath), `${chapter.slug}/${manifest.slug} is missing code.py`);
	invariant(
		existsSync(solutionCodePath),
		`${chapter.slug}/${manifest.slug} is missing complete.py`
	);

	return {
		slug: manifest.slug,
		chapterSlug: chapter.slug,
		chapterTitle: chapter.title,
		order: manifest.order,
		globalOrder,
		title: manifest.title,
		prompt: manifest.prompt,
		lessonHtml: renderLessonMarkdown(readRequiredText(path.join(lessonDir, 'readme.md'))),
		mode: 'console',
		starterCode: readRequiredText(starterCodePath),
		solutionCode: readRequiredText(solutionCodePath),
		sampleInput: manifest.sampleInput,
		publicCases: manifest.publicCases,
		hiddenCases: manifest.hiddenCases,
		assetDir: path.relative(process.cwd(), lessonDir)
	};
};

const parseUnitLesson = ({
	chapter,
	manifest,
	lessonDir,
	globalOrder
}: {
	chapter: ChapterManifest;
	manifest: UnitLessonManifest;
	lessonDir: string;
	globalOrder: number;
}): UnitLessonDefinition => {
	const starterCodePath = path.join(lessonDir, 'code.py');
	const solutionCodePath = path.join(lessonDir, 'complete.py');
	const testFilePath = path.join(lessonDir, 'main_test.py');

	invariant(existsSync(starterCodePath), `${chapter.slug}/${manifest.slug} is missing code.py`);
	invariant(
		existsSync(solutionCodePath),
		`${chapter.slug}/${manifest.slug} is missing complete.py`
	);
	invariant(existsSync(testFilePath), `${chapter.slug}/${manifest.slug} is missing main_test.py`);

	return {
		slug: manifest.slug,
		chapterSlug: chapter.slug,
		chapterTitle: chapter.title,
		order: manifest.order,
		globalOrder,
		title: manifest.title,
		prompt: manifest.prompt,
		lessonHtml: renderLessonMarkdown(readRequiredText(path.join(lessonDir, 'readme.md'))),
		mode: 'unit',
		starterCode: readRequiredText(starterCodePath),
		solutionCode: readRequiredText(solutionCodePath),
		testFileName: 'main_test.py',
		testFileContent: readRequiredText(testFilePath),
		functionName: manifest.functionName,
		publicCases: manifest.publicCases,
		hiddenCases: manifest.hiddenCases,
		assetDir: path.relative(process.cwd(), lessonDir)
	};
};

const parseQuizLesson = ({
	chapter,
	manifest,
	lessonDir,
	globalOrder
}: {
	chapter: ChapterManifest;
	manifest: QuizLessonManifest;
	lessonDir: string;
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
		lessonHtml: renderLessonMarkdown(readRequiredText(path.join(lessonDir, 'readme.md'))),
		mode: 'quiz',
		question: manifest.question,
		questionHtml: renderMarkdownFragment(manifest.question),
		choices: manifest.choices.map((choice) => ({
			...choice,
			labelHtml: renderMarkdownFragment(choice.label)
		})),
		correctChoiceId: manifest.correctChoiceId,
		assetDir: path.relative(process.cwd(), lessonDir)
	};
};

const parseLesson = ({
	chapter,
	lessonDir,
	globalOrder
}: {
	chapter: ChapterManifest;
	lessonDir: string;
	globalOrder: number;
}): LessonDefinition => {
	const manifestPath = path.join(lessonDir, 'lesson.json');
	const markdownPath = path.join(lessonDir, 'readme.md');

	invariant(
		existsSync(manifestPath),
		`${chapter.slug}/${path.basename(lessonDir)} is missing lesson.json`
	);
	invariant(
		existsSync(markdownPath),
		`${chapter.slug}/${path.basename(lessonDir)} is missing readme.md`
	);

	const manifest = readJson<LessonManifest>(manifestPath);

	if (manifest.mode === 'console') {
		return parseConsoleLesson({
			chapter,
			manifest,
			lessonDir,
			globalOrder
		});
	}

	if (manifest.mode === 'unit') {
		return parseUnitLesson({
			chapter,
			manifest,
			lessonDir,
			globalOrder
		});
	}

	return parseQuizLesson({
		chapter,
		manifest,
		lessonDir,
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
	invariant(existsSync(COURSE_ROOT), `course root not found at ${COURSE_ROOT}`);

	const chapterDirs = listDirectories(COURSE_ROOT);
	invariant(
		chapterDirs.length === CHAPTER_COUNT,
		`expected ${CHAPTER_COUNT} chapters, found ${chapterDirs.length}`
	);

	const chapterSlugSet = new Set<string>();
	const lessonSlugSet = new Set<string>();
	const chapters: ChapterDefinition[] = [];
	const lessonBySlug = new Map<string, LessonDefinition>();
	const lessonByChapterSlug = new Map<string, Map<string, LessonDefinition>>();
	const sequence: CourseSequenceItem[] = [];

	let globalOrder = 1;

	for (const [chapterIndex, chapterDirName] of chapterDirs.entries()) {
		const chapterDir = path.join(COURSE_ROOT, chapterDirName);
		const chapterManifest = readJson<ChapterManifest>(path.join(chapterDir, 'chapter.json'));

		invariant(
			chapterManifest.order === chapterIndex + 1,
			`chapter ${chapterDirName} has order ${chapterManifest.order}, expected ${chapterIndex + 1}`
		);
		invariant(
			!chapterSlugSet.has(chapterManifest.slug),
			`duplicate chapter slug ${chapterManifest.slug}`
		);
		chapterSlugSet.add(chapterManifest.slug);

		const lessonsDir = path.join(chapterDir, 'lessons');
		invariant(
			existsSync(lessonsDir),
			`chapter ${chapterManifest.slug} is missing lessons directory`
		);

		const lessonDirs = listDirectories(lessonsDir);
		invariant(
			lessonDirs.length === LESSONS_PER_CHAPTER,
			`chapter ${chapterManifest.slug} must contain exactly ${LESSONS_PER_CHAPTER} lessons`
		);

		const lessons = lessonDirs.map((lessonDirName, lessonIndex) => {
			const lesson = parseLesson({
				chapter: chapterManifest,
				lessonDir: path.join(lessonsDir, lessonDirName),
				globalOrder
			});

			invariant(
				lesson.order === lessonIndex + 1,
				`lesson ${chapterManifest.slug}/${lesson.slug} has order ${lesson.order}, expected ${lessonIndex + 1}`
			);
			invariant(!lessonSlugSet.has(lesson.slug), `duplicate lesson slug ${lesson.slug}`);

			lessonSlugSet.add(lesson.slug);
			lessonBySlug.set(lesson.slug, lesson);
			globalOrder += 1;
			sequence.push(toCourseSequenceItem(lesson));

			return lesson;
		});

		const chapter: ChapterDefinition = {
			...chapterManifest,
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
