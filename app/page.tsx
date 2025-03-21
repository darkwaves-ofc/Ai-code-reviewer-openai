import Link from "next/link"
import { ArrowRight, Code2, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                AI Code Reviewer
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Get your code roasted by AI with sarcastic, funny, and actually useful feedback.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button className="px-8">
                  Try for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need to improve your code with a touch of humor.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Pricing</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Choose the plan that works best for you and your team.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
            {pricingPlans.map((plan) => (
              <Card key={plan.title} className={`flex flex-col ${plan.featured ? "border-primary shadow-lg" : ""}`}>
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Star className="mr-2 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.featured ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-background border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6" />
              <span className="text-lg font-bold">AI Code Reviewer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Code Reviewer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "AI-Powered Reviews",
    description: "Get detailed code reviews with sarcastic and funny feedback from our AI.",
    icon: Code2,
  },
  {
    title: "Code Quality Score",
    description: "Receive a numerical rating and visual charts showing your code's strengths and weaknesses.",
    icon: Star,
  },
  {
    title: "API Access",
    description: "Integrate code reviews directly into your CI/CD pipeline with our API.",
    icon: ArrowRight,
  },
]

const pricingPlans = [
  {
    title: "Free",
    price: "0",
    features: ["10 code reviews per month", "Basic code quality score", "24-hour response time"],
    featured: false,
  },
  {
    title: "Pro",
    price: "9.99",
    features: ["Unlimited code reviews", "Advanced code quality metrics", "API access", "1-hour response time"],
    featured: true,
  },
  {
    title: "Team",
    price: "29.99",
    features: ["Everything in Pro", "Up to 5 team members", "Team dashboard", "Priority support"],
    featured: false,
  },
]

