"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useState } from "react"
import { Environment, Float, OrbitControls, MeshDistortMaterial, Sparkles as DreiSparkles } from "@react-three/drei"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Zap, Sparkles, ArrowRight, Play, Rocket, Shield, Target, Globe, Award, TrendingUp } from "lucide-react"
import type * as THREE from "three"
import { PricingSection } from "@/components/landingPage/pricing-section"
import Link from "next/link"

// Enhanced 3D Brain with Pulsing Effect
function EnhancedBrain3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <group>
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          scale={[2.5, 2.5, 2.5]}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color={hovered ? "#ec4899" : "#8b5cf6"}
            roughness={0.1}
            metalness={0.8}
            distort={0.4}
            speed={2}
            emissive={hovered ? "#be185d" : "#4c1d95"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Neural Network Connections */}
        {Array.from({ length: 30 }).map((_, i) => (
          <Float key={i} speed={2 + i * 0.1} rotationIntensity={0.5}>
            <mesh
              position={[(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6]}
              scale={0.08}
            >
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#0891b2"
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Connection Lines */}
            <mesh position={[(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 0]}>
              <cylinderGeometry args={[0.01, 0.01, Math.random() * 3 + 1]} />
              <meshStandardMaterial
                color="#06d6a0"
                emissive="#059669"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
              />
            </mesh>
          </Float>
        ))}

        {/* Sparkles around brain */}
        <DreiSparkles count={100} scale={[6, 6, 6]} size={3} speed={0.4} color="#fbbf24" />
      </group>
    </Float>
  )
}

// Holographic Book with Pages
function HolographicBook({ position }: { position: [number, number, number] }) {
  const bookRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (bookRef.current) {
      bookRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.5}>
      <group ref={bookRef} position={position}>
        {/* Book Cover */}
        <mesh>
          <boxGeometry args={[1, 1.4, 0.15]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.2}
            metalness={0.8}
            emissive="#d97706"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Pages */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 0, 0.08 + i * 0.02]}>
            <boxGeometry args={[0.9, 1.3, 0.01]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.9}
              emissive="#f3f4f6"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}

        {/* Holographic Effect */}
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshStandardMaterial color="#06d6a0" transparent opacity={0.3} emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

// Advanced Geometric Shapes with Shaders
function AdvancedGeometricShapes() {
  return (
    <>
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
        <mesh position={[-4, 3, -2]} scale={0.8}>
          <octahedronGeometry args={[1, 2]} />
          <MeshDistortMaterial color="#ec4899" roughness={0.1} metalness={0.9} distort={0.3} speed={1.5} wireframe />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
        <mesh position={[4, -1.5, -1]} scale={0.6}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#06d6a0"
            metalness={1}
            roughness={0.1}
            emissive="#059669"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1} floatIntensity={1.8}>
        <mesh position={[-3, -2.5, 1]} scale={0.7}>
          <dodecahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
            distort={0.2}
            speed={2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* DNA Helix */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <group position={[5, 2, 2]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 0.5) * 0.5, i * 0.2 - 2, Math.sin(i * 0.5) * 0.5]} scale={0.1}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
                emissive={i % 2 === 0 ? "#7c3aed" : "#0891b2"}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </>
  )
}

// Floating AI Particles
function AIParticles() {
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 100 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
          <mesh
            position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]}
            scale={0.02 + Math.random() * 0.03}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color={Math.random() > 0.5 ? "#8b5cf6" : "#06b6d4"}
              emissive={Math.random() > 0.5 ? "#7c3aed" : "#0891b2"}
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Enhanced Hero 3D Scene
function EnhancedHero3DScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <Suspense fallback={null}>
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        <pointLight position={[0, 0, 15]} intensity={1.5} color="#fbbf24" />

        <EnhancedBrain3D />
        <HolographicBook position={[-5, 1.5, 3]} />
        <HolographicBook position={[5, -1.5, 2]} />
        <HolographicBook position={[0, 3, -2]} />
        <AdvancedGeometricShapes />
        <AIParticles />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Suspense>
    </Canvas>
  )
}

// Enhanced Feature Card with Better Contrast
function EnhancedFeatureCard({
  icon: Icon,
  title,
  description,
  delay,
  gradient,
  accentColor,
}: {
  icon: any
  title: string
  description: string
  delay: number
  gradient: string
  accentColor: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{
        scale: 1.05,
        rotateY: 8,
        rotateX: 5,
        z: 50,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="perspective-1000 transform-gpu"
    >
      <Card
        className={`
        relative p-8 h-full
        bg-gradient-to-br ${gradient}
        backdrop-blur-xl border-2 border-white/20
        hover:border-white/40 transition-all duration-500
        shadow-2xl hover:shadow-3xl
        group overflow-hidden
      `}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} animate-pulse`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        </div>

        {/* Glowing Border Effect */}
        <div
          className={`
          absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          animate-pulse
        `}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon Container */}
          <div className="mb-6 relative">
            <motion.div
              className={`
                w-20 h-20 rounded-3xl flex items-center justify-center
                bg-gradient-to-br from-white/20 to-white/10
                backdrop-blur-sm border border-white/30
                shadow-lg group-hover:shadow-xl transition-all duration-300
              `}
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-10 h-10 text-white drop-shadow-lg" />
            </motion.div>

            {/* Floating Sparkle */}
            <motion.div
              className={`absolute -top-2 -right-2 w-8 h-8 ${accentColor} rounded-full flex items-center justify-center shadow-lg`}
              animate={isHovered ? { scale: 1.2, rotate: 180 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            className="text-2xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            animate={isHovered ? { x: 5 } : { x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-gray-100 leading-relaxed text-base font-medium drop-shadow-sm"
            animate={isHovered ? { x: 5 } : { x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>

          {/* Hover Arrow */}
          <motion.div
            className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
            animate={isHovered ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Animated Gradient Overlay */}
        <div
          className={`
          absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500
          bg-gradient-to-tr from-white via-transparent to-white
        `}
        />
      </Card>
    </motion.div>
  )
}

// Stats Counter Component
function StatsCounter({ number, label, delay }: { number: string; label: string; delay: number }) {
  return (
    <motion.div
      className="text-center group"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2 drop-shadow-lg"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {number}
      </motion.div>
      <div className="text-gray-300 font-semibold text-lg group-hover:text-white transition-colors">{label}</div>
    </motion.div>
  )
}

export default function EnhancedLandingPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced Hero Section - Full height, no padding needed */}
      <section className="relative h-screen flex items-center justify-center">
        {/* 3D Background */}
        <motion.div className="absolute inset-0 z-0" style={{ y }}>
          <EnhancedHero3DScene />
        </motion.div>

        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/90 z-10" />

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20 z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.h1
              className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-8 leading-tight drop-shadow-2xl"
              initial={{ scale: 0.8, rotateX: -15 }}
              animate={{ scale: 1, rotateX: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              Future of
              <br />
              <motion.span
                className="text-white drop-shadow-2xl"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(139,92,246,0.5)",
                    "0 0 40px rgba(139,92,246,0.8)",
                    "0 0 20px rgba(139,92,246,0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                Learning
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.p
            className="text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Experience revolutionary education with AI-powered personalization, real-time collaboration, and immersive
            3D learning environments that adapt to your unique learning style.
          </motion.p>

          <motion.div
            className="flex justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white px-20 py-8 text-2xl rounded-3xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 group border-2 border-white/20"
                >
                  Start Your Journey
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                    <Rocket className="ml-3 w-8 h-8" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            className="flex justify-center gap-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <StatsCounter number="100K+" label="Active Learners" delay={0.1} />
            <StatsCounter number="5K+" label="AI Courses" delay={0.2} />
            <StatsCounter number="99.8%" label="Success Rate" delay={0.3} />
          </motion.div>
        </div>

        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0 z-10">
          {Array.from({ length: 80 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </section>

      {/* Rest of the content with proper spacing */}
      <div className="pt-24">
        {/* Enhanced Features Section */}
        <section className="py-40 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-purple-900/30" />

          <div className="max-w-8xl mx-auto px-6 relative z-10">
            <motion.div
              className="text-center mb-24"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.h2
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-cyan-300 mb-8 drop-shadow-xl"
                whileInView={{ scale: [0.9, 1] }}
                transition={{ duration: 0.8 }}
              >
                Revolutionary Features
              </motion.h2>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
                Discover how our cutting-edge AI platform transforms education with immersive technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              <EnhancedFeatureCard
                icon={Brain}
                title="AI-Powered Personalization"
                description="Advanced neural networks analyze your learning patterns to create personalized curricula that adapt in real-time to maximize your potential."
                delay={0.1}
                gradient="from-purple-600/90 to-purple-800/90"
                accentColor="bg-gradient-to-r from-pink-500 to-purple-500"
              />
              <EnhancedFeatureCard
                icon={Zap}
                title="Real-time Collaboration"
                description="Connect instantly with peers and mentors through our quantum-speed collaboration platform featuring live coding, virtual whiteboards, and AI moderation."
                delay={0.2}
                gradient="from-cyan-600/90 to-blue-800/90"
                accentColor="bg-gradient-to-r from-cyan-500 to-blue-500"
              />
              <EnhancedFeatureCard
                icon={Globe}
                title="Immersive 3D Learning"
                description="Step into virtual laboratories, historical recreations, and interactive simulations that make complex concepts tangible and unforgettable."
                delay={0.3}
                gradient="from-emerald-600/90 to-teal-800/90"
                accentColor="bg-gradient-to-r from-emerald-500 to-teal-500"
              />
              <EnhancedFeatureCard
                icon={Target}
                title="Smart Progress Tracking"
                description="AI-driven analytics provide deep insights into your learning journey with predictive modeling and personalized recommendations for optimal growth."
                delay={0.4}
                gradient="from-orange-600/90 to-red-800/90"
                accentColor="bg-gradient-to-r from-orange-500 to-red-500"
              />
              <EnhancedFeatureCard
                icon={Shield}
                title="Secure Learning Environment"
                description="Enterprise-grade security with blockchain verification ensures your achievements are permanent and your data remains completely private."
                delay={0.5}
                gradient="from-indigo-600/90 to-purple-800/90"
                accentColor="bg-gradient-to-r from-indigo-500 to-purple-500"
              />
              <EnhancedFeatureCard
                icon={Award}
                title="Industry Certification"
                description="Earn globally recognized credentials from top universities and tech companies, with AI-verified skill assessments and portfolio building."
                delay={0.6}
                gradient="from-yellow-600/90 to-orange-800/90"
                accentColor="bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.3),transparent_70%)]" />

          <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <motion.h2
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-cyan-300 mb-8 drop-shadow-2xl"
                whileInView={{ scale: [0.9, 1] }}
                transition={{ duration: 0.8 }}
              >
                Ready to Transform Your Future?
              </motion.h2>
              <p className="text-2xl text-gray-200 mb-16 font-medium leading-relaxed">
                Join the revolution of learners who are already experiencing the future of education
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white px-20 py-10 text-3xl rounded-3xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 group border-2 border-white/30"
                >
                  Begin Your Transformation
                  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
                    <TrendingUp className="ml-4 w-10 h-10" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />
      </div>
    </div>
  )
}
