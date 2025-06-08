"use client"

import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="pt-24 pb-12 flex items-center justify-center p-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-slate-900/70 backdrop-blur border border-white/10 rounded-xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-400 mb-8">
              Welcome to your learning journey! Your payment has been processed successfully, and you now have full access to your selected courses and tutoring services.
            </p>

            <div className="bg-slate-950/50 border border-white/10 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold">Next Steps</h2>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Access your personalized learning dashboard</li>
                <li>• Schedule your first tutoring session</li>
                <li>• Explore available course materials</li>
                <li>• Set up your learning goals</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/schedule-session"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all duration-300 border border-white/10"
              >
                Schedule First Session
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage 