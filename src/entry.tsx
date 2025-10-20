import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { useJournalStore, type Entry } from "./store";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from "./components/ui/dialog";
import { Link } from "react-router";

export default function Entry({
	entry: { id, text, tags, createdAt, lastModifiedAt },
	setToEdit,
	omitTag,
}: {
	entry: Entry;
	setToEdit: () => void;
	omitTag?: string;
}) {
	const sortedTags = [...tags].filter((t) => t !== omitTag).sort((a, b) => a.localeCompare(b));
	const deleteEntry = useJournalStore((store) => store.deleteEntry);

	return (
		// The transition duration for the bg color and for the buttons opacity has to be different
		// to make them optically more similar
		<div className="group hover:bg-muted relative flex flex-col gap-1 rounded-md px-2 py-1 transition-colors duration-100">
			<div className="flex flex-col gap-2.5 text-sm md:text-[15px]">
				{text.length > 0 ? (
					text.split("\n\n").map((p, index) => (
						<p key={index} className="whitespace-pre-wrap">
							{p}
						</p>
					))
				) : (
					<p className="text-muted-foreground italic">&lt;empty message&gt;</p>
				)}
			</div>
			<footer className="text-muted-foreground flex items-start gap-2.5 text-xs">
				<div>
					{toTimeString(createdAt)}
					{lastModifiedAt && ` (Edited ${toTimeString(lastModifiedAt)})`}
				</div>
				{sortedTags.length > 0 && (
					<>
						{"•"}
						<div className="flex gap-1.5">
							{sortedTags.map((tag) => (
								<Link
									to={`/tag/${tag}`}
									key={tag}
									className="hover:decoration-muted-foreground underline decoration-transparent transition-colors"
								>
									#{tag}
								</Link>
							))}
						</div>
					</>
				)}
			</footer>
			<div className="group-hover:bg-muted absolute top-0 right-0 flex items-center gap-1 rounded-md bg-transparent px-3 py-2.5 opacity-0 transition-[opacity,colors] duration-200 group-hover:opacity-100 md:min-h-12">
				<Button
					size="icon"
					variant="ghost"
					className="text-muted-foreground hover:text-foreground size-7"
					onClick={setToEdit}
				>
					<Pencil />
				</Button>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							className="text-muted-foreground hover:text-destructive size-7"
						>
							<Trash2 />
						</Button>
					</DialogTrigger>
					<DialogContent>
						Do you want to delete entry "{text.length <= 25 ? text : text.slice(0, 25) + "…"}"?
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="secondary">Cancel</Button>
							</DialogClose>
							<DialogClose asChild>
								<Button
									variant="destructive"
									onClick={() => {
										deleteEntry(id);
									}}
								>
									Delete
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

function toTimeString(date: Temporal.ZonedDateTime) {
	return date.toPlainTime().toLocaleString(undefined, { timeStyle: "short" });
}
