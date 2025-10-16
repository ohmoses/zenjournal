import React from "react";

type RawEntry = {
	text: string;
	tags: Set<string>;
};

export default function EntryInput({ submit }: { submit: (entry: RawEntry) => void }) {
	const [text, setText] = React.useState("");
	const [tags, setTags] = React.useState(new Set<string>());
	const sortedTags = [...tags].sort();
	const isEmpty = tags.size === 0 && text.length === 0;
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const cursorToRestore = React.useRef<number | null>(null);

	function submitListener(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			save();
		}
	}

	function save() {
		if (isEmpty) {
			return;
		}
		// Add extra space so that we can extract a tag at the end of the text
		// without treating submission as a special case vs mid-typing.
		const result = extractTag(text + " ");
		const entry = result
			? { tags: new Set(tags).add(result.tag), text: result.text.trim() }
			: { tags, text: text.trim() };
		submit(entry);
		setTags(new Set());
		setText("");
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
		<div>
			<ul>
				{sortedTags.map((tag) => (
					<li key={tag}>
						{tag} <button onClick={(_) => removeTag(tag)}>×</button>
					</li>
				))}
			</ul>
			<textarea
				autoFocus
				ref={textareaRef}
				value={text}
				onChange={handleChange}
				onKeyDown={submitListener}
			/>
			<button onClick={save} disabled={isEmpty}>
				Save
			</button>
		</div>
	);
}

const TAG_REGEX =
	/(?<prevChar>[^A-Za-z0-9_-]|^)#(?<tag>[A-Za-z0-9_-]+)(?<nextChar>[^A-Za-z0-9_-])/d;

function extractTag(raw: string): { tag: string; text: string; spliceIndex: number } | null {
	const match = raw.match(TAG_REGEX);
	if (match === null) {
		return null;
	}
	const { prevChar, tag, nextChar } = match.groups!;
	const [tagStartIdx, tagEndIdx] = match.indices!.groups!.tag!;

	const removePrev = prevChar === " " && nextChar === "\n";
	const removeNext =
		(prevChar === "" && nextChar === " ") ||
		(prevChar === " " && nextChar === " ") ||
		(prevChar === "\n" && nextChar === "\n");

	const removeFrom = removePrev ? tagStartIdx - 2 : tagStartIdx - 1;
	const removeTo = removeNext ? tagEndIdx + 1 : tagEndIdx;

	const text = raw.slice(0, removeFrom) + raw.slice(removeTo);
	return { tag, text, spliceIndex: removeFrom };
}
