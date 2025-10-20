import SuperJSON from "superjson";
import { create } from "zustand";
import type { PersistStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { memoize } from "proxy-memoize";

export type Entry = {
	id: string;
	text: string;
	tags: Set<string>;
	createdAt: Temporal.ZonedDateTime;
	lastModifiedAt: Temporal.ZonedDateTime | null;
};

export type DayEntries = {
	date: Temporal.PlainDate;
	entries: Array<Entry>;
};

type Store = {
	entries: Array<Entry>;
	tagCounts: Map<string, number>;
	addEntry: (entry: { text: string; tags: Set<string> }) => void;
	updateEntry: (id: Entry["id"], entry: { text: string; tags: Set<string> }) => void;
	deleteEntry: (id: Entry["id"]) => void;
};

SuperJSON.registerCustom<Temporal.ZonedDateTime, string>(
	{
		isApplicable: (v): v is Temporal.ZonedDateTime => v instanceof Temporal.ZonedDateTime,
		serialize: (v) => v.toString(),
		deserialize: (v) => Temporal.ZonedDateTime.from(v),
	},
	"ZonedDateTime",
);

const storage: PersistStorage<Store> = {
	getItem: (name) => {
		const str = localStorage.getItem(name);
		if (!str) {
			return null;
		}
		try {
			return SuperJSON.parse(str);
		} catch (err) {
			console.error("Failed to parse storage:", err);
			throw err;
		}
	},
	setItem: (name, value) => {
		localStorage.setItem(name, SuperJSON.stringify(value));
	},
	removeItem: (name) => localStorage.removeItem(name),
};

export const useJournalStore = create<Store>()(
	persist(
		(set, get) => ({
			entries: [],
			tagCounts: new Map(),
			addEntry({ text, tags }) {
				const createdAt = Temporal.ZonedDateTime.from(Temporal.Now.zonedDateTimeISO());
				const entry: Entry = {
					id: crypto.randomUUID(),
					text,
					tags,
					createdAt,
					lastModifiedAt: null,
				};
				set({ entries: [...get().entries, entry] });

				if (tags.size === 0) {
					return;
				}
				const newTagCounts = new Map(get().tagCounts);
				for (const tag of tags) {
					const count = newTagCounts.get(tag) ?? 0;
					newTagCounts.set(tag, count + 1);
				}
				set({ tagCounts: newTagCounts });
			},
			updateEntry(id, { text, tags }) {
				const lastModifiedAt = Temporal.ZonedDateTime.from(Temporal.Now.zonedDateTimeISO());
				const { entries, addEntry } = get();
				const index = entries.findIndex((entry) => entry.id === id);
				if (index < 0) {
					return addEntry({ text, tags });
				}
				const oldEntry = entries[index];
				const newEntry: Entry = {
					...oldEntry,
					text,
					tags,
					lastModifiedAt,
				};
				set({ entries: entries.with(index, newEntry) });

				const tagsAdded = tags.difference(oldEntry.tags);
				const tagsRemoved = oldEntry.tags.difference(tags);
				if (tagsAdded.size === 0 && tagsRemoved.size === 0) {
					return;
				}
				const newTagCounts = new Map(get().tagCounts);
				for (const tag of tagsAdded) {
					const count = newTagCounts.get(tag) ?? 0;
					newTagCounts.set(tag, count + 1);
				}
				for (const tag of tagsRemoved) {
					const count = newTagCounts.get(tag) ?? 1;
					if (count <= 1) {
						newTagCounts.delete(tag);
					} else {
						newTagCounts.set(tag, count - 1);
					}
				}
				set({ tagCounts: newTagCounts });
			},
			deleteEntry(id) {
				const { entries } = get();
				const index = entries.findIndex((entry) => entry.id === id);
				if (index < 0) {
					return;
				}
				set({ entries: entries.toSpliced(index, 1) });

				const { tags } = entries[index];
				if (tags.size === 0) {
					return;
				}
				const newTagCounts = new Map(get().tagCounts);
				for (const tag of tags) {
					const count = newTagCounts.get(tag) ?? 1;
					if (count <= 1) {
						newTagCounts.delete(tag);
					} else {
						newTagCounts.set(tag, count - 1);
					}
				}
				set({ tagCounts: newTagCounts });
			},
		}),
		{
			name: "journal_store",
			storage,
		},
	),
);

export const getGroupedAllEntries = memoize(({ entries }: Store) => groupEntriesByDate(entries));

export const getGroupedEntriesByTag = (tag: string) =>
	memoize(({ entries }: Store) => groupEntriesByDate(entries.filter(({ tags }) => tags.has(tag))));

function groupEntriesByDate(entries: Array<Entry>) {
	const groupedMap = entries.reduce(toDayEntriesMap, new Map<string, DayEntries>());
	return [...groupedMap.values()].sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
}

function toDayEntriesMap(acc: Map<string, DayEntries>, entry: Entry) {
	const date = entry.createdAt.toPlainDate();
	const key = date.toString();
	const existing = acc.get(key);
	if (existing) {
		existing.entries.push(entry);
	} else {
		acc.set(key, { date, entries: [entry] });
	}
	return acc;
}
