import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

interface PricingOption {
  title: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const pricingOptions: PricingOption[] = [
  {
    title: "Basic Plan",
    price: 49.99,
    description: "Perfect for beginners starting their learning journey",
    features: [
      "Access to basic courses",
      "Community support",
      "Basic learning materials",
      "24/7 Support",
      "Course completion certificates"
    ]
  },
  {
    title: "Premium Plan",
    price: 99.99,
    description: "For serious learners who want to master their skills",
    features: [
      "Access to all courses",
      "Priority support",
      "Advanced learning materials",
      "1-on-1 mentoring sessions",
      "Certificate of completion",
      "Career guidance sessions",
      "Industry project experience"
    ],
    isPopular: true
  }
];

export const PricingSection = () => {
  const router = useRouter();

  const handlePurchase = (amount: number) => {
    router.push(`/payment?amount=${amount}`);
  };

  return (
    <section className="py-40 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-purple-900/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-cyan-300 mb-8"
            whileInView={{ scale: [0.9, 1] }}
            transition={{ duration: 0.8 }}
          >
            Pricing Plans
          </motion.h2>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan to accelerate your learning journey
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className={`relative backdrop-blur-xl border-2 h-full flex flex-col ${
                option.isPopular 
                  ? "bg-gradient-to-b from-purple-900/50 to-slate-900/50 border-purple-500/50" 
                  : "bg-slate-900/50 border-white/10"
              }`}>
                {option.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white mb-2">{option.title}</CardTitle>
                  <CardDescription className="text-gray-400">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      ${option.price}
                    </span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <ul className="space-y-3">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-gray-300">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          option.isPopular 
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400" 
                            : "bg-white/10 text-white"
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handlePurchase(option.price)}
                    className={`w-full py-6 text-lg ${
                      option.isPopular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/20"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 