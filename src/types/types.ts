// Common types used across the application
export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Add more types as needed for the application 

export interface Video {
  id: string
  videoUrl: string
  videoThumbnail: string
  Name: string
  created_at: string
} 

export interface EditCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  created_at: string
  videos?: Video[]
} 