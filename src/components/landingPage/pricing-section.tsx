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
    <section className="py-24 bg-white border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Pricing Plans</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your learning journey
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {pricingOptions.map((option) => (
            <Card className={`relative border h-full flex flex-col ${option.isPopular ? 'border-primary' : ''}`}> 
              {option.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground mb-2">{option.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">
                    ${option.price}
                  </span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <ul className="space-y-3">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-foreground">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${option.isPopular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}> 
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
                  className={`w-full py-4 text-base ${option.isPopular ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted text-foreground hover:bg-primary/10'}`}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}; 