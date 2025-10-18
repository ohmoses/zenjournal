import { useShallow } from "zustand/shallow";
import { getGroupedAllEntries, getGroupedEntriesByTag, useJournalStore, type Entry } from "./store";
import EntryInput from "./entry-input";
import React from "react";
import { useParams } from "react-router";

export default function JournalPage() {
	const { tag } = useParams();
	const entries = useJournalStore(
		useShallow(tag ? getGroupedEntriesByTag(tag) : getGroupedAllEntries),
	);
	const { addEntry, updateEntry, deleteEntry } = useJournalStore(
		useShallow((store) => ({
			addEntry: store.addEntry,
			updateEntry: store.updateEntry,
			deleteEntry: store.deleteEntry,
		})),
	);
	const [entryToEdit, setEntryToEdit] = React.useState<Entry | null>(null);
	const [entryToDelete, setEntryToDelete] = React.useState<Entry | null>(null);

	function submit({ text, tags }: { text: string; tags: Set<string> }) {
		if (entryToEdit) {
			// Don't auto-add the current tag to edited messages; removing the tag was intentional
			updateEntry(entryToEdit.id, { text, tags });
			setEntryToEdit(null);
		} else {
			const newTags = tag ? new Set(tags).add(tag) : tags;
			addEntry({ text, tags: newTags });
		}
	}

	if (tag && !/^[A-Za-z0-9_-]+$/.test(tag)) {
		return <div>Invalid tag.</div>;
	}

	return (
		<main>
			<h1 className="font-semibold text-lg">{tag ? `#${tag}` : "main"}</h1>
			{entryToDelete && (
				<div>
					Want to delete entry "
					{entryToDelete.text.length <= 10
						? entryToDelete.text
						: entryToDelete.text.slice(0, 10) + "…"}
					"?{" "}
					<span className="inline-flex gap-1">
						<button
							onClick={(_) => {
								setEntryToDelete(null);
								deleteEntry(entryToDelete.id);
							}}
						>
							[delete]
						</button>
						<button
							onClick={(_) => {
								setEntryToDelete(null);
							}}
						>
							[cancel]
						</button>
					</span>
				</div>
			)}
			<ol>
				{entries.map(({ date, entries }) => (
					<li key={date.toString()}>
						<section>
							<header>{date.toLocaleString(undefined, { month: "long", day: "numeric" })}</header>
							<ol>
								{entries.map((entry) => (
									<li key={entry.id}>
										[
										{entry.createdAt
											.toPlainTime()
											.toLocaleString(undefined, { timeStyle: "short" })}
										] {entry.text}{" "}
										<span className="inline-flex gap-1">
											{[...entry.tags]
												.filter((t) => t !== tag)
												.map((tag) => (
													<span key={tag} className="bg-blue-500">
														#{tag}
													</span>
												))}
										</span>{" "}
										<span className="inline-flex gap-1">
											<button onClick={(_) => setEntryToEdit(entry)}>[edit]</button>
											<button onClick={(_) => setEntryToDelete(entry)}>[delete]</button>
										</span>
									</li>
								))}
							</ol>
						</section>
					</li>
				))}
			</ol>
			<EntryInput
				// Clear input when tag changes
				key={tag}
				submit={submit}
				entryToEdit={entryToEdit}
				cancelEdit={() => setEntryToEdit(null)}
			/>
		</main>
	);
}
