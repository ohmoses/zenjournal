const TAG_CHARS = "A-Za-z0-9_-";
const TAG_REGEX = new RegExp(`^[${TAG_CHARS}]+$`);
const TAG_EXTRACT_REGEX = new RegExp(
	`(?<prevChar>[^${TAG_CHARS}]|^)#(?<tag>[${TAG_CHARS}]+)(?<nextChar>[^${TAG_CHARS}])`,
	"d",
);

export function isValidTag(tag: string) {
	return TAG_REGEX.test(tag);
}

export function extractTag(raw: string): { tag: string; text: string; spliceIndex: number } | null {
	const match = raw.match(TAG_EXTRACT_REGEX);
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
