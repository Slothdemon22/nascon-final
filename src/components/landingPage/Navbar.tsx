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
    <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary shadow-sm border-b-2 border-border"
            : "text-foreground hover:text-primary hover:bg-primary/5"
        )}
        style={{
          boxShadow: isActive ? '0 2px 8px 0 var(--border)' : undefined,
        }}
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
      initial={false}
      animate={false}
      className={cn(
        "sticky top-0 left-0 z-50 w-full bg-[var(--background)] border-b border-border shadow-sm transition-all duration-300",
        isScrolled ? "" : ""
      )}
    >
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-foreground tracking-tight hidden sm:inline" style={{fontFamily: 'var(--font-sans)'}}>EduAI</span>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink href="/" icon={<Home className="h-4 w-4" />}>
            Home
          </NavLink>
          <NavLink href="/courses" icon={<Rocket className="h-4 w-4 text-accent" />}>
            Courses
          </NavLink>
          <NavLink href="/enrolled-courses" icon={<Book className="h-4 w-4 text-accent2" />}>
            My Learning
          </NavLink>
          {isAdmin && (
            <NavLink href="/tutor-dashboard" icon={<GraduationCap className="h-4 w-4 text-primary" />}>
              Tutor Dashboard
            </NavLink>
          )}
        </nav>
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="hidden sm:flex items-center gap-4">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="text-primary border-primary font-semibold">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-accent text-white hover:bg-accent/90 font-semibold">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
            <div className="sm:hidden">
              <SignInButton mode="modal">
                <Button variant="outline" size="icon" className="text-primary border-primary font-semibold">
                  <LogIn className="h-5 w-5" />
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            {isAdmin && (
              <Link href="/tutor-dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm" className="mr-4 text-primary border-primary font-semibold">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Tutor Dashboard
                </Button>
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden text-primary border-primary font-semibold">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[var(--background)] border-l border-border p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-extrabold text-foreground" style={{fontFamily: 'var(--font-sans)'}}>EduAI</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="outline" size="icon" className="text-primary border-primary font-semibold">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-2 p-6">
                  <NavLink href="/" icon={<Home className="h-4 w-4" />} onClick={closeSheet}>
                    Home
                  </NavLink>
                  <NavLink href="/courses" icon={<Rocket className="h-4 w-4 text-accent" />} onClick={closeSheet}>
                    Courses
                  </NavLink>
                  <NavLink href="/enrolled-courses" icon={<Book className="h-4 w-4 text-accent2" />} onClick={closeSheet}>
                    My Learning
                  </NavLink>
                  {isAdmin && (
                    <NavLink href="/tutor-dashboard" icon={<GraduationCap className="h-4 w-4 text-primary" />} onClick={closeSheet}>
                      Tutor Dashboard
                    </NavLink>
                  )}
                </nav>
                <div className="mt-auto p-6 border-t border-border">
                  <SignedOut>
                    <div className="flex flex-col gap-3">
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full justify-start text-primary border-primary font-semibold">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="w-full justify-start bg-accent text-white font-semibold">
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
        </div>
      </div>
    </motion.header>
  )
}
