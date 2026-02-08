"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV } from "@/config/nav";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/contexts/authStore";

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: user } = useUser();
  const { logout } = useAuthStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group/toggle flex flex-col items-center justify-center gap-1 p-2 h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            className
          )}
          aria-label="Toggle menu"
        >
          <span className="flex h-0.5 w-4 transform rounded-[1px] bg-gray-900 dark:bg-white transition-transform group-data-[state=open]/toggle:translate-y-[3px] group-data-[state=open]/toggle:rotate-45" />
          <span className="flex h-0.5 w-4 transform rounded-[1px] bg-gray-900 dark:bg-white transition-transform group-data-[state=open]/toggle:translate-y-[-3px] group-data-[state=open]/toggle:-rotate-45" />
          <span className="sr-only">Toggle Menu</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 shadow-lg"
        align="end"
        sideOffset={8}
      >
        {DASHBOARD_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path || pathname?.startsWith(item.path + "/");

          return (
            <DropdownMenuItem key={item.path} asChild>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300",
                  isActive && "bg-gray-100 dark:bg-gray-700 font-medium text-gray-900 dark:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            {user?.name || "Profile"}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Sign out */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
