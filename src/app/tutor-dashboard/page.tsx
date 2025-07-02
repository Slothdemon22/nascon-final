"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Book, Users, Clock, Star, Plus, FileText, Settings, Sparkles, Upload, X, Search, ChevronDown, FileVideo, PlayCircle, Image, FileImage, Save, GraduationCap, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/db"
import { useUser } from "@clerk/nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { PageContainer } from "@/components/layout/page-container"

type TabType = "course-creation" | "view-enrollments" | "manage-contents" | "coming-soon"

interface User {
  clerkID: string
  emailAddress: string | null
  fullName: string | null
  imageUrl: string | null
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  clerkID: string
  created_at: string
}

interface Enrollment {
  id: string
  created_at: string
  clerkID: string
  courseID: string
  userTable: User
  courseTable: Course
}

interface CourseGroup {
  course: Course
  students: {
    user: User
    enrolledAt: string
  }[]
}

interface Video {
  id: string
  courseID: string
  videoUrl: string
  videoThumbnail: string
  Name: string
  created_at: string
}

interface EditCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  videos?: Video[]
}

interface VideoUpload {
  courseId: string
  videoFile: File | null
  thumbnailFile: File | null
  Name: string
}

const TabButton = ({ 
  active, 
  icon: Icon, 
  label, 
  onClick 
}: { 
  active: boolean
  icon: any
  label: string
  onClick: () => void 
}) => (
  <Button
    variant="ghost"
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 w-full justify-start",
      active 
        ? "bg-primary/10 border border-primary/30 text-primary" 
        : "hover:bg-muted text-muted-foreground hover:text-foreground"
    )}
    onClick={onClick}
  >
    <Icon className="w-5 h-5 text-primary" />
    {label}
  </Button>
)

const CourseCreation = () => {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    "CLO-1": "",
    "CLO-2": "",
    "CLO-3": "",
    "CLO-4": "",
    "CLO-5": "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log("Starting course creation process...", { formData })

    // Form validation
    if (!formData.title.trim()) {
      console.error("Validation failed: Title is required")
      toast.error("Title is required")
      setIsLoading(false)
      return
    }

    if (!formData.description.trim()) {
      console.error("Validation failed: Description is required")
      toast.error("Description is required")
      setIsLoading(false)
      return
    }

    // CLO validation (1-3 are required)
    if (!formData["CLO-1"].trim() || !formData["CLO-2"].trim() || !formData["CLO-3"].trim()) {
      console.error("Validation failed: First three Course Learning Outcomes (CLO) are required")
      toast.error("First three Course Learning Outcomes (CLO) are required")
      setIsLoading(false)
      return
    }

    if (!selectedFile) {
      console.error("Validation failed: Thumbnail is required")
      toast.error("Please select a thumbnail image")
      setIsLoading(false)
      return
    }

    try {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Create a unique file name
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      console.log("Uploading file to Supabase storage...", { filePath })

      // Upload to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('nascon-test')
        .upload(filePath, selectedFile)

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError)
        throw uploadError
      }

      console.log("File uploaded successfully", { uploadData })

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('nascon-test')
        .getPublicUrl(filePath)

      console.log("Generated public URL:", publicUrl)

      // Insert course data with user ID and CLOs
      const { data, error } = await supabase
        .from('courseTable')
        .insert([
          {
            title: formData.title,
            thumbnail: publicUrl,
            description: formData.description,
            clerkID: user?.id,
            "CLO-1": formData["CLO-1"],
            "CLO-2": formData["CLO-2"],
            "CLO-3": formData["CLO-3"],
            "CLO-4": formData["CLO-4"] || null,
            "CLO-5": formData["CLO-5"] || null,
          }
        ])
        .select()

      if (error) {
        throw error
      }

      console.log("Course created successfully:", data)
      toast.success("Course has been created! 🎉")
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        "CLO-1": "",
        "CLO-2": "",
        "CLO-3": "",
        "CLO-4": "",
        "CLO-5": "",
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

    } catch (error) {
      console.error("Course creation failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create course. Please try again.")
    } finally {
      setIsLoading(false)
      console.log("Course creation process finished")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-6 border border-border">
        <div>
          <h2 className="text-2xl font-bold">Create New Course</h2>
          <p className="text-muted-foreground mt-1">Set up a new course for your students</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-card flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      {/* Form Section */}
      <div className="bg-card border border-border rounded-2xl">
        <form onSubmit={handleSubmit} className="divide-y divide-border">
          {/* Basic Info Section */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-8">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Course Title
            </label>
            <Input
              placeholder="Enter course title"
              value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

              {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                  Course Description
            </label>
                <Textarea
                  placeholder="Enter course description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* CLOs Section */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" />
                Course Learning Outcomes (CLOs)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">First three CLOs are required, others are optional</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Required CLOs */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium text-accent">
                      CLO-1 (Required)
                    </label>
                    <Input
                      placeholder="Enter first learning outcome"
                      value={formData["CLO-1"]}
                      onChange={(e) => setFormData({ ...formData, "CLO-1": e.target.value })}
                      className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium text-accent">
                      CLO-2 (Required)
                    </label>
                    <Input
                      placeholder="Enter second learning outcome"
                      value={formData["CLO-2"]}
                      onChange={(e) => setFormData({ ...formData, "CLO-2": e.target.value })}
                      className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium text-accent">
                      CLO-3 (Required)
                    </label>
                    <Input
                      placeholder="Enter third learning outcome"
                      value={formData["CLO-3"]}
                      onChange={(e) => setFormData({ ...formData, "CLO-3": e.target.value })}
                      className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Optional CLOs */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium text-primary">
                      CLO-4 (Optional)
                    </label>
                    <Input
                      placeholder="Enter fourth learning outcome"
                      value={formData["CLO-4"]}
                      onChange={(e) => setFormData({ ...formData, "CLO-4": e.target.value })}
                      className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium text-primary">
                      CLO-5 (Optional)
                    </label>
                    <Input
                      placeholder="Enter fifth learning outcome"
                      value={formData["CLO-5"]}
                      onChange={(e) => setFormData({ ...formData, "CLO-5": e.target.value })}
                      className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Course Thumbnail
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div 
                  className={cn(
                    "relative aspect-video border-2 border-dashed rounded-xl overflow-hidden group transition-colors duration-200",
                    selectedFile 
                      ? "bg-primary/10 border-primary/30" 
                      : "border-border hover:border-border/20"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Current or Selected Thumbnail Preview */}
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Course thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-background/5 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm text-foreground font-medium">Click to upload thumbnail</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF (max. 5MB)</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-6 h-6 text-foreground" />
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        {selectedFile ? 'Change thumbnail' : 'Upload thumbnail'}
                      </p>
                    </div>
                  </div>
                </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    console.log("File selected:", file.name)
                  }
                }}
              />
              {selectedFile && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 bg-background/5 text-sm text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-primary" />
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="text-muted-foreground">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/20 hover:border-primary/30"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                      <X className="w-4 h-4" />
                </Button>
            </div>
            )}
          </div>
              <div className="space-y-4">
                <div className="bg-background/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Thumbnail Guidelines</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Use high-quality images (recommended: 1920x1080)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Keep file size under 5MB
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Use PNG, JPG, or GIF format
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Ensure good contrast for better visibility
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="p-8 bg-gradient-to-r from-purple-500/5 to-rose-500/5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                All required fields must be filled before creating the course
              </p>
            <Button
              type="submit"
              disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-accent rounded-lg font-semibold shadow px-6 py-2 transition-colors border-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin mr-2" />
                  Creating...
                </div>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Course
                </>
              )}
            </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewEnrollments = () => {
  const { user } = useUser()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<{
    courseId: string
    clerkId: string
    studentName: string
    courseName: string
  } | null>(null)

  // Fetch enrollments with user and course details
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        // First fetch the courses owned by this tutor
        const { data: tutorCourses, error: coursesError } = await supabase
          .from('courseTable')
          .select('id')
          .eq('clerkID', user.id)

        if (coursesError) throw coursesError

        if (!tutorCourses || tutorCourses.length === 0) {
          setEnrollments([])
          return
        }

        const courseIds = tutorCourses.map(course => course.id)

        // Then fetch enrollments for these courses
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollmentTable')
          .select(`
            *,
            userTable:clerkID (*),
            courseTable:courseID (*)
          `)
          .in('courseID', courseIds)
          .order('created_at', { ascending: false })

        if (enrollmentError) throw enrollmentError
        
        // Filter out any enrollments where courseTable or userTable is null
        const validEnrollments = enrollmentData.filter(
          enrollment => enrollment.courseTable && enrollment.userTable
        )
        
        setEnrollments(validEnrollments)
      } catch (error) {
        console.error('Error fetching enrollments:', error)
        toast.error('Failed to load enrollment data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollments()
  }, [user])

  const handleUnenroll = async () => {
    if (!enrollmentToDelete) return

    try {
      const { error } = await supabase
        .from('enrollmentTable')
        .delete()
        .eq('clerkID', enrollmentToDelete.clerkId)
        .eq('courseID', enrollmentToDelete.courseId)

      if (error) throw error

      // Update local state
      setEnrollments(prev => prev.filter(enrollment => 
        !(enrollment.clerkID === enrollmentToDelete.clerkId && 
          enrollment.courseID === enrollmentToDelete.courseId)
      ))

      toast.success('Student unenrolled successfully')
      setShowConfirmDialog(false)
      setEnrollmentToDelete(null)
    } catch (error) {
      console.error('Error unenrolling student:', error)
      toast.error('Failed to unenroll student')
    }
  }

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }

  // Group enrollments by course
  const courseGroups = enrollments.reduce((groups, enrollment) => {
    if (!enrollment.courseTable) return groups // Skip if courseTable is null

    const courseId = enrollment.courseID
    if (!groups[courseId]) {
      groups[courseId] = {
        course: enrollment.courseTable,
        students: []
      }
    }
    if (enrollment.userTable) { // Only add if userTable exists
      groups[courseId].students.push({
        user: enrollment.userTable,
        enrolledAt: enrollment.created_at
      })
    }
    return groups
  }, {} as Record<string, CourseGroup>)

  // Filter based on search term
  const filteredCourseGroups = Object.entries(courseGroups).filter(([_, group]: [string, CourseGroup]) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      group.course.title.toLowerCase().includes(searchLower) ||
      group.students.some(student => 
        student.user.fullName?.toLowerCase().includes(searchLower) ||
        student.user.emailAddress?.toLowerCase().includes(searchLower)
      )
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Course Enrollments</h2>
        <p className="text-gray-400">View and manage student enrollments across all courses</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by course title, student name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg"
        />
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
            </div>
          </div>
        ) : filteredCourseGroups.length > 0 ? (
          filteredCourseGroups.map(([courseId, group]: [string, CourseGroup]) => (
            <div
              key={courseId}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Course Header */}
              <div
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleCourseExpansion(courseId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
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
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {group.course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {group.students.length} enrolled student{group.students.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-normal">
                        {group.course.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      expandedCourses.has(courseId) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Student List */}
              {expandedCourses.has(courseId) && (
                <div className="border-t border-border">
                  <div className="p-6 space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 text-sm text-muted-foreground font-medium px-4">
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
                          className="grid grid-cols-12 gap-4 items-center bg-white/5 rounded-xl p-4 text-sm"
                        >
                          {/* Student Name & Avatar */}
                          <div className="col-span-4 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-primary flex-shrink-0">
                              {student.user.fullName?.[0] || 'A'}
                            </div>
                            <span className="text-foreground font-medium truncate">
                              {student.user.fullName || 'Anonymous'}
                            </span>
                          </div>

                          {/* Email */}
                          <div className="col-span-4 text-muted-foreground truncate">
                            {student.user.emailAddress || 'No email provided'}
                          </div>

                          {/* Enrollment Date */}
                          <div className="col-span-2 text-muted-foreground">
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
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive-background/10"
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
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground text-lg font-medium mb-2">No Enrollments Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm
                ? "No enrollments match your search criteria. Try a different search term."
                : "There are no student enrollments yet. Students can enroll in courses from the course catalog."}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card border border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unenrollment</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to unenroll this student from the course? This action cannot be undone.
              <div className="mt-4 p-4 bg-muted-background rounded-lg space-y-2">
                <p><strong className="text-foreground">Student:</strong> <span className="text-muted-foreground">{enrollmentToDelete?.studentName}</span></p>
                <p><strong className="text-foreground">Course:</strong> <span className="text-muted-foreground">{enrollmentToDelete?.courseName}</span></p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-muted-background text-foreground hover:bg-muted-foreground border-none"
              onClick={() => {
                setShowConfirmDialog(false)
                setEnrollmentToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenroll}
              className="bg-destructive hover:bg-destructive-foreground text-destructive-foreground border-none"
            >
              Yes, Unenroll Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const UploadContent = () => {
  const { user } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [uploadData, setUploadData] = useState<VideoUpload>({
    courseId: "",
    videoFile: null,
    thumbnailFile: null,
    Name: ""
  })
  const [isUploading, setIsUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('courseTable')
          .select('*')
          .eq('clerkID', user.id) // Only fetch courses owned by this tutor
          .order('created_at', { ascending: false })

        if (error) throw error
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('Failed to load courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [user])

  const handleUploadClick = (course: Course) => {
    setSelectedCourse(course)
    setUploadData({
      courseId: course.id,
      videoFile: null,
      thumbnailFile: null,
      Name: ""
    })
  }

  const handleFileChange = (type: 'video' | 'thumbnail', file: File | null) => {
    setUploadData(prev => ({
      ...prev,
      [type === 'video' ? 'videoFile' : 'thumbnailFile']: file
    }))
  }

  const handleUpload = async () => {
    if (!selectedCourse || !uploadData.videoFile || !uploadData.thumbnailFile || !uploadData.Name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsUploading(true)

      // Validate video file
      if (!uploadData.videoFile.type.startsWith('video/')) {
        throw new Error('Please upload a valid video file')
      }

      // Validate thumbnail file
      if (!uploadData.thumbnailFile.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file')
      }

      // Validate file sizes
      if (uploadData.videoFile.size > 500 * 1024 * 1024) { // 500MB limit for videos
        throw new Error('Video file size must be less than 500MB')
      }
      if (uploadData.thumbnailFile.size > 5 * 1024 * 1024) { // 5MB limit for thumbnails
        throw new Error('Thumbnail file size must be less than 5MB')
      }

      // Upload video
      const videoExt = uploadData.videoFile.name.split('.').pop()
      const videoFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${videoExt}`
      const videoPath = `videos/${videoFileName}`

      const { error: videoError } = await supabase.storage
        .from('nascon-test')
        .upload(videoPath, uploadData.videoFile)

      if (videoError) throw videoError

      // Get video URL
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('nascon-test')
        .getPublicUrl(videoPath)

      // Upload thumbnail
      const thumbnailExt = uploadData.thumbnailFile.name.split('.').pop()
      const thumbnailFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${thumbnailExt}`
      const thumbnailPath = `thumbnails/${thumbnailFileName}`

      const { error: thumbnailError } = await supabase.storage
        .from('nascon-test')
        .upload(thumbnailPath, uploadData.thumbnailFile)

      if (thumbnailError) throw thumbnailError

      // Get thumbnail URL
      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('nascon-test')
        .getPublicUrl(thumbnailPath)

      // Insert into videoTable
      const { error: dbError } = await supabase
        .from('videoTable')
        .insert({
          courseID: selectedCourse.id,
          videoUrl: videoUrl,
          videoThumbnail: thumbnailUrl,
          Name: uploadData.Name
        })

      if (dbError) throw dbError

      toast.success('Video uploaded successfully')
      setSelectedCourse(null)
      setUploadData({
        courseId: "",
        videoFile: null,
        thumbnailFile: null,
        Name: ""
      })
    } catch (error) {
      console.error('Error uploading video:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Content</h2>
          <p className="text-gray-400">Add new video content to your courses</p>
        </div>
        <div className="bg-white/5 rounded-lg px-4 py-2 flex items-center gap-2">
          <FileVideo className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-400">{courses.length} Course{courses.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
          <div
            key={course.id}
              className="group bg-card border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300"
          >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "https://via.placeholder.com/1920x1080?text=Course+Thumbnail"
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <h3 className="text-lg font-semibold text-foreground truncate mb-1">
                  {course.title}
                </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 rounded-lg px-3 py-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(course.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              <Button
                onClick={() => handleUploadClick(course)}
                  className="bg-primary text-primary-foreground hover:bg-accent rounded-lg font-semibold shadow px-6 py-2 transition-colors border-none"
              >
                  <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileVideo className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-foreground text-xl font-medium mb-3">No Courses Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start by creating a course in the "Create Course" section. Once created, you can upload video content here.
          </p>
          <Button
            onClick={() => window.location.href = '/tutor-dashboard?tab=course-creation'}
            className="bg-primary text-primary-foreground hover:bg-accent rounded-lg font-semibold shadow px-6 py-2 transition-colors border-none"
          >
            Create Your First Course
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="bg-card border border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upload Video Content</DialogTitle>
            <p className="text-muted-foreground mt-2">Add new video content to "{selectedCourse?.title}"</p>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Video Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-400" />
                Video Name
              </label>
              <Input
                type="text"
                placeholder="Enter video name"
                value={uploadData.Name}
                onChange={(e) => setUploadData(prev => ({ ...prev, Name: e.target.value }))}
                className="bg-white/5 border-white/10 text-foreground placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-purple-400" />
                    Video File
                  </label>
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200",
                      uploadData.videoFile 
                        ? "bg-primary/10 border-primary/30" 
                        : "border-border hover:border-border/20"
                    )}
                    onClick={() => videoInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    {uploadData.videoFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/[0.2] rounded-xl flex items-center justify-center mx-auto">
                          <FileVideo className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-foreground truncate">
                            {uploadData.videoFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-border rounded-xl flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Choose video file</p>
                          <p className="text-xs text-muted-foreground">MP4, WebM or Ogg (max. 500MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video', e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Thumbnail Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Image className="w-4 h-4 text-rose-400" />
                    Video Thumbnail
                  </label>
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200",
                      uploadData.thumbnailFile 
                        ? "bg-primary/10 border-primary/30" 
                        : "border-border hover:border-border/20"
                    )}
                    onClick={() => thumbnailInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    {uploadData.thumbnailFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/[0.2] rounded-xl flex items-center justify-center mx-auto">
                          <Image className="w-6 h-6 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-foreground truncate">
                            {uploadData.thumbnailFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadData.thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-border rounded-xl flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Choose thumbnail</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max. 5MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] w-1/2 rounded-full animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground text-center">Uploading video content...</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setSelectedCourse(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-border/10"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="bg-primary text-primary-foreground hover:bg-accent rounded-lg font-semibold shadow px-6 py-2 transition-colors border-none"
              disabled={isUploading || !uploadData.videoFile || !uploadData.thumbnailFile}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ManageContents = () => {
  const { user } = useUser()
  const [courses, setCourses] = useState<EditCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<EditCourse | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<{id: string, courseId: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch courses with their videos
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('courseTable')
          .select(`
            *,
            videos:videoTable(*)
          `)
          .eq('clerkID', user.id) // Only fetch courses owned by this tutor
          .order('created_at', { ascending: false })

        if (error) throw error
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('Failed to load courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [user])

  const handleEditClick = (course: EditCourse) => {
    setSelectedCourse(course)
    setEditedTitle(course.title)
    setEditedDescription(course.description)
    setSelectedFile(null)
  }

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return

    try {
      const { error } = await supabase
        .from('videoTable')
        .delete()
        .eq('id', videoToDelete.id)
        .eq('courseID', videoToDelete.courseId)

      if (error) throw error

      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id === videoToDelete.courseId) {
            return {
              ...course,
              videos: course.videos?.filter(video => video.id !== videoToDelete.id)
            }
          }
          return course
        })
      )

      toast.success('Video deleted successfully')
      setShowDeleteDialog(false)
      setVideoToDelete(null)
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Failed to delete video')
    }
  }

  const handleUpdate = async () => {
    if (!selectedCourse) return

    try {
      let updates: any = {}
      let hasUpdates = false

      // Check if title was changed
      if (editedTitle !== selectedCourse.title && editedTitle.trim()) {
        updates.title = editedTitle
        hasUpdates = true
      }

      // Check if description was changed
      if (editedDescription !== selectedCourse.description && editedDescription.trim()) {
        updates.description = editedDescription
        hasUpdates = true
      }

      // Handle image upload if new file is selected
      if (selectedFile) {
        try {
          // Validate file type
          if (!selectedFile.type.startsWith('image/')) {
            throw new Error('Please upload an image file')
          }

          // Validate file size (max 5MB)
          if (selectedFile.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB')
          }

          // Create a unique file name
          const fileExt = selectedFile.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `thumbnails/${fileName}`

          // Upload to Supabase
          const { error: uploadError } = await supabase.storage
            .from('nascon-test')
            .upload(filePath, selectedFile)

          if (uploadError) throw uploadError

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('nascon-test')
            .getPublicUrl(filePath)

          updates.thumbnail = publicUrl
          hasUpdates = true
        } catch (error) {
          console.error('Error uploading image:', error)
          toast.error('Failed to upload image')
          return
        }
      }

      if (!hasUpdates) {
        toast.info('No changes to update')
        return
      }

      // Update the course
      const { error } = await supabase
        .from('courseTable')
        .update(updates)
        .eq('id', selectedCourse.id)

      if (error) throw error

      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, ...updates }
            : course
        )
      )

      toast.success('Course updated successfully')
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Failed to update course')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
      <div>
          <h2 className="text-2xl font-bold text-foreground">Course Contents</h2>
          <p className="text-muted-foreground">Manage and organize your course materials</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 rounded-lg px-4 py-2 flex items-center gap-2">
            <Book className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">{courses.length} Course{courses.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="bg-white/5 rounded-lg px-4 py-2 flex items-center gap-2">
            <FileVideo className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-gray-400">
              {courses.reduce((total, course) => total + (course.videos?.length || 0), 0)} Videos
            </span>
          </div>
        </div>
      </div>
      
          <Tabs defaultValue="upload" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-muted-background border border-border h-12 p-1 grid grid-cols-2 w-[400px] rounded-xl">
                <TabsTrigger 
                  value="upload"
                  className="data-[state=active]:bg-primary/[0.2] data-[state=active]:text-primary data-[state=active]:border-primary/30 text-muted-foreground hover:text-foreground transition-colors px-4 rounded-lg flex items-center gap-2 h-10"
                >
                  <Upload className="w-4 h-4 " />
                  <h2 className="text-primary">Upload Content</h2>
                </TabsTrigger>
                <TabsTrigger 
                  value="edit"
                  className="data-[state=active]:bg-primary/[0.2] data-[state=active]:text-primary data-[state=active]:border-primary/30 text-muted-foreground hover:text-foreground transition-colors px-4 rounded-lg flex items-center gap-2 h-10"
                >
                  <Settings className="w-4 h-4" />
                  Edit Content
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="mt-6 focus-visible:outline-none">
              <UploadContent />
            </TabsContent>

            <TabsContent value="edit" className="mt-6 focus-visible:outline-none">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
                    </div>
                  </div>
                ) : courses.length > 0 ? (
                  courses.map(course => (
                    <div
                      key={course.id}
                      className="group bg-card border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300"
                    >
                      {/* Course Header */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="relative aspect-video rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "https://via.placeholder.com/1920x1080?text=Course+Thumbnail"
                            }}
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-between">
                          <div>
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {course.title}
                          </h3>
                            <p className="text-sm text-muted-foreground">
                            {course.description}
                          </p>
                        </div>
                          <div className="flex items-center gap-3 mt-4">
                        <Button
                          onClick={() => handleEditClick(course)}
                              className="bg-primary text-primary-foreground hover:bg-accent border-none shadow"
                        >
                              <Settings className="w-4 h-4 mr-2" />
                          Edit Course
                        </Button>
                          </div>
                        </div>
                      </div>

                      {/* Videos List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                            <FileVideo className="w-5 h-5 text-purple-400" />
                            Course Videos
                          </h4>
                          {course.videos && course.videos.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              Last updated {new Date(Math.max(...course.videos.map(v => new Date(v.created_at).getTime()))).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.videos && course.videos.length > 0 ? (
                            course.videos.map((video) => (
                              <div
                                key={video.id}
                                className="group/video bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-border hover:border-primary/30 transition-all duration-300"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black">
                                    <img
                                      src={video.videoThumbnail || "/placeholder.svg"}
                                      alt="Video thumbnail"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "https://via.placeholder.com/1920x1080?text=Video"
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                                      <PlayCircle className="w-8 h-8 text-foreground" />
                                  </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-foreground text-sm font-medium truncate">
                                        {video.Name}
                                      </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Added {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                    <a 
                                      href={video.videoUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                        className="text-xs text-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                                    >
                                        <PlayCircle className="w-3 h-3" />
                                        Preview
                                    </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive-background/10 p-0 h-auto text-xs"
                                  onClick={() => {
                                    setVideoToDelete({
                                      id: video.id,
                                      courseId: course.id
                                    })
                                    setShowDeleteDialog(true)
                                  }}
                                >
                                  Delete
                                </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="md:col-span-2">
                              <div className="text-center py-8 bg-white/5 rounded-xl border border-border">
                                <FileVideo className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm mb-4">No videos uploaded yet</p>
                                <Button
                                  onClick={() => {
                                    const uploadTab = document.querySelector('[value="upload"]') as HTMLButtonElement;
                                    if (uploadTab) uploadTab.click();
                                  }}
                                  className="bg-primary text-primary-foreground hover:bg-accent border-none shadow"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload First Video
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-foreground text-xl font-medium mb-3">No Courses Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Create your first course to start managing content. You can add videos and edit course details once created.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/tutor-dashboard?tab=course-creation'}
                      className="bg-primary text-primary-foreground hover:bg-accent rounded-lg font-semibold shadow px-6 py-2 transition-colors border-none"
                    >
                      Create Your First Course
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

      {/* Edit Course Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="bg-card border border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Course</DialogTitle>
            <p className="text-muted-foreground mt-2">Update course information and thumbnail</p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {/* Course Details Section */}
            <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Book className="w-4 h-4 text-purple-400" />
                Course Title
              </label>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter course title"
                  className="bg-white/5 border-white/10 text-foreground placeholder:text-gray-400 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                Description
              </label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter course description"
                  className="min-h-[180px] bg-white/5 border-white/10 text-foreground placeholder:text-gray-400 focus:border-primary/50 focus:ring-primary/20"
              />
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Image className="w-4 h-4 text-purple-400" />
                  Course Thumbnail
              </label>
                <div 
                  className={cn(
                    "relative aspect-video border-2 border-dashed rounded-xl overflow-hidden group transition-colors duration-200",
                    selectedFile 
                      ? "bg-primary/10 border-primary/30" 
                      : "border-border hover:border-border/20"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Current or Selected Thumbnail Preview */}
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : selectedCourse?.thumbnail}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://via.placeholder.com/1920x1080?text=Course+Thumbnail"
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-6 h-6 text-foreground" />
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        {selectedFile ? 'Change thumbnail' : 'Upload thumbnail'}
                      </p>
                    </div>
                  </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setSelectedFile(file)
                }}
              />
                {selectedFile && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 bg-white/5 text-sm text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-purple-400" />
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="text-muted-foreground">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/20 hover:border-primary/30"
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setSelectedCourse(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-border/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-primary text-primary-foreground hover:bg-accent rounded-lg font-semibold shadow px-6 py-2 transition-colors border-none"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-border/10 hover:bg-border/20 text-foreground border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              className="bg-destructive text-foreground hover:bg-destructive/80 rounded-lg font-medium px-6 py-2 transition-colors border-none"
            >
              Delete Video
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const ComingSoon = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
      <p className="text-muted-foreground">New features are on the way</p>
    </div>
    
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-foreground text-lg font-medium mb-2">Exciting Features Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're working on new features to enhance your teaching experience. Stay tuned!
        </p>
      </div>
    </div>
  </div>
)

const TutorDashboardPage = () => {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>("course-creation")

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = "/"
    }
  }, [isLoaded, user])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-slate-950 pt-28 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "course-creation":
        return <CourseCreation />
      case "view-enrollments":
        return <ViewEnrollments />
      case "manage-contents":
        return <ManageContents />
      case "coming-soon":
        return <ComingSoon />
      default:
        return <CourseCreation />
    }
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0 space-y-2">
            <TabButton
              active={activeTab === "course-creation"}
              icon={Plus}
              label="Create Course"
              onClick={() => setActiveTab("course-creation")}
            />
            <TabButton
              active={activeTab === "view-enrollments"}
              icon={Users}
              label="View Enrollments"
              onClick={() => setActiveTab("view-enrollments")}
            />
            <TabButton
              active={activeTab === "manage-contents"}
              icon={FileText}
              label="Manage Contents"
              onClick={() => setActiveTab("manage-contents")}
            />
            <TabButton
              active={activeTab === "coming-soon"}
              icon={Sparkles}
              label="Coming Soon"
              onClick={() => setActiveTab("coming-soon")}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 overflow-x-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default TutorDashboardPage 