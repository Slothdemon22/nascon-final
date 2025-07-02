"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, GraduationCap, Mail, Book, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { PageContainer } from "@/components/layout/page-container"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChatDialog } from "@/components/chat/chat-dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  clerkID: string
  created_at: string
  "CLO-1": string
  "CLO-2": string
  "CLO-3": string
  "CLO-4": string | null
  "CLO-5": string | null
  tutor?: {
    fullName: string | null
    emailAddress: string | null
    imageUrl: string | null
  }
}

const CoursesPage = () => {
  const { user, isLoaded } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [selectedChatCourse, setSelectedChatCourse] = useState<Course | null>(null)

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching courses...")

      const { data, error } = await supabase
        .from("courseTable")
        .select(`
          *,
          tutor:clerkID (
            fullName,
            emailAddress,
            imageUrl
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      console.log("Courses fetched successfully:", data)
      setCourses(data as Course[])
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle enrollment
  const handleEnroll = async () => {
    if (!user || !selectedCourse) return

    try {
      setIsEnrolling(true)
      console.log("Starting enrollment process...", {
        courseId: selectedCourse.id,
        userId: user.id,
      })

      // Check if already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from("enrollmentTable")
        .select("*")
        .eq("courseID", selectedCourse.id)
        .eq("clerkID", user.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows returned
        throw checkError
      }

      if (existingEnrollment) {
        toast.error("You are already enrolled in this course!")
        return
      }

      // Create new enrollment
      const { data, error } = await supabase
        .from("enrollmentTable")
        .insert([
          {
            courseID: selectedCourse.id,
            clerkID: user.id,
          },
        ])
        .select()

      if (error) throw error

      console.log("Enrollment successful:", data)
      toast.success("Successfully enrolled in the course!")
      setSelectedCourse(null) // Close dialog
    } catch (error) {
      console.error("Enrollment failed:", error)
      toast.error("Failed to enroll in the course. Please try again.")
    } finally {
      setIsEnrolling(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCourses()
  }, [])

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <PageContainer>
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8 md:py-12 bg-white/95 rounded-xl shadow-md border border-border">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-1">Browse Courses</h1>
            <p className="text-muted-foreground">Discover and enroll in courses that match your interests</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-border text-foreground placeholder:text-muted-foreground w-full max-w-lg rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          />
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-secondary border border-border rounded-xl p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-video bg-muted rounded-lg" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Card className="bg-white border border-border rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group h-full">
                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "https://via.placeholder.com/1920x1080?text=Course+Thumbnail"
                      }}
                    />
                  </div>
                  {/* Content */}
                  <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
                    <h2 className="text-lg md:text-xl font-bold text-primary mb-1 group-hover:text-accent transition-colors duration-300">{course.title}</h2>
                    <p className="text-muted-foreground line-clamp-3">{course.description}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <Badge className="bg-accent text-white">{course.tutor?.fullName || "Unknown Tutor"}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        onClick={() => setSelectedChatCourse(course)}
                        className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent font-medium py-3 rounded-lg border border-accent/20 transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with Tutor
                      </Button>
                      <Button
                        onClick={() => {
                          if (!isLoaded) return
                          if (!user) {
                            toast.error("Please sign in to enroll in courses")
                            return
                          }
                          setSelectedCourse(course)
                        }}
                        className="flex-1 bg-primary hover:bg-accent text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-300"
                      >
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">No courses found.</div>
        )}
      </div>

      {/* Enrollment Dialog - Themed and Modern */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent
          className="bg-card border border-accent text-foreground w-[85vw] h-[80vh] max-h-[800px] overflow-y-auto p-6 rounded-2xl shadow-xl"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
            borderColor: 'var(--accent)',
            background: 'var(--card)',
            maxWidth: '900px',
            minHeight: 'unset',
            width: '85vw',
            height: '80vh',
          }}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-primary text-center">
              {selectedCourse?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Course Description - simple colors */}
            <div
              className="relative rounded-xl border border-accent bg-muted shadow p-6 mb-6"
              style={{
                borderColor: 'var(--accent)',
                background: 'var(--muted)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                  <Book className="w-6 h-6 text-accent" />
                </span>
                <span
                  className="text-xl font-bold text-primary"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Description
                </span>
              </div>
              <div className="h-1 w-12 bg-accent rounded-full mb-4" />
              <p className="text-base text-foreground leading-relaxed font-sans">
                {selectedCourse?.description}
              </p>
            </div>

            {/* Info Cards - Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tutor Info */}
              <div className="bg-muted rounded-lg p-4 flex flex-col justify-between border border-border shadow-sm">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-primary" />
                  Tutor Information
                </h4>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-accent/30">
                    <img
                      src={selectedCourse?.tutor?.imageUrl || 'https://via.placeholder.com/40?text=T'}
                      alt="Tutor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-base font-semibold text-foreground truncate">
                      {selectedCourse?.tutor?.fullName || 'Anonymous'}
                    </h5>
                    <p className="text-xs text-muted-foreground break-all">
                      {selectedCourse?.tutor?.emailAddress || 'No email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-muted rounded-lg p-4 flex flex-col justify-between border border-border shadow-sm">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  Course Details
                </h4>
                <p className="text-sm text-muted-foreground">Enroll to access all course materials and resources.</p>
              </div>
            </div>

            {/* CLOs */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-primary" />
                Course Learning Outcomes (CLOs)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* CLO-1 */}
                <div className="bg-card border border-accent/20 rounded-lg p-3">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs mb-2">
                    CLO-1
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse?.['CLO-1']}</p>
                </div>
                {/* CLO-2 */}
                <div className="bg-card border border-accent/20 rounded-lg p-3">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs mb-2">
                    CLO-2
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse?.['CLO-2']}</p>
                </div>
                {/* CLO-3 */}
                <div className="bg-card border border-accent/20 rounded-lg p-3">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs mb-2">
                    CLO-3
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse?.['CLO-3']}</p>
                </div>
                {/* CLO-4 - Optional */}
                {selectedCourse?.['CLO-4'] && (
                  <div className="bg-card border border-primary/20 rounded-lg p-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs mb-2">
                      CLO-4
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse['CLO-4']}</p>
                  </div>
                )}
                {/* CLO-5 - Optional */}
                {selectedCourse?.['CLO-5'] && (
                  <div className="bg-card border border-primary/20 rounded-lg p-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs mb-2">
                      CLO-5
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse['CLO-5']}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setSelectedCourse(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="bg-primary hover:bg-accent text-white font-semibold shadow-md"
            >
              {isEnrolling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <ChatDialog
        isOpen={!!selectedChatCourse}
        onClose={() => setSelectedChatCourse(null)}
        courseId={selectedChatCourse?.id || ""}
        courseName={selectedChatCourse?.title || ""}
      />
    </PageContainer>
  )
}

export default CoursesPage
