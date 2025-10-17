import React from "react";
import { Routes, Route, BrowserRouter, Link } from "react-router";
import EntryInput from "./EntryInput";
import { useStore } from "./store";
import AllEntries from "./AllEntries";
import EntriesByTag from "./EntriesByTag";

export default function App() {
	const addEntry = useStore((store) => store.addEntry);
	const tagCounts = useStore((store) => store.tagCounts);

	React.useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			setDarkMode(e.matches);
		};
		mediaQuery.addEventListener("change", handleChange);
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<BrowserRouter>
			<div className="flex">
				<nav>
					<ul>
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<Link to="/all">All entries</Link>
						</li>
						{[...tagCounts].map(([tag, count]) => (
							<li key={tag}>
								<Link to={`/tag/${tag}`}>
									#{tag} ({count})
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<main>
					<Routes>
						<Route index element={<EntryInput submit={addEntry} />} />
						<Route path="/all" element={<AllEntries />} />
						<Route path="/tag/:tag" element={<EntriesByTag />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	);
}

function setDarkMode(isDark: boolean) {
	if (isDark) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
}
