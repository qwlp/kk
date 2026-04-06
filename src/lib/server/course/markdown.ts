import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { Marked, type Token, type Tokens } from 'marked';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

const lessonMarkdown = new Marked({
	gfm: true,
	breaks: true,
	renderer: {
		code(token) {
			const language = normalizeLanguage(token.lang);
			const highlightedCode = language
				? hljs.highlight(token.text, { language, ignoreIllegals: true }).value
				: escapeHtml(token.text);
			const label = token.lang?.trim();

			return [
				'<div class="lesson-code-shell">',
				label
					? `<div class="lesson-code-meta">${escapeHtml(label)}</div>`
					: '<div class="lesson-code-meta">code</div>',
				`<pre class="lesson-code-block"><code class="hljs${language ? ` language-${language}` : ''}">${highlightedCode}</code></pre>`,
				'</div>'
			].join('');
		}
	}
});

const languageAliases: Record<string, string> = {
	bash: 'bash',
	html: 'xml',
	javascript: 'javascript',
	js: 'javascript',
	json: 'json',
	py: 'python',
	python: 'python',
	sh: 'bash',
	shell: 'bash',
	svelte: 'xml',
	ts: 'typescript',
	typescript: 'typescript',
	xml: 'xml',
	zsh: 'bash'
};

const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const normalizeLanguage = (value?: string) => {
	if (!value) return null;

	const normalized = value.trim().toLowerCase();
	return languageAliases[normalized] ?? null;
};

const createSlugger = () => {
	const counts = new Map<string, number>();

	return (value: string) => {
		const base =
			value
				.toLowerCase()
				.replaceAll(/['"]/g, '')
				.replaceAll(/[^a-z0-9]+/g, '-')
				.replaceAll(/^-+|-+$/g, '') || 'section';
		const nextCount = (counts.get(base) ?? 0) + 1;
		counts.set(base, nextCount);

		return nextCount === 1 ? base : `${base}-${nextCount}`;
	};
};

const isHeadingToken = (token: Token): token is Tokens.Heading => token.type === 'heading';

const renderInlineTokens = (tokens: Token[]) =>
	lessonMarkdown.Parser.parseInline(tokens, lessonMarkdown.defaults);

const renderTokenGroup = (tokens: Token[]) =>
	lessonMarkdown.parser(tokens, lessonMarkdown.defaults);

const renderHeadingSection = (
	heading: Tokens.Heading,
	childTokens: Token[],
	slugify: (value: string) => string
) => {
	const headingId = slugify(heading.text);
	const headingHtml = renderInlineTokens(heading.tokens);
	const bodyHtml = renderStructuredTokens(childTokens, slugify);

	if (heading.depth === 1) {
		return `<h1 id="${headingId}" class="lesson-heading lesson-heading-depth-1">${headingHtml}</h1>${bodyHtml}`;
	}

	return [
		`<details class="lesson-section lesson-section-depth-${Math.min(heading.depth, 6)}" open>`,
		'<summary class="lesson-section-summary">',
		'<span class="lesson-section-chevron" aria-hidden="true"></span>',
		`<span class="lesson-section-heading lesson-section-heading-depth-${Math.min(heading.depth, 6)}" role="heading" aria-level="${heading.depth}" id="${headingId}">${headingHtml}</span>`,
		'</summary>',
		`<div class="lesson-section-body">${bodyHtml}</div>`,
		'</details>'
	].join('');
};

const renderStructuredTokens = (tokens: Token[], slugify: (value: string) => string) => {
	let html = '';
	let index = 0;

	while (index < tokens.length) {
		const currentToken = tokens[index];

		if (!isHeadingToken(currentToken)) {
			const startIndex = index;

			while (index < tokens.length && !isHeadingToken(tokens[index])) {
				index += 1;
			}

			html += renderTokenGroup(tokens.slice(startIndex, index));
			continue;
		}

		index += 1;
		const childStartIndex = index;

		while (index < tokens.length) {
			const nextToken = tokens[index];
			if (isHeadingToken(nextToken) && nextToken.depth <= currentToken.depth) {
				break;
			}
			index += 1;
		}

		html += renderHeadingSection(currentToken, tokens.slice(childStartIndex, index), slugify);
	}

	return html;
};

export const renderLessonMarkdown = (markdown: string) => {
	const tokens = lessonMarkdown.lexer(markdown, lessonMarkdown.defaults);
	return renderStructuredTokens(tokens, createSlugger());
};

export const renderMarkdownFragment = (markdown: string) => {
	const tokens = lessonMarkdown.lexer(markdown, lessonMarkdown.defaults);
	return renderTokenGroup(tokens);
};
