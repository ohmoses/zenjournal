import React from "react";
import { Routes, Route, BrowserRouter, Link } from "react-router";
import { useJournalStore } from "./store";
import Route404 from "./404";
import JournalPage from "./journal-page";

export default function App() {
	const tagCounts = useJournalStore((store) => store.tagCounts);

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
							<Link to="/">main</Link>
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
						<Route index element={<JournalPage />} />
						<Route path="/tag/:tag" element={<JournalPage />} />
						<Route path="*" element={<Route404 />} />
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
