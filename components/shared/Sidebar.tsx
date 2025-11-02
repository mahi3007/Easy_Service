"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, User, HelpCircle, Settings, Briefcase, CreditCard, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userType: "customer" | "provider"
}

export default function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  
  const customerLinks = [
    { name: "Home", href: "/customer/home", icon: Home },
    { name: "Services", href: "/services", icon: LayoutGrid },
    { name: "Bookings", href: "/customer/bookings", icon: ShoppingBag },
    { name: "Profile", href: "/customer/profile", icon: User },
    { name: "Support", href: "/customer/support", icon: HelpCircle },
  ]
  
  const providerLinks = [
    { name: "Home", href: "/provider/home", icon: Home },
    { name: "Job Requests", href: "/provider/jobs", icon: Briefcase },
    { name: "Earnings", href: "/provider/earnings", icon: CreditCard },
    { name: "Profile", href: "/provider/profile", icon: User },
    { name: "Settings", href: "/provider/settings", icon: Settings },
  ]
  
  const links = userType === "customer" ? customerLinks : providerLinks
  
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="flex flex-col space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100",
                pathname === link.href ? "bg-slate-100 font-medium" : "text-slate-700"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}