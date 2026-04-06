<script lang="ts">
	import { basicSetup } from 'codemirror';
	import { python } from '@codemirror/lang-python';
	import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { Compartment, EditorState } from '@codemirror/state';
	import { EditorView } from '@codemirror/view';
	import { tags } from '@lezer/highlight';
	import { vim } from '@replit/codemirror-vim';
	import { onMount } from 'svelte';

	interface Props {
		value: string;
		readOnly?: boolean;
		vimMode?: boolean;
		onValueChange?: (value: string) => void;
	}

	let { value, readOnly = false, vimMode = false, onValueChange }: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let editorView = $state<EditorView | null>(null);
	let syncingExternalValue = $state(false);

	const editableCompartment = new Compartment();
	const vimCompartment = new Compartment();

	const editableExtension = (isReadOnly: boolean) => [
		EditorState.readOnly.of(isReadOnly),
		EditorView.editable.of(!isReadOnly)
	];

	const pinkSyntax = HighlightStyle.define([
		{ tag: [tags.keyword, tags.modifier], color: '#ff7fb6', fontWeight: '700' },
		{ tag: [tags.controlKeyword, tags.operatorKeyword], color: '#ff93c1', fontWeight: '700' },
		{ tag: [tags.definitionKeyword, tags.moduleKeyword], color: '#f889ff', fontWeight: '700' },
		{ tag: [tags.name, tags.variableName], color: '#f5edf3' },
		{
			tag: [tags.definition(tags.variableName), tags.definition(tags.propertyName)],
			color: '#ffd5e6'
		},
		{ tag: [tags.function(tags.variableName), tags.labelName], color: '#ffb7d3' },
		{ tag: [tags.propertyName, tags.attributeName], color: '#f3bad2' },
		{ tag: [tags.typeName, tags.className, tags.namespace], color: '#f1a8ff' },
		{ tag: [tags.number, tags.integer, tags.float], color: '#ffcf7d' },
		{ tag: [tags.string, tags.special(tags.string)], color: '#ffd0de' },
		{ tag: [tags.bool, tags.null, tags.atom], color: '#ff9fc4', fontWeight: '700' },
		{
			tag: [tags.comment, tags.lineComment, tags.blockComment],
			color: '#8f7587',
			fontStyle: 'italic'
		},
		{ tag: [tags.punctuation, tags.separator], color: '#cfaec0' },
		{ tag: tags.bracket, color: '#f8d4e4' },
		{ tag: [tags.operator, tags.compareOperator, tags.logicOperator], color: '#f06ca4' },
		{ tag: [tags.meta, tags.annotation], color: '#c899ff' },
		{ tag: tags.invalid, color: '#ffe7ef', backgroundColor: 'rgba(217, 79, 139, 0.35)' }
	]);

	onMount(() => {
		if (!container) return;

		editorView = new EditorView({
			state: EditorState.create({
				doc: value,
				extensions: [
					vimCompartment.of(vimMode ? vim() : []),
					basicSetup,
					python(),
					syntaxHighlighting(pinkSyntax),
					EditorState.tabSize.of(4),
					EditorView.lineWrapping,
					editableCompartment.of(editableExtension(readOnly)),
					EditorView.theme(
						{
							'&': {
								height: '100%',
								backgroundColor: 'transparent',
								fontSize: '1.06rem'
							},
							'.cm-scroller': {
								fontFamily:
									"'IBM Plex Mono', 'SFMono-Regular', 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Liberation Mono', Menlo, monospace",
								lineHeight: '2rem',
								background: 'transparent'
							},
							'.cm-gutters': {
								background: 'transparent !important',
								backgroundColor: 'transparent !important',
								color: '#b28ea5',
								borderRight: '1px solid rgba(255, 214, 236, 0.05)',
								paddingTop: '0.15rem'
							},
							'.cm-gutter': {
								background: 'transparent !important',
								backgroundColor: 'transparent !important'
							},
							'.cm-lineNumbers': {
								background: 'transparent !important',
								backgroundColor: 'transparent !important'
							},
							'.cm-lineNumbers .cm-gutterElement': {
								background: 'transparent !important',
								backgroundColor: 'transparent !important'
							},
							'.cm-activeLineGutter': {
								background: 'transparent !important',
								backgroundColor: 'transparent !important',
								color: '#ffd1e3'
							},
							'.cm-activeLine': {
								backgroundColor: 'rgba(240, 106, 165, 0.07)'
							},
							'.cm-content': {
								padding: '0.15rem 0 5rem'
							},
							'.cm-line': {
								padding: '0'
							},
							'.cm-focused': {
								outline: 'none'
							},
							'.cm-editor': {
								backgroundColor: 'transparent',
								color: '#f5edf3'
							},
							'.cm-selectionBackground, ::selection': {
								backgroundColor: 'rgba(241, 107, 166, 0.24) !important'
							},
							'.cm-cursor, .cm-dropCursor': {
								borderLeftColor: '#f16ba6'
							},
							'.cm-selectionMatch': {
								backgroundColor: 'rgba(255, 127, 182, 0.14)'
							},
							'.cm-matchingBracket': {
								backgroundColor: 'rgba(241, 107, 166, 0.18)',
								color: '#fff4fa',
								outline: '1px solid rgba(255, 182, 217, 0.28)'
							},
							'.cm-panels': {
								backgroundColor: '#161019',
								color: '#f5edf3',
								borderBottom: '1px solid rgba(255,214,236,0.08)'
							},
							'.cm-panels-bottom': {
								borderTop: '1px solid rgba(255,214,236,0.08)'
							},
							'.cm-search > label': {
								fontFamily:
									"'IBM Plex Mono', 'SFMono-Regular', 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Liberation Mono', Menlo, monospace"
							},
							'.cm-button': {
								backgroundImage: 'none',
								backgroundColor: '#2c1e2f',
								color: '#f5edf3',
								border: '1px solid rgba(255,214,236,0.08)'
							},
							'.cm-textfield': {
								backgroundColor: '#211724',
								color: '#f5edf3',
								border: '1px solid rgba(255,214,236,0.08)'
							}
						},
						{ dark: true }
					),
					EditorView.updateListener.of((update) => {
						if (syncingExternalValue) return;
						if (!update.docChanged) return;
						onValueChange?.(update.state.doc.toString());
					})
				]
			}),
			parent: container
		});

		return () => {
			editorView?.destroy();
			editorView = null;
		};
	});

	$effect(() => {
		if (!editorView) return;

		const currentValue = editorView.state.doc.toString();
		if (currentValue === value) return;

		syncingExternalValue = true;
		editorView.dispatch({
			changes: {
				from: 0,
				to: editorView.state.doc.length,
				insert: value
			}
		});
		syncingExternalValue = false;
	});

	$effect(() => {
		if (!editorView) return;

		editorView.dispatch({
			effects: editableCompartment.reconfigure(editableExtension(readOnly))
		});
	});

	$effect(() => {
		if (!editorView) return;

		editorView.dispatch({
			effects: vimCompartment.reconfigure(vimMode ? vim() : [])
		});
	});
</script>

<div bind:this={container} class="h-full min-h-[18rem] w-full"></div>
