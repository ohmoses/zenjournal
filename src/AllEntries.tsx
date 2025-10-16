import { useShallow } from "zustand/shallow";
import { getGroupedAllEntries, useStore } from "./store";
import DayEntries from "./DayEntries";

export default function AllEntries() {
	const entries = useStore(useShallow(getGroupedAllEntries));

	if (entries.length === 0) {
		return <div>No entries yet.</div>;
	}

	return (
		<div>
			<div>
				{entries.map((dayEntries) => (
					<DayEntries key={dayEntries.date.toString()} data={dayEntries} withTags />
				))}
			</div>
		</div>
	);
}
