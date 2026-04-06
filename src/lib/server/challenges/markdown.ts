import { marked } from 'marked';

marked.setOptions({
	gfm: true,
	breaks: true
});

export const renderLessonMarkdown = (markdown: string) => marked.parse(markdown) as string;
