"use client"

import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const PaymentFailurePage = () => {
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
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
              Payment Unsuccessful
            </h1>
            
            <p className="text-gray-400 mb-8">
              We encountered an issue processing your payment. Don't worry - no charges have been made to your account. Please try again or contact our support team for assistance.
            </p>

            <div className="bg-slate-950/50 border border-white/10 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold">Common Issues</h2>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Insufficient funds in the account</li>
                <li>• Incorrect card information</li>
                <li>• Card expired or invalid</li>
                <li>• Transaction declined by bank</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/payment"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" /> Try Again
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all duration-300 border border-white/10"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentFailurePage 