'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigation } from "@/constants/navigation"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import NavUser from "./NavUser";
import SidebarLogoHeader from "./SidebarLogoHeader"
import { NavLinkButton } from "./NavLinkButton"
import { useUserInfo } from "@/hooks/useUserInfo"

export function AppSidebar() {
    const { isAdmin } = useUserInfo();

  return (
    <Sidebar className="w-64 flex-shrink-0 relative z-10 !border-none" collapsible="icon">
        <SidebarLogoHeader />
        <SidebarContent className="bg-[#0A2245] text-white">
            <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                    <SidebarGroupLabel asChild>
                        <CollapsibleTrigger>
                            <span className="text-white">General</span>
                            <ChevronDown className="text-white ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navigation[0].items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLinkButton href={item.href}>
                                            <item.icon />
                                            <span className="ml-2">{item.title}</span>
                                        </NavLinkButton>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </CollapsibleContent>
                </SidebarGroup>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                    <SidebarGroupLabel asChild>
                        <CollapsibleTrigger>
                            <span className="text-white">Guides</span>
                            <ChevronDown className="text-white ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navigation[1].items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLinkButton href={item.href}>
                                            <item.icon />
                                            <span className="ml-2">{item.title}</span>
                                        </NavLinkButton>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </CollapsibleContent>
                </SidebarGroup>
            </Collapsible>
            { isAdmin && (
            <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                    <SidebarGroupLabel asChild>
                        <CollapsibleTrigger>
                            <span className="text-white">Admin</span>
                            <ChevronDown className="text-white ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                            {navigation[2].items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <NavLinkButton href={item.href}>
                                    <item.icon />
                                    <span className="ml-2">{item.title}</span>
                                    </NavLinkButton>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </CollapsibleContent>
                </SidebarGroup>
            </Collapsible>
            )}
        </SidebarContent>
        <SidebarFooter >
            <SidebarMenu>
                <SidebarMenuItem>
                    <NavUser/>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}