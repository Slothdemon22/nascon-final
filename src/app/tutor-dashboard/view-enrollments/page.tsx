"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  ChevronDown,
  Users,
} from "lucide-react"
import {
  Input,
} from "@/components/ui/input"

interface Enrollment {
  id: number
  clerkID: string
  courseID: number
  created_at: string
  courseTable: {
    id: number
    title: string
    description: string
    thumbnail: string
  }
  userDetails: {
    email: string
    fullName: string
  }
}

const ViewEnrollmentsPage = () => {
  const { isLoaded, user } = useUser()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isLoaded && user) {
      fetchEnrollments()
    }
  }, [isLoaded, user])

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('enrollmentTable')
        .select(`
          *,
          courseTable:courseID (*),
          userDetails:clerkID (email, fullName)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched enrollments:', data)
      setEnrollments(data || [])
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast.error('Failed to load enrollments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnenroll = (enrollment: Enrollment) => {
    console.log('Handling unenroll for:', enrollment)
    setEnrollmentToDelete(enrollment)
    setShowConfirmDialog(true)
  }

  const confirmUnenroll = async () => {
    if (!enrollmentToDelete) return

    try {
      console.log('Attempting to unenroll:', enrollmentToDelete)
      const { error } = await supabase
        .from('enrollmentTable')
        .delete()
        .eq('clerkID', enrollmentToDelete.clerkID)
        .eq('courseID', enrollmentToDelete.courseID)

      if (error) throw error

      setEnrollments(prev => prev.filter(e => 
        !(e.clerkID === enrollmentToDelete.clerkID && e.courseID === enrollmentToDelete.courseID)
      ))
      toast.success('Successfully unenrolled student')
    } catch (error) {
      console.error('Error unenrolling student:', error)
      toast.error('Failed to unenroll student')
    } finally {
      setShowConfirmDialog(false)
      setEnrollmentToDelete(null)
    }
  }

  const toggleCourseExpansion = (courseId: string) => {
    const newExpandedCourses = new Set(expandedCourses)
    if (newExpandedCourses.has(courseId)) {
      newExpandedCourses.delete(courseId)
    } else {
      newExpandedCourses.add(courseId)
    }
    setExpandedCourses(newExpandedCourses)
  }

  const filteredCourseGroups = Object.entries(enrollments.reduce((acc, enrollment) => {
    const courseId = enrollment.courseTable.id.toString()
    if (!acc[courseId]) {
      acc[courseId] = {
        course: enrollment.courseTable,
        students: []
      }
    }
    acc[courseId].students.push({
      user: enrollment.userDetails,
      enrolledAt: enrollment.created_at
    })
    return acc
  }, {} as Record<string, { course: any; students: { user: any; enrolledAt: string }[] }>))

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2 className="text-2xl font-bold text-white">Course Enrollments</h2>
        <p className="text-gray-400">View and manage student enrollments across all courses</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by course title, student name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-400"
        />
      </div>
      
      <div className="space-y-4 min-w-0">
        {isLoading ? (
          <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        ) : filteredCourseGroups.length > 0 ? (
          filteredCourseGroups.map(([courseId, group]: [string, any]) => (
            <div
              key={courseId}
              className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden min-w-0"
            >
              {/* Course Header */}
              <div
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleCourseExpansion(courseId)}
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={group.course.thumbnail}
                        alt={group.course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "https://via.placeholder.com/120?text=Course"
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {group.course.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {group.students.length} enrolled student{group.students.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {group.course.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                      expandedCourses.has(courseId) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Student List */}
              {expandedCourses.has(courseId) && (
                <div className="border-t border-white/10">
                  <div className="p-6 space-y-4 overflow-x-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 text-sm text-gray-400 font-medium px-4 min-w-[800px]">
                      <div className="col-span-4">Student</div>
                      <div className="col-span-4">Email</div>
                      <div className="col-span-2">Enrolled On</div>
                      <div className="col-span-2">Actions</div>
                    </div>

                    {/* Student Rows */}
                    <div className="space-y-2">
                      {group.students.map((student, index) => (
                        <div
                          key={`${student.user.clerkID}-${index}`}
                          className="grid grid-cols-12 gap-4 items-center bg-white/5 rounded-xl p-4 text-sm min-w-[800px]"
                        >
                          {/* Student Name & Avatar */}
                          <div className="col-span-4 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">
                              {student.user.fullName?.[0] || 'A'}
                            </div>
                            <span className="text-white font-medium truncate">
                              {student.user.fullName || 'Anonymous'}
                            </span>
                          </div>

                          {/* Email */}
                          <div className="col-span-4 text-gray-300 truncate">
                            {student.user.email || 'No email provided'}
                          </div>

                          {/* Enrollment Date */}
                          <div className="col-span-2 text-gray-300 whitespace-nowrap">
                            {new Date(student.enrolledAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 whitespace-nowrap"
                              onClick={() => {
                                setEnrollmentToDelete({
                                  courseId: courseId,
                                  clerkId: student.user.clerkID,
                                  studentName: student.user.fullName || 'Anonymous',
                                  courseName: group.course.title
                                })
                                setShowConfirmDialog(true)
                              }}
                            >
                              Unenroll
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No Enrollments Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? "No enrollments match your search criteria. Try a different search term."
                : "There are no student enrollments yet. Students can enroll in courses from the course catalog."}
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-slate-900 border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Unenrollment</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to unenroll this student from the course? This action cannot be undone.
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg space-y-2">
                <p><strong className="text-white">Student:</strong> <span className="text-gray-300">{enrollmentToDelete?.userDetails?.fullName}</span></p>
                <p><strong className="text-white">Course:</strong> <span className="text-gray-300">{enrollmentToDelete?.courseTable?.title}</span></p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-800 text-white hover:bg-slate-700 border-none"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnenroll}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Yes, Unenroll Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ViewEnrollmentsPage 