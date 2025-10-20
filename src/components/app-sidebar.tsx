import { NavLink, useLocation } from "react-router";
import { useJournalStore } from "../store";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar";

export default function AppSidebar() {
	const location = useLocation();
	const tagCounts = useJournalStore((store) => store.tagCounts);
	const tagsSorted = [...tagCounts].sort(([tag1], [tag2]) => tag1.localeCompare(tag2));

	return (
		<Sidebar>
			<SidebarHeader className="p-4">
				<span className="text-2xl font-semibold tracking-wider">ZenJournal</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={location.pathname === "/"}>
									<NavLink to="/">main</NavLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				{tagsSorted.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>Tags</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{tagsSorted.map(([tag]) => {
									const path = `/tag/${tag}`;
									return (
										<SidebarMenuItem key={tag}>
											<SidebarMenuButton asChild isActive={location.pathname === path}>
												<NavLink to={path}>#{tag}</NavLink>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
		</Sidebar>
	);
}
