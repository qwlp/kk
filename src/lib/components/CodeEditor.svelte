<script lang="ts">
	import { basicSetup } from 'codemirror';
	import { python } from '@codemirror/lang-python';
	import { Compartment, EditorState } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { EditorView } from '@codemirror/view';
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

	onMount(() => {
		if (!container) return;

		editorView = new EditorView({
			state: EditorState.create({
				doc: value,
				extensions: [
					vimCompartment.of(vimMode ? vim() : []),
					basicSetup,
					python(),
					oneDark,
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
								color: '#9b7f92',
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
								color: '#dcb7c8'
							},
							'.cm-activeLine': {
								backgroundColor: 'rgba(240, 106, 165, 0.045)'
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
							'.cm-matchingBracket': {
								backgroundColor: 'rgba(241, 107, 166, 0.15)',
								color: '#fff4fa'
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
