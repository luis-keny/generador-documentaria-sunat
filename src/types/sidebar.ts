import type { LucideIcon } from "lucide-react";

export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarTeam {
  name: string;
  logo: React.ElementType;
  plan: "Enterprise" | "Startup" | "Free";
}

export interface SidebarNavItemChild {
  title: string;
  url: string;
}

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SidebarNavItemChild[];
}

export interface SidebarContent {
  user: SidebarUser;
  teams: SidebarTeam[];
  navMain: {
    title: string;
    navItems: SidebarNavItem[]
  }[];
  navSecondary: SidebarNavItem[];
}