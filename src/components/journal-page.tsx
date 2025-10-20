import { useShallow } from "zustand/shallow";
import {
	getGroupedAllEntries,
	getGroupedEntriesByTag,
	useJournalStore,
	type Entry as EntryType,
} from "../store";
import EntryInput from "./entry-input";
import React from "react";
import { Link, useParams } from "react-router";
import Entry from "./entry";
import { cn } from "../lib/utils";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "./ui/empty";
import { Button } from "./ui/button";
import { isValidTag } from "../lib/tag";

export default function JournalPage() {
	const { tag } = useParams();
	const { isMobile } = useSidebar();
	const entries = useJournalStore(
		useShallow(tag ? getGroupedEntriesByTag(tag) : getGroupedAllEntries),
	);
	const { addEntry, updateEntry } = useJournalStore(
		useShallow((store) => ({
			addEntry: store.addEntry,
			updateEntry: store.updateEntry,
		})),
	);
	const [entryToEdit, setEntryToEdit] = React.useState<EntryType | null>(null);
	const entriesEndElement = React.useRef<HTMLLIElement>(null);

	function submit({ text, tags }: { text: string; tags: Set<string> }) {
		if (entryToEdit) {
			const isSame =
				text === entryToEdit.text &&
				tags.size === entryToEdit.tags.size &&
				tags.isSubsetOf(entryToEdit.tags);
			if (!isSame) {
				// Don't auto-add the current tag to edited messages; removing the tag was intentional
				updateEntry(entryToEdit.id, { text, tags });
			}
			setEntryToEdit(null);
		} else {
			// Otherwise auto-add the current tag
			const newTags = tag ? new Set(tags).add(tag) : tags;
			addEntry({ text, tags: newTags });
			setTimeout(() => entriesEndElement.current?.scrollIntoView());
		}
	}

	React.useLayoutEffect(() => {
		entriesEndElement.current?.scrollIntoView();
	}, [tag]);

	if (tag && !isValidTag(tag)) {
		return (
			<Empty className="h-full">
				<EmptyHeader>
					<EmptyTitle>Invalid tag.</EmptyTitle>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="default" asChild>
						<Link to="/">Go home</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	// Tailwind doesn't allow interpolating strings; these all have to be the same number
	const MAIN_Y_GAP = "gap-6";
	const MAIN_Y_AFTER_H = "after:h-6";
	const MAIN_Y_MB = "mb-6";
	const MAIN_Y_PB = "pb-6";

	const DAYS_Y_GAP = "gap-3";
	const DAYS_Y_NEG_MT = "mt-[calc(var(--spacing)*-3)]";

	// Fade effect on the top and bottom of entries
	const fadeClasses = cn(
		MAIN_Y_AFTER_H,
		"after:pointer-events-none after:absolute after:right-0 after:left-0 after:from-[var(--background)] after:to-transparent after:content-['']",
	);
	const fadeTopClasses = cn(
		fadeClasses,
		// Hack to not cover bottom border. Not sure if there's a better way
		"after:top-[calc(100%+1px)]",
		"after:bg-gradient-to-b",
	);
	const fadeBottomClasses = cn(fadeClasses, "after:bottom-full", "after:bg-gradient-to-t");

	return (
		<>
			<header
				className={cn(
					MAIN_Y_MB,
					"bg-sidebar sticky top-0 z-10 flex w-full gap-3 border-b px-5 py-3",
					fadeTopClasses,
				)}
			>
				{isMobile && <SidebarTrigger />}
				<h1 className="text-xl font-medium tracking-wide">{tag ? `#${tag}` : "main"}</h1>
			</header>
			<div className={cn(MAIN_Y_GAP, "m-auto flex max-w-xl flex-col px-4")}>
				{entries.length > 0 && (
					<ol className={cn(DAYS_Y_GAP, "flex flex-col")}>
						{entries.map(({ date, entries }) => (
							<li key={date.toString()}>
								<section className="flex flex-col gap-3">
									<header className="flex justify-center">
										<h2 className="rounded-full border px-2 py-0.5 font-medium shadow-xs">
											<time dateTime={date.toString()}>
												{date.toLocaleString(undefined, { month: "long", day: "numeric" })}
											</time>
										</h2>
									</header>
									<ol className="flex flex-col gap-1">
										{entries.map((entry) => (
											<Entry
												key={entry.id}
												entry={entry}
												setToEdit={() => setEntryToEdit(entry)}
												omitTag={tag}
											/>
										))}
									</ol>
								</section>
							</li>
						))}
						{/* Remove the extra gap using negative margin */}
						<li ref={entriesEndElement} className={DAYS_Y_NEG_MT} />
					</ol>
				)}
				<div className={cn(MAIN_Y_PB, "bg-background sticky bottom-0 z-10", fadeBottomClasses)}>
					<EntryInput
						// Clear input by re-mounting when tag changes
						key={tag}
						submit={submit}
						entryToEdit={entryToEdit}
						cancelEdit={() => setEntryToEdit(null)}
						editLast={() => {
							const lastEntry = entries.at(-1)?.entries.at(-1);
							if (lastEntry) {
								setEntryToEdit(lastEntry);
							}
						}}
					/>
				</div>
			</div>
		</>
	);
}
