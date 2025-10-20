import { Link } from "react-router";
import { Button } from "./components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyContent } from "./components/ui/empty";

export default function Route404() {
	return (
		<Empty className="h-full">
			<EmptyHeader>
				<EmptyTitle>This route doesn't exist.</EmptyTitle>
			</EmptyHeader>
			<EmptyContent>
				<Button variant="default" asChild>
					<Link to="/">Go home</Link>
				</Button>
			</EmptyContent>
		</Empty>
	);
}
