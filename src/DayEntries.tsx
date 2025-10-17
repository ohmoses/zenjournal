import type { DayEntries } from "./store";

export default function DayEntries({
	data: { date, entries },
	withTags = false,
}: {
	data: DayEntries;
	withTags?: boolean;
}) {
	return (
		<section>
			<h2 className="font-semibold text-xl">
				{date.toLocaleString(undefined, { month: "long", day: "numeric" })}
			</h2>
			<ol>
				{entries.map((entry) => (
					<p key={entry.id}>
						[{entry.createdAt.toPlainTime().toLocaleString(undefined, { timeStyle: "short" })}]{" "}
						{entry.text}{" "}
						{withTags && (
							<span className="inline-flex gap-1">
								{[...entry.tags.values()].map((tag) => (
									<span key={tag} className="bg-blue-500">
										#{tag}
									</span>
								))}
							</span>
						)}
					</p>
				))}
			</ol>
		</section>
	);
}
