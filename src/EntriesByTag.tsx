import { useShallow } from "zustand/shallow";
import { getGroupedEntriesByTag, useStore } from "./store";
import DayEntries from "./DayEntries";
import { useParams } from "react-router";

export default function EntriesByTag() {
	const { tag } = useParams();
	const entries = useStore(useShallow(getGroupedEntriesByTag(tag!)));

	if (entries.length === 0) {
		return <div>No entries yet.</div>;
	}

	return (
		<div>
			<h1 className="font-semibold text-2xl">#{tag}</h1>
			<div>
				{entries.map((dayEntries) => (
					<DayEntries key={dayEntries.date.toString()} data={dayEntries} />
				))}
			</div>
		</div>
	);
}
