"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs"
import { Brain, Rocket, Sparkles, Globe, Menu, X, Heart, LogIn, UserPlus, GraduationCap, Book, Home } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}

const NavLink = ({ href, icon, children, onClick }: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
          isActive 
            ? "bg-gradient-to-r from-indigo-600/20 to-rose-600/20 text-white border border-white/20" 
            : "hover:bg-white/5 text-gray-300 hover:text-white backdrop-blur-sm",
        )}
      >
        {icon}
        <span>{children}</span>
      </Link>
    </motion.div>
  )
}

export const Navbar = () => {
  const { isSignedIn, user, isLoaded } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!isLoaded || !user) return
    const syncUser = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
        })
        if (!res.ok) {
          console.error("Failed to sync user with Supabase")
        }
      } catch (err) {
        console.error("API error:", err)
      }
    }
    syncUser()
  }, [isLoaded, user])

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has admin role in public metadata
      const userRole = user.publicMetadata.role as string
      setIsAdmin(userRole === "admin")
    }
  }, [isLoaded, user])

  const closeSheet = () => setIsOpen(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-7xl transition-all duration-300 rounded-2xl",
        isScrolled
          ? "bg-slate-900/80 backdrop-blur-lg border border-white/10 shadow-lg shadow-indigo-500/5"
          : "bg-transparent"
      )}
    >
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <motion.span 
              className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 hidden sm:inline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              EduAI
            </motion.span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink href="/" icon={<Home className="h-4 w-4" />}>
            Home
          </NavLink>
          <NavLink href="/courses" icon={<Rocket className="h-4 w-4" />}>
            Courses
          </NavLink>
          <NavLink href="/enrolled-courses" icon={<Book className="h-4 w-4" />}>
            My Learning
          </NavLink>
          {isAdmin && (
            <NavLink href="/tutor-dashboard" icon={<GraduationCap className="h-4 w-4" />}>
              Tutor Dashboard
            </NavLink>
          )}
        </nav>

        {/* Auth Buttons */}
        <motion.div 
          className="flex items-center gap-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SignedOut>
            <div className="hidden sm:flex items-center gap-4">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" 
                  className="text-white hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-xl font-medium text-base px-6"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 rounded-xl shadow-lg shadow-purple-500/20 font-medium text-base px-6"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
            <div className="sm:hidden">
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon" 
                  className="text-white hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            {isAdmin && (
              <Link href="/tutor-dashboard" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-4 text-white hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-xl font-medium text-base px-6"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Tutor Dashboard
                </Button>
              </Link>
            )}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20",
                  userButtonPopoverCard: "bg-slate-900/95 border border-white/10 text-white shadow-xl backdrop-blur-lg rounded-2xl",
                  userButtonPopoverActionButton: "text-white hover:text-white hover:bg-white/10 rounded-xl",
                  userButtonPopoverActionButtonText: "text-current font-medium",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </SignedIn>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">EduAI</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10 rounded-xl">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>

                <nav className="flex flex-col gap-2 p-6">
                  <NavLink href="/" icon={<Home className="h-4 w-4" />} onClick={closeSheet}>
                    Home
                  </NavLink>
                  <NavLink href="/courses" icon={<Rocket className="h-4 w-4" />} onClick={closeSheet}>
                    Courses
                  </NavLink>
                  <NavLink href="/enrolled-courses" icon={<Book className="h-4 w-4" />} onClick={closeSheet}>
                    My Learning
                  </NavLink>
                  {isAdmin && (
                    <NavLink href="/tutor-dashboard" icon={<GraduationCap className="h-4 w-4" />} onClick={closeSheet}>
                      Tutor Dashboard
                    </NavLink>
                  )}
                </nav>

                <div className="mt-auto p-6 border-t border-white/10">
                  <SignedOut>
                    <div className="flex flex-col gap-3">
                      <SignInButton mode="modal">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:text-white hover:bg-white/10 rounded-xl font-medium"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Sign Up
                        </Button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-rose-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.header>
  )
}
