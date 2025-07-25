"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  FaRocket,
  FaThLarge,
  FaPlusCircle,
  FaFolder,
  FaBrain,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaUser,
  FaBell,
  FaMoon,
  FaSun,
  FaExpand,
  FaCompress,
  FaChartLine, 
} from "react-icons/fa"

const NAV_ITEMS = [
  {
    href: "/dashboard", 
    icon: <FaThLarge />,
    label: "Tracker", 
    description: "Track job applications",
    badge: null,
  },
  {
    href: "/jobs/add",
    icon: <FaPlusCircle />,
    label: "Add Job",
    description: "Track new opportunity",
    badge: null,
  },
  {
    href: "/documents",
    icon: <FaFolder />,
    label: "Documents",
    description: "Manage files",
    badge: null,
  },
  {
    href: "/resume-reviewer",
    icon: <FaFileAlt />,
    label: "Resume Reviewer",
    description: "AI-powered analysis",
    badge: "AI",
  },
  {
    href: "/interview",
    icon: <FaBrain />,
    label: "Mock Interview",
    description: "Practice with AI",
    badge: "AI",
  },
  {
    href: "/personal-dashboard", 
    icon: <FaChartLine />, 
    label: "Personal Dashboard",
    description: "Overview & analytics",
    badge: null,
  },
]


const QUICK_STATS = [
  { label: "Active Applications", value: "1", color: "text-blue-600" },
  { label: "This Week", value: "1", color: "text-green-600" },
  { label: "Interviews", value: "1", color: "text-purple-600" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // Get user initials
  const getUserInitials = (email?: string | null) => {
    if (!email) return "U"
    return email.split("@")[0].slice(0, 2).toUpperCase()
  }

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Handle user menu toggle
  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu)
  }

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Here you would implement actual dark mode logic
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".user-menu-container")) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} transition-all duration-300 ease-in-out`}>
      {/* Enhanced Header */}
      <div className="sidebar-header relative">
        <div className="flex items-center justify-between">
          <div className={`logo transition-all duration-300 ${isCollapsed ? "scale-75" : ""}`}>
            <Image 
              src="/media/logo.png" 
              alt="CareerPilot Logo" 
              width={isCollapsed ? 40 : 160} 
              height={40}
              className="object-contain"
            />
          </div>

          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
          >
            {isCollapsed ? (
              <FaExpand className="text-slate-600 text-sm group-hover:scale-110 transition-transform" />
            ) : (
              <FaCompress className="text-slate-600 text-sm group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Quick Stats - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Stats</h4>
            <div className="space-y-2">
              {QUICK_STATS.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{stat.label}</span>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto">
        <div className="px-3">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4 px-3">Navigation</div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item group relative ${isActive ? "active" : ""} ${isCollapsed ? "collapsed" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <div className="flex items-center">
                  <div className="nav-icon-container">
                    <span className="nav-icon text-lg ">{item.icon}</span>
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="nav-label font-semibold ml-2">{item.label}</div>
                          <div className="nav-description text-xs ml-2 text-slate-500 group-hover:text-slate-600 transition-colors">
                            {item.description}
                          </div>
                        </div>
                        {item.badge && <span className="nav-badge ml-2 text-blue-700">{item.badge}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#7DD5DB] to-[#3B6597] rounded-l-full"></div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Notifications Section - Only show when not collapsed */}
        {!isCollapsed && notifications > 0 && (
          <div className="px-6 mt-8">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                  <FaBell className="text-white text-sm" />
                </div>
                <div>
                  <div className="font-semibold text-orange-800 text-sm">Notifications</div>
                  <div className="text-xs text-orange-600">{notifications} new updates</div>
                </div>
              </div>
              <button className="text-xs text-orange-700 hover:text-orange-800 font-medium transition-colors">
                View all →
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced User Profile */}
      <div className="user-profile-container relative">
        <div className={`user-profile ${isCollapsed ? "collapsed" : ""}`}>
          <div className="user-menu-container relative">
            <button
              onClick={handleUserMenuToggle}
              className="user-profile-button w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="user-avatar relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">{getUserInitials(session?.user?.email)}</span>
                </div>
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{notifications}</span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-800 text-sm truncate">
                    {session?.user?.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{session?.user?.email || "user@example.com"}</div>
                </div>
              )}

              {!isCollapsed && (
                <FaChevronDown
                  className={`text-slate-400 text-sm transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && !isCollapsed && (
              <div className="user-dropdown absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="font-semibold text-slate-800 text-sm">
                    {session?.user?.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-slate-500">{session?.user?.email || "user@example.com"}</div>
                </div>

                <div className="py-1">
                  <button className="user-menu-item">
                    <FaUser className="text-slate-500" />
                    <span>Profile Settings</span>
                  </button>

                  <button onClick={toggleDarkMode} className="user-menu-item">
                    {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-slate-500" />}
                    <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  <button className="user-menu-item">
                    <FaBell className="text-slate-500" />
                    <span>Notifications</span>
                    {notifications > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {notifications}
                      </span>
                    )}
                  </button>

                  <button className="user-menu-item">
                    <FaCog className="text-slate-500" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-slate-200 my-1"></div>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="user-menu-item text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsed tooltip */}
      {isCollapsed && (
        <style jsx>{`
          .nav-item:hover::after {
            content: attr(title);
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            margin-left: 8px;
          }
        `}</style>
      )}
    </aside>
  )
}
