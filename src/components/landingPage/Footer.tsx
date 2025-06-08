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
    <footer className="relative bg-gradient-to-b from-slate-900 to-black overflow-hidden">
      {/* 3D Background */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-30">
        <Footer3DScene />
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Top Section */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                EduAI
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">
              Revolutionizing education through AI-powered learning experiences that adapt to every student's unique
              journey.
            </p>

            {/* Social Media */}
            <div className="flex gap-3">
              <SocialButton icon={Twitter} href="#" label="Twitter" color="text-blue-400" />
              <SocialButton icon={Linkedin} href="#" label="LinkedIn" color="text-blue-600" />
              <SocialButton icon={Github} href="#" label="GitHub" color="text-gray-400" />
              <SocialButton icon={Youtube} href="#" label="YouTube" color="text-red-500" />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Platform
            </h3>
            <div className="space-y-4">
              <FooterLink href="#" icon={Rocket}>
                AI Courses
              </FooterLink>
              <FooterLink href="#" icon={Globe}>
                Virtual Labs
              </FooterLink>
              <FooterLink href="#" icon={Brain}>
                Skill Assessment
              </FooterLink>
              <FooterLink href="#" icon={Sparkles}>
                Certifications
              </FooterLink>
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-white mb-6">Resources</h3>
            <div className="space-y-4">
              <FooterLink href="#">Documentation</FooterLink>
              <FooterLink href="#">API Reference</FooterLink>
              <FooterLink href="#">Community</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Help Center</FooterLink>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-6">Contact</h3>
            <div className="space-y-4">
              <FooterLink href="mailto:hello@eduai.com" icon={Mail}>
                hello@eduai.com
              </FooterLink>
              <FooterLink href="tel:+1234567890" icon={Phone}>
                +1 (234) 567-890
              </FooterLink>
              <FooterLink href="#" icon={MapPin}>
                San Francisco, CA
              </FooterLink>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-16">
          <NewsletterSignup />
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-white/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-400">
              <span>© 2024 EduAI. Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.div>
              <span>for the future of learning</span>
            </div>

            {/* Legal Links */}
            <div className="flex gap-8">
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Cookie Policy</FooterLink>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </footer>
  )
}
