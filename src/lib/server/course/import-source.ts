import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderLessonMarkdown, renderMarkdownFragment } from './markdown';
import type {
	ChapterManifest,
	ConsoleLessonManifest,
	LessonManifest,
	QuizLessonManifest,
	UnitLessonManifest
} from './types';

type ImportLesson = {
	chapterSlug: string;
	slug: string;
	order: number;
	mode: 'console' | 'unit' | 'quiz';
	title: string;
	prompt: string;
	lessonMarkdown: string;
	lessonHtml: string;
	starterCode?: string;
	sampleInput?: string;
	questionMarkdown?: string;
	questionHtml?: string;
	choices?: {
		id: string;
		label: string;
		labelHtml: string;
	}[];
	functionName?: string;
	publicCases?: unknown[];
	hiddenCases?: unknown[];
	solutionCode?: string;
	testFileName?: string;
	testFileContent?: string;
	correctChoiceId?: string;
};

type ImportChapter = {
	slug: string;
	order: number;
	title: string;
	description: string;
	lessons: ImportLesson[];
};

export type FilesystemCourseImportSnapshot = {
	slug: string;
	title: string;
	description: string;
	language: string;
	chapters: ImportChapter[];
};

const COURSE_ROOT = path.join(process.cwd(), 'src/lib/server/course/python');

const parseJsonFile = async <T>(filePath: string) =>
	JSON.parse(await readFile(filePath, 'utf8')) as T;

const readOptionalTextFile = async (filePath: string) => {
	try {
		return await readFile(filePath, 'utf8');
	} catch {
		return undefined;
	}
};

const parseConsoleLesson = async (
	chapterSlug: string,
	lessonDirectory: string,
	manifest: ConsoleLessonManifest
): Promise<ImportLesson> => {
	const [lessonMarkdown, starterCode, solutionCode] = await Promise.all([
		readFile(path.join(lessonDirectory, 'readme.md'), 'utf8'),
		readFile(path.join(lessonDirectory, 'code.py'), 'utf8'),
		readFile(path.join(lessonDirectory, 'complete.py'), 'utf8')
	]);

	return {
		chapterSlug,
		slug: manifest.slug,
		order: manifest.order,
		mode: 'console',
		title: manifest.title,
		prompt: manifest.prompt,
		lessonMarkdown,
		lessonHtml: renderLessonMarkdown(lessonMarkdown),
		starterCode,
		sampleInput: manifest.sampleInput,
		publicCases: manifest.publicCases,
		hiddenCases: manifest.hiddenCases,
		solutionCode
	};
};

const parseUnitLesson = async (
	chapterSlug: string,
	lessonDirectory: string,
	manifest: UnitLessonManifest
): Promise<ImportLesson> => {
	const [lessonMarkdown, starterCode, solutionCode, testFileContent] = await Promise.all([
		readFile(path.join(lessonDirectory, 'readme.md'), 'utf8'),
		readFile(path.join(lessonDirectory, 'code.py'), 'utf8'),
		readFile(path.join(lessonDirectory, 'complete.py'), 'utf8'),
		readFile(path.join(lessonDirectory, 'main_test.py'), 'utf8')
	]);

	return {
		chapterSlug,
		slug: manifest.slug,
		order: manifest.order,
		mode: 'unit',
		title: manifest.title,
		prompt: manifest.prompt,
		lessonMarkdown,
		lessonHtml: renderLessonMarkdown(lessonMarkdown),
		starterCode,
		functionName: manifest.functionName,
		publicCases: manifest.publicCases,
		hiddenCases: manifest.hiddenCases,
		solutionCode,
		testFileName: 'main_test.py',
		testFileContent
	};
};

const parseQuizLesson = async (
	chapterSlug: string,
	lessonDirectory: string,
	manifest: QuizLessonManifest
): Promise<ImportLesson> => {
	const lessonMarkdown = await readFile(path.join(lessonDirectory, 'readme.md'), 'utf8');

	return {
		chapterSlug,
		slug: manifest.slug,
		order: manifest.order,
		mode: 'quiz',
		title: manifest.title,
		prompt: manifest.prompt,
		lessonMarkdown,
		lessonHtml: renderLessonMarkdown(lessonMarkdown),
		questionMarkdown: manifest.question,
		questionHtml: renderMarkdownFragment(manifest.question),
		choices: manifest.choices.map((choice) => ({
			...choice,
			labelHtml: renderMarkdownFragment(choice.label)
		})),
		correctChoiceId: manifest.correctChoiceId
	};
};

const parseLesson = async (
	chapterSlug: string,
	lessonDirectory: string,
	manifest: LessonManifest
) => {
	if (manifest.mode === 'console') {
		return await parseConsoleLesson(chapterSlug, lessonDirectory, manifest);
	}

	if (manifest.mode === 'unit') {
		return await parseUnitLesson(chapterSlug, lessonDirectory, manifest);
	}

	return await parseQuizLesson(chapterSlug, lessonDirectory, manifest);
};

export const readFilesystemCourseImportSnapshot =
	async (): Promise<FilesystemCourseImportSnapshot> => {
		const chapterDirectories = (await readdir(COURSE_ROOT, { withFileTypes: true }))
			.filter((entry) => entry.isDirectory())
			.map((entry) => path.join(COURSE_ROOT, entry.name));

		const chapters = await Promise.all(
			chapterDirectories.map(async (chapterDirectory) => {
				const chapterManifest = await parseJsonFile<ChapterManifest>(
					path.join(chapterDirectory, 'chapter.json')
				);
				const lessonsRoot = path.join(chapterDirectory, 'lessons');
				const lessonDirectories = (await readdir(lessonsRoot, { withFileTypes: true }))
					.filter((entry) => entry.isDirectory())
					.map((entry) => path.join(lessonsRoot, entry.name));

				const lessons = await Promise.all(
					lessonDirectories.map(async (lessonDirectory) => {
						const lessonManifest = await parseJsonFile<LessonManifest>(
							path.join(lessonDirectory, 'lesson.json')
						);
						return await parseLesson(chapterManifest.slug, lessonDirectory, lessonManifest);
					})
				);

				return {
					slug: chapterManifest.slug,
					order: chapterManifest.order,
					title: chapterManifest.title,
					description: chapterManifest.description,
					lessons: lessons.sort((left, right) => left.order - right.order)
				};
			})
		);

		const courseDescription =
			(await readOptionalTextFile(path.join(COURSE_ROOT, 'course-description.txt'))) ??
			'Imported from the repository-backed Python course curriculum.';

		return {
			slug: 'python',
			title: 'Python',
			description: courseDescription.trim(),
			language: 'python',
			chapters: chapters.sort((left, right) => left.order - right.order)
		};
	};
