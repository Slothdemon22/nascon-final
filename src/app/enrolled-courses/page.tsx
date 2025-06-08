"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Book, PlayCircle, FileVideo, ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { PageContainer } from "@/components/layout/page-container"

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  clerkID: string
  created_at: string
}

interface Video {
  id: string
  courseID: string
  videoUrl: string
  videoThumbnail: string
  created_at: string
  Name: string
}

interface Enrollment {
  id: string
  courseId: string
  userId: string
  created_at: string
}

interface CourseWithVideos extends Course {
  videos: Video[]
}

interface Progress {
  id: string
  videoID: string
  courseID: string
  clerkID: string
  created_at: string
}

const EnrolledCoursesPage = () => {
  const { user, isLoaded } = useUser()
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithVideos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseWithVideos | null>(null)
  const [watchedVideos, setWatchedVideos] = useState<Record<string, Progress>>({})

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isLoaded || !user) return

      try {
        setIsLoading(true)
        console.log("Fetching enrolled courses...")

        // Fetch user's enrollments with course data in a single query
        const { data, error } = await supabase
          .from("enrollmentTable")
          .select(`
            *,
            courseTable:courseID (*)
          `)
          .eq("clerkID", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (!data || data.length === 0) {
          setEnrolledCourses([])
          return
        }

        // Get course IDs for video query
        const courseIds = data.map((enrollment) => enrollment.courseID)

        // Fetch videos for all enrolled courses
        const { data: videosData, error: videosError } = await supabase
          .from("videoTable")
          .select("*")
          .in("courseID", courseIds)
          .order("created_at", { ascending: true })

        if (videosError) throw videosError

        // Transform the data to include videos
        const coursesWithVideos = data.map((enrollment) => ({
          ...enrollment.courseTable,
          videos: videosData?.filter((video) => video.courseID === enrollment.courseID) || [],
        }))

        console.log("Enrolled courses fetched successfully:", coursesWithVideos)
        setEnrolledCourses(coursesWithVideos)
      } catch (error) {
        console.error("Error fetching enrolled courses:", error)
        toast.error("Failed to load enrolled courses")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [isLoaded, user])

  // Fetch watched videos for the selected course
  useEffect(() => {
    const fetchWatchedVideos = async () => {
      if (!user || !selectedCourse) return

      try {
        console.log("Fetching watched videos for course:", selectedCourse.id)
        const { data, error } = await supabase
          .from('progressTracker')
          .select('*')
          .eq('courseID', selectedCourse.id)
          .eq('clerkID', user.id)

        if (error) {
          console.error("Error fetching watched videos:", error)
          throw error
        }

        // Create a map of videoID to progress data
        const watchedMap = (data || []).reduce((acc, progress) => {
          acc[progress.videoID] = progress
          return acc
        }, {} as Record<string, Progress>)

        console.log("Watched videos fetched:", watchedMap)
        setWatchedVideos(watchedMap)
      } catch (error) {
        console.error("Failed to fetch watched videos:", error)
        toast.error("Failed to load progress")
      }
    }

    fetchWatchedVideos()
  }, [user, selectedCourse])

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!selectedCourse?.videos.length) return 0
    const watchedCount = Object.keys(watchedVideos).length
    return Math.round((watchedCount / selectedCourse.videos.length) * 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleWatchVideo = async (video: Video, courseId: string) => {
    if (!user) {
      toast.error("Please sign in to watch videos")
      return
    }

    try {
      console.log("Checking existing video progress:", {
        videoId: video.id,
        courseId: courseId,
        userId: user.id
      })

      // First check if this video has already been watched by the user
      const { data: existingProgress, error: checkError } = await supabase
        .from('progressTracker')
        .select('*')
        .eq('videoID', video.id)
        .eq('courseID', courseId)
        .eq('clerkID', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error("Error checking video progress:", checkError)
        throw checkError
      }

      if (existingProgress) {
        console.log("Video already watched:", existingProgress)
        // Just open the video without creating a new entry
        window.open(video.videoUrl, "_blank")
        return
      }

      console.log("Tracking new video progress")
      const { data, error } = await supabase
        .from('progressTracker')
        .insert([
          {
            videoID: video.id,
            courseID: courseId,
            clerkID: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error("Error tracking video progress:", error)
        throw error
      }

      console.log("Successfully tracked video progress:", data)
      toast.success("Progress tracked successfully")

      // Open video in new tab
      window.open(video.videoUrl, "_blank")
    } catch (error) {
      console.error("Failed to track video progress:", error)
      toast.error("Failed to track progress")
      
      // Still allow video to open even if tracking fails
      window.open(video.videoUrl, "_blank")
    }
  }

  if (selectedCourse) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSelectedCourse(null)}
              variant="ghost"
              className="text-white hover:bg-white/10 group transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Enrolled Courses
            </Button>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                <img
                  src={selectedCourse.thumbnail || "/placeholder.svg"}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "https://via.placeholder.com/120?text=Course"
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">Course</Badge>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(selectedCourse.created_at)}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{selectedCourse.title}</h1>
                <p className="text-gray-300 text-sm md:text-base">{selectedCourse.description}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-300">
                    <FileVideo className="w-4 h-4 text-purple-400" />
                    <span>
                      {selectedCourse.videos.length} {selectedCourse.videos.length === 1 ? "Lesson" : "Lessons"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Course Progress - Moved to top */}
              <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Course Progress</h3>
                  <Badge variant="outline" className={`${
                    calculateProgress() === 100
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {calculateProgress() === 100 ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Completion Status</span>
                    <span className="text-white font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress 
                    value={calculateProgress()} 
                    className="h-2 bg-white/5" 
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {calculateProgress() === 100 
                      ? 'Congratulations! You have completed all lessons in this course.' 
                      : `${Object.keys(watchedVideos).length} of ${selectedCourse.videos.length} lessons completed. Keep going!`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-purple-400" />
                  Course Content
                </h2>
                <div className="text-sm text-gray-400">
                  {selectedCourse.videos.length} {selectedCourse.videos.length === 1 ? "video" : "videos"}
                </div>
              </div>

              {selectedCourse.videos.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                          <PlayCircle className="w-5 h-5 text-purple-400" />
                          Course Content
                        </h2>
                        <p className="text-sm text-gray-400">
                          {selectedCourse.videos.length} {selectedCourse.videos.length === 1 ? "lesson" : "lessons"} available • {Object.keys(watchedVideos).length} completed
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Last updated {formatDate(selectedCourse.videos[selectedCourse.videos.length - 1].created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedCourse.videos.map((video, index) => {
                        const isWatched = !!watchedVideos[video.id]
                        return (
                          <div
                            key={video.id}
                            className={`group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 ${
                              isWatched ? 'bg-purple-500/5' : ''
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                            
                            <div className="relative flex items-center gap-4 p-4">
                              {/* Thumbnail */}
                              <div className="w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                <div className="relative h-full group/thumbnail">
                                  <img
                                    src={video.videoThumbnail || "/placeholder.svg"}
                                    alt={`Lesson ${index + 1} Thumbnail`}
                                    className={`h-full w-full object-cover transition-transform duration-300 group-hover/thumbnail:scale-105 ${
                                      isWatched ? 'opacity-75' : ''
                                    }`}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "https://via.placeholder.com/1920x1080?text=Video+Thumbnail"
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity">
                                    <PlayCircle className="w-10 h-10 text-white" />
                                  </div>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    className={`${
                                      isWatched 
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                                    }`}
                                  >
                                    Lesson {index + 1}
                                  </Badge>
                                  {isWatched && (
                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                                      Completed
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDate(video.created_at)}
                                  </span>
                                </div>
                                <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors mb-1 truncate">
                                  {video.Name}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  Learn essential concepts and practical applications in this comprehensive lesson.
                                </p>
                              </div>

                              {/* Action Button */}
                              <div className="flex-shrink-0">
                                <Button
                                  onClick={() => handleWatchVideo(video, selectedCourse.id)}
                                  className={`${
                                    isWatched
                                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                                      : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20'
                                  }`}
                                >
                                  <PlayCircle className="w-5 h-5 mr-2" />
                                  {isWatched ? 'Watch Again' : 'Watch Now'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                    <FileVideo className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Videos Available</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    No videos have been added to this course yet. Check back soon for updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-gray-400">Access your enrolled courses and track your progress</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-video bg-slate-800 rounded-xl" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="h-20 bg-slate-800 rounded" />
              </div>
            ))
        ) : enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-purple-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 rounded-2xl p-5 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 relative overflow-hidden">
                  {/* Background Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Thumbnail */}
                  <div className="aspect-video rounded-xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/1920x1080?text=Course+Thumbnail";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3 relative">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg shadow-purple-500/20">
                        Course
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(course.created_at)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                      {course.description}
                    </p>

                    {/* Progress Section */}
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          <FileVideo className="w-4 h-4 text-purple-400" />
                          <span>{course.videos.length} {course.videos.length === 1 ? "Lesson" : "Lessons"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span>Continue Learning</span>
                          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                  </div>
                      <Progress value={33} className="h-1.5 bg-white/5" />
                    </div>
                  </div>
                </div>
          </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                  <Book className="w-8 h-8 text-purple-300" />
            </div>
                <h3 className="text-lg font-medium text-white mb-2">No Enrolled Courses</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  You haven't enrolled in any courses yet. Browse our courses to start your learning journey.
            </p>
            <Button
                  onClick={() => window.location.href = "/courses"}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              Browse Courses
            </Button>
              </div>
          </div>
        )}
        </div>
      </div>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="w-full h-full relative flex flex-col">
            <div className="flex justify-end p-4">
              <Button
                onClick={() => {
                  console.log("Closing video player")
                  setSelectedVideo(null)
                }}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full h-full max-h-[80vh] max-w-7xl mx-auto px-4">
                <video
                  key={selectedVideo.id}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  style={{ maxHeight: "calc(100vh - 120px)" }}
                  onError={(e) => {
                    console.error("Video playback error:", e)
                    toast.error("Error playing video")
                  }}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default EnrolledCoursesPage
