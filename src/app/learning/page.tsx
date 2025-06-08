"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle, FileVideo, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { PageContainer } from "@/components/layout/page-container"

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
}

interface Video {
  id: string
  courseID: string
  videoUrl: string
  created_at: string
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

const LearningPage = () => {
  const { user } = useUser()
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithVideos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseWithVideos | null>(null)

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        
        // Fetch user's enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollmentTable')
          .select('*')
          .eq('userId', user.id)

        if (enrollmentsError) throw enrollmentsError

        if (!enrollments.length) {
          setEnrolledCourses([])
          return
        }

        // Get enrolled course IDs
        const courseIds = enrollments.map((enrollment: Enrollment) => enrollment.courseId)

        // Fetch enrolled courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courseTable')
          .select('*')
          .in('id', courseIds)
          .order('created_at', { ascending: false })

        if (coursesError) throw coursesError

        // Fetch videos for enrolled courses
        const { data: videosData, error: videosError } = await supabase
          .from('videoTable')
          .select('*')
          .in('courseID', courseIds)
          .order('created_at', { ascending: true })

        if (videosError) throw videosError

        // Organize videos by course
        const coursesWithVideos = coursesData.map((course: Course) => ({
          ...course,
          videos: videosData.filter((video: Video) => video.courseID === course.id)
        }))

        setEnrolledCourses(coursesWithVideos)
      } catch (error) {
        console.error('Error fetching enrolled courses:', error)
        toast.error('Failed to load your courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSelectedCourse(null)}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to My Learning
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "https://via.placeholder.com/120?text=Course"
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedCourse.title}</h1>
                <p className="text-gray-400 mt-2">{selectedCourse.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Course Content</h2>
              
              {selectedCourse.videos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {selectedCourse.videos.map((video, index) => (
                    <Card 
                      key={video.id}
                      className="bg-slate-900/50 border-white/10 overflow-hidden hover:bg-slate-900/70 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <PlayCircle className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium">
                              Lesson {index + 1}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {new Date(video.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => setSelectedVideo(video)}
                            className="bg-white/5 hover:bg-white/10"
                          >
                            Watch Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileVideo className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No videos available for this course yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Learning Dashboard</h1>
          <p className="text-gray-400">Track your progress and continue your learning journey</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">My Learning</h2>
              <p className="text-gray-400">Continue learning from your enrolled courses</p>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <Card 
                    key={course.id}
                    className="bg-slate-900/50 border-white/10 overflow-hidden"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "https://via.placeholder.com/120?text=Course"
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h2 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                        {course.title}
                      </h2>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {course.videos.length} {course.videos.length === 1 ? 'video' : 'videos'}
                        </div>
                        <Button
                          onClick={() => setSelectedCourse(course)}
                          className="bg-white/5 hover:bg-white/10"
                        >
                          Continue Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileVideo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2">No Enrolled Courses</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  You haven't enrolled in any courses yet. Browse available courses to get started.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Player Dialog */}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-5xl">
                  <Button
                    onClick={() => setSelectedVideo(null)}
                    variant="ghost"
                    className="absolute -top-12 right-0 text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                  <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <video
                      src={selectedVideo.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default LearningPage 