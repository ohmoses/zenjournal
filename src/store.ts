import SuperJSON from "superjson";
import { create } from "zustand";
import type { PersistStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { memoize } from "proxy-memoize";

type Entry = {
	id: string;
	text: string;
	tags: Set<string>;
	createdAt: Temporal.ZonedDateTime;
};

export type DayEntries = {
	date: Temporal.PlainDate;
	entries: Array<Entry>;
};

type Store = {
	entries: Array<Entry>;
	tags: Map<string, number>;
	addEntry: (text: string, tags: Set<string>) => void;
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
		if (!str) return null;
		return SuperJSON.parse(str);
	},
	setItem: (name, value) => {
		localStorage.setItem(name, SuperJSON.stringify(value));
	},
	removeItem: (name) => localStorage.removeItem(name),
};

export const useStore = create<Store>()(
	persist(
		(set, get) => ({
			entries: [],
			tags: new Map(),
			addEntry(text, tags) {
				const createdAt = Temporal.ZonedDateTime.from(Temporal.Now.zonedDateTimeISO());
				const entry: Entry = {
					id: crypto.randomUUID(),
					text,
					tags,
					createdAt,
				};
				if (tags.size > 0) {
					const newTags = new Map(get().tags);
					for (const tag of tags) {
						const count = newTags.get(tag) ?? 0;
						newTags.set(tag, count + 1);
					}
					set({ tags: newTags });
				}
				set({ entries: [...get().entries, entry] });
			},
		}),
		{
			name: "store",
			storage,
		},
	),
);

export const getGroupedAllEntries = memoize(({ entries }: Store) => groupEntriesByDate(entries));

export const getGroupedEntriesByTag = (tag: string) =>
	memoize(({ entries }: Store) => {
		const entriesByTag = entries.filter(({ tags }) => tags.has(tag));
		return groupEntriesByDate(entriesByTag);
	});

function groupEntriesByDate(entries: Array<Entry>) {
	const groupedMap = entries.reduce((map, entry) => {
		const date = entry.createdAt.toPlainDate();
		const key = date.toString();
		const existing = map.get(key);
		if (existing) {
			existing.entries.push(entry);
		} else {
			map.set(key, { date, entries: [entry] });
		}
		return map;
	}, new Map<string, DayEntries>());
	const groupedArray = [...groupedMap.values()];
	groupedArray.sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
	return groupedArray;
}
