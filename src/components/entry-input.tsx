import React from "react";
import type { Entry } from "../store";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, SendHorizonal, X } from "lucide-react";
import { cn } from "../lib/utils";
import { extractTag } from "../lib/tag";

export default function EntryInput({
	submit,
	entryToEdit,
	cancelEdit,
	editLast,
}: {
	submit: (entry: { text: string; tags: Set<string> }) => void;
	entryToEdit: Entry | null;
	cancelEdit: () => void;
	editLast: () => void;
}) {
	const [text, setText] = React.useState("");
	const [tags, setTags] = React.useState(new Set<string>());
	const sortedTags = [...tags].sort();
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const cursorToRestore = React.useRef<number | null>(null);
	const prevEntryToEdit = React.useRef(entryToEdit);
	const draftText = React.useRef("");
	const draftTags = React.useRef(new Set<string>());

	// Copying Telegram behavior
	const isArrowUpEnabled = text.length === 0;
	const isSaveButtonDisabled = text.length === 0 && tags.size === 0;
	const isSaveFnDisabled = text.trim().length === 0 && tags.size === 0;

	if (prevEntryToEdit.current?.id !== entryToEdit?.id) {
		// Case 1: Edit initiated
		if (!prevEntryToEdit.current && entryToEdit) {
			draftText.current = text;
			setText(entryToEdit.text);
			draftTags.current = tags;
			setTags(entryToEdit.tags);
		}
		// Case 2: Entry to edit changed
		if (prevEntryToEdit.current && entryToEdit) {
			setText(entryToEdit.text);
			setTags(entryToEdit.tags);
		}
		// Case 3: Edit was submitted or cancelled
		else if (prevEntryToEdit.current && !entryToEdit) {
			setText(draftText.current);
			draftText.current = "";
			setTags(draftTags.current);
			draftTags.current = new Set();
		}
		prevEntryToEdit.current = entryToEdit;
		if (textareaRef.current) {
			textareaRef.current.focus();
			const len = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(len, len);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			save();
		}
		if (e.key === "Escape" && entryToEdit) {
			cancelEdit();
		}
		if (e.key === "ArrowUp" && isArrowUpEnabled) {
			editLast();
		}
	}

	function save() {
		if (isSaveFnDisabled) {
			return;
		}
		// Add extra space so that we can extract a tag at the end of the text without treating
		// submission as a special case vs mid-typing.
		const result = extractTag(text + " ");
		if (result) {
			submit({ text: result.text.trim(), tags: new Set(tags).add(result.tag) });
		} else {
			submit({ text: text.trim(), tags });
		}
		if (!entryToEdit) {
			setTags(new Set());
			setText("");
		}
		requestAnimationFrame(() => textareaRef.current?.focus());
	}

	function handleChange({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) {
		const result = extractTag(value);
		if (result === null) {
			setText(value);
			return;
		}
		cursorToRestore.current = result.spliceIndex;
		setTags(new Set(tags).add(result.tag));
		setText(result.text);
	}

	function removeTag(tag: string) {
		setTags((tags) => {
			const newTags = new Set(tags);
			newTags.delete(tag);
			return newTags;
		});
	}

	React.useLayoutEffect(() => {
		if (textareaRef.current && cursorToRestore.current) {
			const pos = cursorToRestore.current;
			textareaRef.current.setSelectionRange(pos, pos);
			cursorToRestore.current = null;
		}
	}, [text]);

	return (
		<Card
			className={cn(
				"mt-0.5 flex min-h-16 w-full gap-0 p-0",
				// Use focus ring on the whole Card instead of the Textarea
				"focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[2px]",
			)}
		>
			{entryToEdit && (
				<div className="bg-muted flex h-9 items-center gap-1 rounded-t-xl border-b px-3 py-2 text-sm">
					<div className="text-primary font-medium">Editing:</div>
					{entryToEdit.text ? (
						<div className="text-muted-foreground overflow-hidden overflow-ellipsis whitespace-nowrap">
							{entryToEdit.text}
						</div>
					) : (
						<div className="text-muted-foreground italic">&lt;empty message&gt;</div>
					)}
				</div>
			)}
			<div className="relative flex gap-2 p-3">
				<div className="flex flex-1 flex-col gap-1.5">
					{/* Covering up the resize handle 😬 */}
					<div className="after:bg-card relative after:absolute after:right-0 after:bottom-0 after:h-2 after:w-2 after:text-white after:content-['']">
						<Textarea
							autoFocus
							ref={textareaRef}
							value={text}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							className={cn(
								"max-h-64 min-h-11 md:text-[15px]",
								// Make invisible
								"rounded-none border-none p-0 shadow-none dark:bg-transparent",
								// Remove focus ring (moved to Card)
								"focus-visible:border-none focus-visible:shadow-none focus-visible:ring-0",
							)}
						/>
					</div>
					{sortedTags.length > 0 && (
						<ul className="flex gap-2">
							{sortedTags.map((tag) => (
								<li key={tag} className="leading-none">
									<Badge variant="default" className="h-5 py-0">
										{tag}
										<button
											className="text-primary-foreground/70 hover:text-primary-foreground size-4 rounded-sm transition-colors"
											onClick={(_) => removeTag(tag)}
										>
											<X className="size-4" />
										</button>
									</Badge>
								</li>
							))}
						</ul>
					)}
				</div>
				<div
					className={cn(
						"flex items-center gap-1 self-end",
						// Optical adjustment to vertically center in an empty input:
						// (textarea min-h (11) - button size (10)) / 2 = 0.5
						"pb-0.5",
					)}
				>
					{entryToEdit && (
						<Button variant="ghost" onClick={cancelEdit} className="size-10 rounded-full">
							<X className="size-6" />
						</Button>
					)}
					<Button onClick={save} disabled={isSaveButtonDisabled} className="size-10 rounded-full">
						{entryToEdit ? <Check className="size-6" /> : <SendHorizonal className="size-6" />}
					</Button>
				</div>
			</div>
		</Card>
	);
}
