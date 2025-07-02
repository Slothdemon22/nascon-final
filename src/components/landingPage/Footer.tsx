"use client"

import type React from "react"

import { Canvas, useFrame } from "@react-three/fiber"
import type { RootState } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  ArrowRight,
  Sparkles,
  Rocket,
  Globe,
  Heart,
} from "lucide-react"
import type * as THREE from "three"

// 3D Footer Brain
function FooterBrain3D() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state: RootState) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={1}
          emissive="#4c1d95"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Mini sparkles around brain */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Float key={i} speed={2 + i * 0.1} rotationIntensity={0.3}>
          <mesh
            position={[(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4]}
            scale={0.05}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.8} />
          </mesh>
        </Float>
      ))}
    </Float>
  )
}

// 3D Footer Scene
function Footer3DScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <Suspense fallback={null}>
        <Environment preset="night" />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#06b6d4" />

        <FooterBrain3D />
      </Suspense>
    </Canvas>
  )
}

// Footer Link Component
function FooterLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) {
  return (
    <motion.a
      href={href}
      className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 group"
      whileHover={{ x: 5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {Icon && <Icon className="w-4 h-4 group-hover:text-purple-400 transition-colors" />}
      <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
        {children}
      </span>
    </motion.a>
  )
}

// Social Media Button
function SocialButton({ icon: Icon, href, label, color }: { icon: any; href: string; label: string; color: string }) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      className={`
        w-12 h-12 rounded-2xl flex items-center justify-center
        bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm
        border border-white/20 hover:border-white/40
        transition-all duration-300 group
        hover:shadow-lg hover:shadow-purple-500/25
      `}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
    >
      <Icon className={`w-5 h-5 text-gray-300 group-hover:${color} transition-colors duration-300`} />
    </motion.a>
  )
}

// Newsletter Signup
function NewsletterSignup() {
  return (
    <motion.div
      className="bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Stay Ahead of the Curve</h3>
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">
        Get exclusive insights, early access to new features, and AI-powered learning tips delivered to your inbox.
      </p>

      <div className="flex gap-3">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
        />
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-6 py-3 rounded-xl group">
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  )
}

export function Footer() {
  return (
    <footer className="w-full bg-[var(--background)] border-t border-border py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight" style={{fontFamily: 'var(--font-sans)'}}>EduAI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center text-sm md:text-base">
            <a href="#" className="text-accent hover:text-primary font-semibold transition-colors">AI Courses</a>
            <a href="#" className="text-accent2 hover:text-primary font-semibold transition-colors">Virtual Labs</a>
            <a href="#" className="text-primary hover:text-accent font-semibold transition-colors">Skill Assessment</a>
            <a href="#" className="text-primary hover:text-accent2 font-semibold transition-colors">Certifications</a>
            <a href="#" className="text-muted-foreground hover:text-primary font-semibold transition-colors">Blog</a>
            <a href="#" className="text-muted-foreground hover:text-primary font-semibold transition-colors">Help Center</a>
          </div>
        </div>
        <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 border-t border-border pt-4 md:pt-6">
          <div className="text-muted-foreground text-xs md:text-sm text-center">© 2024 EduAI. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
