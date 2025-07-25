import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet, useLocation } from "react-router"
import { Toaster } from "sonner"

export const Dashboard = () => {
  const { pathname } = useLocation()
  const urls = pathname.split("/").splice(2)

  const identifyUrl = (index: number) => {
    const length = urls.length
    const stringUrl = pathname.split("/").splice(0, length - (index - 1)).join("/")
    return stringUrl
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
              {
                urls.map((url, index) => 
                  index != (urls.length - 1) ? (
                    <div key={url} className="flex items-center gap-2">
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={identifyUrl(index)}>{url}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </div>
                  ) : (
                    <BreadcrumbItem key={url}>
                      <BreadcrumbPage>{url}</BreadcrumbPage>
                    </BreadcrumbItem>
                  )
                )
              }
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-4 pt-0">
          <Outlet />
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 