import { Home, FolderOpen } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function NavSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      id: 'dashboard',
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      id: 'workspaces',
      icon: FolderOpen,
      label: 'Workspaces',
      path: '/workspaces'
    }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col bg-black border-r border-sidebar-border">
      <div className="flex flex-1 flex-col items-center gap-4 py-4">
        {/* Logo/Brand */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
          <span className="text-sm font-bold text-white">B</span>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10 text-white hover:bg-black hover:text-white"
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
