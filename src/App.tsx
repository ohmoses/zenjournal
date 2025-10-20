import React from "react";
import { Routes, Route, BrowserRouter } from "react-router";
import Route404 from "./404";
import JournalPage from "./journal-page";
import AppSidebar from "./app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";

export default function App() {
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
			<SidebarProvider>
				<AppSidebar />
				<main className="flex-1">
					<Routes>
						<Route index element={<JournalPage />} />
						<Route path="/tag/:tag" element={<JournalPage />} />
						<Route path="*" element={<Route404 />} />
					</Routes>
				</main>
			</SidebarProvider>
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
