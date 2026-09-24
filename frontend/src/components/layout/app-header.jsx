"use client";

import { cn } from "@/lib/utils";
import { Menu, X, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";

const roleColors = {
  admin: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  vendor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  user: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export function AppHeader({
  user,
  onMobileMenuToggle,
  mobileMenuOpen,
  onLogout,
  className,
}) {
  const role = user?.role?.toLowerCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6",
        className
      )}
    >
      {/* Left: Mobile Menu + Search */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onMobileMenuToggle}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        {role === "user" && (
          <h1 className="truncate text-base font-bold sm:text-lg">
            Welcome to User Dashboard
          </h1>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-2 py-1.5"
              >
                <Avatar size="sm">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-bold",
                      roleColors[role] || "bg-blue-500/10 text-blue-600"
                    )}
                  >
                    {user.fullName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {user.role}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
