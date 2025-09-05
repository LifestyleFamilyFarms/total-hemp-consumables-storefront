"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Topbar({ countryCode }: { countryCode: string }) {
  return (
    <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-1" />
        <Link href={`/${countryCode}`} className="font-extrabold tracking-tight">
          Total&nbsp;Hemp
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {/* check this url to make sure it is correct */}
        <Button asChild size="sm" className="rounded-full">
          <Link href={`/${countryCode}/account`}>Sign up</Link>
        </Button>
      </div>
    </div>
  )
}