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
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Browse Courses</h1>
            <p className="text-gray-400">Discover and enroll in courses that match your interests</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-400 w-full md:max-w-md"
            />
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-4 space-y-4 animate-pulse"
                >
                  <div className="aspect-video bg-slate-800 rounded-xl" />
                  <div className="h-6 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-20 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-gradient-to-b from-slate-900/90 to-purple-900/20 backdrop-blur-lg border-2 border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10"
                >
                  {/* Thumbnail with Overlay */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "https://via.placeholder.com/1920x1080?text=Course+Thumbnail"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Title and Description */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
                    </div>

                    {/* Tutor Info */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/20">
                        <img
                          src={course.tutor?.imageUrl || "https://via.placeholder.com/32?text=T"}
                          alt={course.tutor?.fullName || "Tutor"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {course.tutor?.fullName || "Anonymous Tutor"}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(course.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setSelectedChatCourse(course)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
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
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-5 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No Courses Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchQuery
                  ? "No courses match your search criteria. Try a different search term."
                  : "No courses have been created yet. Check back later!"}
              </p>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Enrollment Dialog - Wide Horizontal Layout */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="bg-slate-900/95 border-white/10 text-white w-[85vw] h-[80vh] max-h-[800px] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
              {selectedCourse?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Course Description */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                <Book className="w-5 h-5 text-purple-400" />
                Description
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">{selectedCourse?.description}</p>
            </div>

            {/* Info Cards - Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Tutor Info */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col justify-between">
                <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  Tutor Information
                </h4>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-purple-500/20">
                    <img
                      src={selectedCourse?.tutor?.imageUrl || "https://via.placeholder.com/40?text=T"}
                      alt="Tutor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-white truncate">
                      {selectedCourse?.tutor?.fullName || "Anonymous"}
                    </h5>
                    <p className="text-xs text-gray-400 break-all">
                      {selectedCourse?.tutor?.emailAddress || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col justify-between">
                <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Course Details
                </h4>
                <p className="text-sm text-gray-300">Enroll to access all course materials and resources.</p>
              </div>
            </div>

            {/* CLOs */}
            <div className="bg-gradient-to-r from-purple-500/5 to-rose-500/5 rounded-lg p-4">
              <h4 className="font-medium text-white flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                Course Learning Outcomes (CLOs)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* CLO-1 */}
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs mb-2">
                    CLO-1
                  </Badge>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedCourse?.["CLO-1"]}</p>
                </div>

                {/* CLO-2 */}
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs mb-2">
                    CLO-2
                  </Badge>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedCourse?.["CLO-2"]}</p>
                </div>

                {/* CLO-3 */}
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs mb-2">
                    CLO-3
                  </Badge>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedCourse?.["CLO-3"]}</p>
                </div>

                {/* CLO-4 - Optional */}
                {selectedCourse?.["CLO-4"] && (
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                    <Badge
                      variant="outline"
                      className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs mb-2"
                    >
                      CLO-4
                    </Badge>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedCourse["CLO-4"]}</p>
                  </div>
                )}

                {/* CLO-5 - Optional */}
                {selectedCourse?.["CLO-5"] && (
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                    <Badge
                      variant="outline"
                      className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs mb-2"
                    >
                      CLO-5
                    </Badge>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedCourse["CLO-5"]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => setSelectedCourse(null)}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isEnrolling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
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
    </>
  )
}

export default CoursesPage
