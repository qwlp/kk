import type { ChallengeSummary, PublicChallenge } from '$lib/types';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { renderLessonMarkdown } from './markdown';
import type { ChallengeDefinition } from './types';

const readAsset = (assetDir: string, fileName: string) =>
	readFileSync(path.join(process.cwd(), assetDir, fileName), 'utf8');

const readOptionalAsset = (assetDir: string, fileName: string) => {
	const assetPath = path.join(process.cwd(), assetDir, fileName);
	return existsSync(assetPath) ? readFileSync(assetPath, 'utf8') : undefined;
};

const createChallengeBase = <Mode extends PublicChallenge['mode']>({
	slug,
	title,
	prompt,
	mode,
	assetDir
}: {
	slug: string;
	title: string;
	prompt: string;
	mode: Mode;
	assetDir: string;
}) => ({
	slug,
	title,
	prompt,
	mode,
	assetDir,
	starterCode: readAsset(assetDir, 'code.py'),
	solutionCode: readAsset(assetDir, 'complete.py'),
	lessonHtml: renderLessonMarkdown(readAsset(assetDir, 'readme.md')),
	expectedOutput: readAsset(assetDir, 'expected.txt').trimEnd(),
	testFileName: readOptionalAsset(assetDir, 'main_test.py') ? 'main_test.py' : undefined,
	testFileContent: readOptionalAsset(assetDir, 'main_test.py')
});

const challenges = [
	{
		...createChallengeBase({
			slug: 'welcome-to-fantasy-quest',
			title: 'Welcome to Fantasy Quest',
			prompt: 'Fix the print statement so the welcome message is spelled correctly.',
			mode: 'stdin',
			assetDir: 'src/lib/server/course/python/1-introduction/exercises/1-welcome_to_fantasy_quest'
		}),
		publicCases: [
			{
				name: 'public-welcome-message',
				stdin: '',
				expectedStdout: 'Welcome to Fantasy Quest!\n'
			}
		],
		hiddenCases: [
			{
				name: 'hidden-welcome-message',
				stdin: '',
				expectedStdout: 'Welcome to Fantasy Quest!\n'
			}
		]
	},
	{
		...createChallengeBase({
			slug: 'add-two-numbers',
			title: 'Add Two Numbers',
			prompt: 'Write a function named add(a, b) that returns the sum of both arguments.',
			mode: 'function',
			assetDir: 'src/lib/server/course/python/2-functions/exercises/1-add_two_numbers'
		}),
		functionName: 'add',
		publicCases: [
			{ name: 'public-basic', args: [1, 2], expected: 3 },
			{ name: 'public-negatives', args: [-5, 7], expected: 2 }
		],
		hiddenCases: [
			{ name: 'hidden-zero', args: [0, 0], expected: 0 },
			{ name: 'hidden-large', args: [123456, 654321], expected: 777777 }
		]
	},
	{
		...createChallengeBase({
			slug: 'echo-the-input',
			title: 'Echo the Input',
			prompt: 'Read each line from standard input and print it back unchanged.',
			mode: 'stdin',
			assetDir: 'src/lib/server/course/python/3-input-output/exercises/1-echo_the_input'
		}),
		publicCases: [
			{
				name: 'public-single-line',
				stdin: 'hello world\n',
				expectedStdout: 'hello world\n'
			},
			{
				name: 'public-multiple-lines',
				stdin: 'a\nb\nc\n',
				expectedStdout: 'a\nb\nc\n'
			}
		],
		hiddenCases: [
			{
				name: 'hidden-empty-input',
				stdin: '',
				expectedStdout: ''
			},
			{
				name: 'hidden-spacing',
				stdin: 'keep  spaces\n  leading\n',
				expectedStdout: 'keep  spaces\n  leading\n'
			}
		]
	}
] as const satisfies readonly ChallengeDefinition[];

const bySlug = new Map(challenges.map((challenge) => [challenge.slug, challenge]));

export const listChallengeSummaries = (): ChallengeSummary[] =>
	challenges.map(({ slug, title, mode }) => ({
		slug,
		title,
		mode
	}));

export const getChallenge = (slug: string): ChallengeDefinition | undefined => bySlug.get(slug);

export const getPublicChallenge = (slug: string): PublicChallenge | undefined => {
	const challenge = bySlug.get(slug);
	if (!challenge) return undefined;

	const {
		title,
		prompt,
		starterCode,
		solutionCode,
		lessonHtml,
		expectedOutput,
		testFileName,
		testFileContent,
		mode
	} = challenge;
	return {
		slug,
		title,
		prompt,
		starterCode,
		solutionCode,
		lessonHtml,
		expectedOutput,
		testFileName,
		testFileContent,
		mode
	};
};

export const defaultChallengeSlug = challenges[0]?.slug ?? 'welcome-to-fantasy-quest';
