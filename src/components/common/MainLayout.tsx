"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming utils file exists from shadcn setup
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Building,
  Settings,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

function NavItem({ href, icon: Icon, label, isCollapsed }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-1">{label}</span>}
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={5}>
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/calendario", icon: CalendarDays, label: "Calendário" },
    { href: "/escalas", icon: ClipboardList, label: "Escalas" },
    { href: "/produtores", icon: Users, label: "Produtores" },
    { href: "/plantas", icon: Building, label: "Plantas" },
    // { href: "/configuracoes", icon: Settings, label: "Configurações" }, // Add later if needed
  ];

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "68px" },
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background sm:flex"
      >
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base mb-4 ${isCollapsed ? '' : 'self-start ml-3'}`}
          >
             {/* Placeholder for Logo */} 
            <span className="sr-only">Logo</span>
          </Link>
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button
                    variant="outline"
                    size="icon"
                    className="mt-auto rounded-lg"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    <span className="sr-only">{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                 {isCollapsed ? "Expandir" : "Recolher"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <motion.div
        className="flex flex-col sm:gap-4 sm:py-4"
        animate={{ paddingLeft: isCollapsed ? "68px" : "280px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header - Mobile & Desktop */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                   {/* Placeholder for Logo */} 
                  <span className="sr-only">Logo</span>
                </Link>
                {navItems.map((item) => (
                   <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb/Title Area (Placeholder) */}
          <div className="flex-1">
            {/* Add Breadcrumb component here later */}
          </div>

          {/* Header Right Actions (Placeholder) */}
          <div className="flex items-center gap-4">
            {/* Add Notification Icon/Dropdown here later */}
            {/* Add User Menu/Dropdown here later */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

