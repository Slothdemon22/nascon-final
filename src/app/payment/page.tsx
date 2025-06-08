"use client"

import { useState, Suspense } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Activity, ArrowRight, CreditCard, DollarSign, Lock, Shield, CheckCircle2, GraduationCap, BookOpen } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const stripePromise = loadStripe(
  "pk_test_51PrFee05Xih061cSZB11wBkHrgCxoAIbsx1hB40L0hMGd3zAFpcYIAmEi82ATmqIkXCpEOzOp7mrgZLno5Q5tccU00dhIu9Y5p",
)

const PaymentForm = () => {
  const searchParams = useSearchParams()
  const amount = Number(searchParams.get("amount")) || 10.0

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const stripe = useStripe()
  const elements = useElements()

  const handleCreatePaymentIntent = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amount * 100 }), // Convert to cents for Stripe
      })

      if (!response.ok) throw new Error("Failed to create checkout session")

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (!stripe) throw new Error("Stripe.js has not loaded yet")

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) setError(error.message)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    setIsProcessing(true)
    const cardElement = elements.getElement(CardElement)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement as any },
    })
    if (error) setError(error.message)
    else if (paymentIntent?.status === "succeeded") setPaymentSuccess(true)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      

      <main className="max-w-5xl mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1">
            <div className="bg-slate-900/70 backdrop-blur border border-white/10 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                  <GraduationCap className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  Start Learning Today
                </h2>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              {paymentSuccess ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-8 rounded-lg text-center space-y-4">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Welcome to Your Learning Journey!</h3>
                  <p className="text-gray-400">Your enrollment is confirmed. Start exploring your courses and connect with expert tutors.</p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300"
                  >
                    Go to Learning Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : clientSecret ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Payment Information</label>
                    <div className="bg-slate-950/50 border border-white/10 rounded-md p-4">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#fff",
                              "::placeholder": { color: "#9ca3af" },
                            },
                            invalid: {
                              color: "#f87171",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Enrollment <Lock className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400">Click below to begin your enrollment process and unlock premium learning resources.</p>
                  <button
                    onClick={handleCreatePaymentIntent}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Start Enrollment <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="lg:w-96">
            <div className="bg-slate-900/70 backdrop-blur border border-white/10 rounded-xl p-6 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Enrollment Summary
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between border-b border-white/10 pb-3 text-sm text-gray-400">
                  <span>Selected Plan</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-white font-semibold">
                  <span>Total</span>
                  <span className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="bg-slate-950/50 border border-white/10 rounded-lg p-4 text-sm text-gray-400 space-y-2">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                    <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  Premium Learning Features
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    1-on-1 Expert Tutoring Sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Interactive Learning Materials
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Progress Tracking & Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    24/7 Tutor Support Access
                  </li>
                </ul>
              </div>
              <div className="text-xs text-gray-500 text-center mt-6 flex items-center justify-center gap-2">
                <Lock className="h-3 w-3" /> Secure payment powered by Stripe
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { icon: GraduationCap, title: "Expert Tutors", desc: "Certified professionals" },
            { icon: CheckCircle2, title: "Quality Guarantee", desc: "100% satisfaction" },
            { icon: Lock, title: "Safe Learning", desc: "Secure environment" },
            { icon: Activity, title: "Live Support", desc: "Always available" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900/70 backdrop-blur border border-white/10 rounded-lg p-5 text-center hover:border-purple-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                <item.icon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const PaymentPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      }>
        <PaymentForm />
      </Suspense>
    </Elements>
  )
}

export default PaymentPage
