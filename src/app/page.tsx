"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useState } from "react"
import { Environment, Float, OrbitControls, MeshDistortMaterial, Sparkles as DreiSparkles } from "@react-three/drei"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Brain, Zap, Sparkles, ArrowRight, Play, Rocket, Shield, Target, Globe, Award, TrendingUp, GraduationCap } from "lucide-react"
import type * as THREE from "three"
import { PricingSection } from "@/components/landingPage/pricing-section"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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

function HeroIllustration() {
  return (
    <svg width="340" height="260" viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="180" width="80" height="40" rx="8" fill="var(--primary)" />
      <rect x="120" y="160" width="80" height="60" rx="8" fill="var(--secondary)" />
      <rect x="210" y="200" width="80" height="20" rx="8" fill="var(--accent)" />
      <rect x="60" y="140" width="60" height="20" rx="6" fill="var(--accent2)" />
      {/* Graduation cap */}
      <g>
        <rect x="170" y="80" width="60" height="12" rx="4" fill="var(--primary)" />
        <polygon points="200,60 230,86 170,86" fill="var(--primary)" />
        <rect x="198" y="86" width="4" height="18" rx="2" fill="var(--accent2)" />
        <circle cx="200" cy="104" r="3" fill="var(--accent2)" />
      </g>
      {/* Learning path (curved line) */}
      <path d="M40 220 Q120 100 300 120" stroke="var(--accent)" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Dots on path */}
      <circle cx="120" cy="140" r="7" fill="var(--primary)" />
      <circle cx="200" cy="110" r="7" fill="var(--accent)" />
      <circle cx="270" cy="125" r="7" fill="var(--accent2)" />
    </svg>
  );
}

const partners = [
  { name: "Coursera", color: "#6246EA" },
  { name: "Udemy", color: "#19D3AE" },
  { name: "Khan Academy", color: "#FF6A3D" },
  { name: "edX", color: "#232946" },
  { name: "Google", color: "#4285F4" },
];

const steps = [
  { icon: "🎓", title: "Sign Up", desc: "Create your free account in seconds." },
  { icon: "📚", title: "Choose Course", desc: "Browse and enroll in top-rated courses." },
  { icon: "💡", title: "Learn & Practice", desc: "Engage with interactive lessons and quizzes." },
  { icon: "🏆", title: "Get Certified", desc: "Earn certificates to boost your career." },
];

const testimonials = [
  {
    name: "Ayesha Khan",
    quote: "EduAI made learning so much fun and effective! The platform is beautiful and easy to use.",
    role: "Student, Computer Science"
  },
  {
    name: "Ali Raza",
    quote: "The instructors are top-notch and the content is always up to date. Highly recommended!",
    role: "Professional, Data Analyst"
  },
  {
    name: "Sara Ahmed",
    quote: "I landed my dream job after completing several courses here. The certificates really helped!",
    role: "Graduate, Marketing"
  },
];

export default function EnhancedLandingPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const [showTutorMsg, setShowTutorMsg] = useState(false)
  const tutorMsgTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleBecomeTutor = () => {
    setShowTutorMsg(true)
    if (tutorMsgTimeout.current) clearTimeout(tutorMsgTimeout.current)
    tutorMsgTimeout.current = setTimeout(() => setShowTutorMsg(false), 3000)
  }

  return (
    <div className="bg-[var(--background)]">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-secondary via-white to-accent/10 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          {/* Left: Animated Text */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold mb-6 text-foreground leading-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Unlock Your <span className="text-primary">Potential</span> <br /> with <span className="text-accent">Modern Learning</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join thousands of learners and discover a world of knowledge, skills, and growth. Learn at your own pace with expert instructors and a vibrant community.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                className="bg-primary text-white hover:bg-primary/90 px-10 py-5 text-lg font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md"
                onClick={() => window.location.href = '/courses'}
              >
                <Rocket className="w-5 h-5" />
                Browse Courses
              </Button>
              <div className="flex flex-col items-center">
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10 px-10 py-5 text-lg font-bold rounded-xl flex items-center gap-2 transition-all duration-200"
                  onClick={handleBecomeTutor}
                >
                  <GraduationCap className="w-5 h-5" />
                  Become a Tutor
                </Button>
              </div>
            </motion.div>
          </div>
          {/* Right: Custom SVG Illustration */}
          <div className="flex-1 flex justify-center md:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </section>
      {/* Trusted By Section */}
      <section className="py-10 bg-gradient-to-r from-white via-secondary to-accent/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.h3 className="text-lg font-semibold text-muted-foreground mb-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.7 }}>
            Trusted by learners and partners worldwide
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((p, i) => (
              <motion.div
                key={p.name}
                className="text-xl font-bold px-6 py-2 rounded-lg"
                style={{ color: p.color, background: 'rgba(98,70,234,0.05)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {p.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-white to-secondary/30 border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 className="text-3xl font-bold text-foreground mb-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.7 }}>
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-md border border-border"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="font-bold text-lg mb-2 text-primary">{step.title}</div>
                <div className="text-muted-foreground">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-white via-secondary to-accent/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Why Choose EduAI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Learn from industry leaders and experienced educators who are passionate about teaching.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">Flexible Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Access courses anytime, anywhere, and learn at your own pace with our flexible online platform.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-accent2/20">
              <CardHeader>
                <CardTitle className="text-accent2">Career Advancement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Gain skills and certifications that help you advance your career and achieve your goals.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/10 via-white to-accent/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 className="text-3xl font-bold text-foreground mb-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.7 }}>
            What Our Learners Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="p-8 rounded-xl bg-white shadow-md border border-border flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
              >
                <div className="text-5xl mb-4">"</div>
                <div className="text-lg font-medium mb-4 text-foreground">{t.quote}</div>
                <div className="font-bold text-primary">{t.name}</div>
                <div className="text-muted-foreground text-sm">{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-accent/10 via-white to-secondary/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2 className="text-4xl font-extrabold text-foreground mb-6" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Ready to Start Learning?
          </motion.h2>
          <motion.p className="text-lg text-muted-foreground mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            Join EduAI today and unlock a world of knowledge, skills, and opportunities. Your journey begins now!
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
            <Button className="bg-primary text-white hover:bg-primary/90 px-10 py-4 text-lg shadow-lg">Get Started</Button>
          </motion.div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-secondary via-white to-accent/10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-center">Pricing Plans</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 text-center">
            Choose the perfect plan to accelerate your learning journey
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Plan */}
            <Card className="relative border h-full flex flex-col border-primary/20 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground mb-2">Basic Plan</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">$49.99</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">✓</span>Access to basic courses</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">✓</span>Community support</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">✓</span>Basic learning materials</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">✓</span>24/7 Support</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">✓</span>Course completion certificates</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full py-4 text-base bg-primary text-white hover:bg-primary/90">Get Started</Button>
              </div>
            </Card>
            {/* Premium Plan */}
            <Card className="relative border h-full flex flex-col border-accent/20 hover:shadow-lg transition-shadow duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-accent text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground mb-2">Premium Plan</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-accent">$99.99</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>Access to all courses</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>Priority support</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>Advanced learning materials</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>1-on-1 mentoring sessions</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>Certificate of completion</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>Career guidance sessions</li>
                  <li className="flex items-center gap-3 text-foreground"><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">✓</span>Industry project experience</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full py-4 text-base bg-accent text-white hover:bg-accent/90">Get Started</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
      <Dialog open={showTutorMsg} onOpenChange={setShowTutorMsg}>
        <DialogContent className="text-center">
          <div className="text-accent font-semibold text-lg">Email your CV at EduAI@gmail.com</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
