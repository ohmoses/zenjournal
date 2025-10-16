import { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router";
import EntryInput from "./EntryInput";

export default function App() {
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = (e: MediaQueryListEvent) => {
			if (e.matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<EntryInput
							submit={({ tags, text }) => {
								console.log("tags:", [...tags]);
								console.log("text:", JSON.stringify(text));
								console.log("---");
							}}
						/>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
