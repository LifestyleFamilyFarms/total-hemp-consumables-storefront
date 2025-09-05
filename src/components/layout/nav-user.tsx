"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type User = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  isAuthenticated?: boolean
} | null

export function NavUser({ user, countryCode }: { user: User; countryCode: string }) {
  const { isMobile } = useSidebar()
  const name = user?.name ?? "Guest"
  const email = user?.email ?? "Not signed in"
  const initials =
    (name || "TH")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatarUrl ?? ""} alt={name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">{name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.isAuthenticated ? (
              <>
                <DropdownMenuItem asChild><Link href={`/${countryCode}/account`}>Account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/${countryCode}/account/orders`}>Orders</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/${countryCode}/account/addresses`}>Addresses</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* TODO: hook up real sign out */}
                <DropdownMenuItem asChild><Link href={`/${countryCode}/logout`}>Sign out</Link></DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild><Link href={`/${countryCode}/login`}>Sign in</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/${countryCode}/register`}>Create account</Link></DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}