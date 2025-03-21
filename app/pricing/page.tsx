"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"
import { createCheckoutSession } from "@/app/actions/stripe"

export default function PricingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check for canceled parameter in URL (from Stripe checkout)
  useEffect(() => {
    if (searchParams?.get("canceled") === "true") {
      toast({
        title: "Payment canceled",
        description: "Your subscription has not been activated.",
        variant: "destructive",
      })
    }

    // Load user subscription data
    const loadSubscription = async () => {
      try {
        const subscriptionData = await getUserSubscriptionPlan()
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Error loading subscription data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [searchParams, toast])

  const handleSubscribe = async (priceId: string) => {
    setIsSubmitting(priceId)

    try {
      const formData = new FormData()
      formData.append("priceId", priceId)

      await createCheckoutSession(formData)
      // Note: The server action will redirect to Stripe, so we don't need to handle the response here
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(null)
    }
  }

  const pricingPlans = [
    {
      id: "free",
      title: "Free",
      description: "Perfect for trying out the service",
      price: "0",
      priceId: "", // No price ID for free plan
      features: [
        "10 code reviews per month",
        "Basic code quality score",
        "24-hour response time",
        "Limited API access",
        "Community support",
      ],
      featured: false,
    },
    {
      id: "pro",
      title: "Pro",
      description: "For individual developers",
      price: "9.99",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      features: [
        "Unlimited code reviews",
        "Advanced code quality metrics",
        "API access",
        "1-hour response time",
        "Priority support",
        "Custom review templates",
      ],
      featured: true,
    },
    {
      id: "team",
      title: "Team",
      description: "For development teams",
      price: "29.99",
      priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Team dashboard",
        "Priority support",
        "Custom integrations",
        "Dedicated account manager",
      ],
      featured: false,
    },
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Choose the plan that works best for you and your team.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id
            const isUpgrading = isSubmitting === plan.priceId

            return (
              <Card key={plan.id} className={`flex flex-col ${plan.featured ? "border-primary shadow-lg" : ""}`}>
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.id === "free" ? (
                    <Button
                      className="w-full"
                      variant={plan.featured ? "default" : "outline"}
                      onClick={() => router.push("/dashboard")}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "Current Plan" : "Get Started"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.featured ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.priceId!)}
                      disabled={isCurrentPlan || isUpgrading || !plan.priceId}
                    >
                      {isCurrentPlan ? (
                        "Current Plan"
                      ) : isUpgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : subscription?.isSubscribed ? (
                        "Switch Plan"
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

const faqs = [
  {
    question: "How does the AI code review work?",
    answer:
      "Our AI analyzes your code using advanced machine learning models trained on millions of code samples. It identifies patterns, potential bugs, and style issues while providing feedback in a humorous, sarcastic tone that makes improving your code more enjoyable.",
  },
  {
    question: "Can I integrate the code reviewer with my CI/CD pipeline?",
    answer:
      "Yes! Pro and Team plans include API access that allows you to integrate our code review service directly into your CI/CD pipeline. This enables automatic code reviews on every commit or pull request.",
  },
  {
    question: "What programming languages are supported?",
    answer:
      "We currently support JavaScript, TypeScript, Python, Java, C#, Ruby, Go, PHP, and Swift. We're constantly adding support for more languages based on user feedback.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "You can upgrade, downgrade, or cancel your subscription at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the new plan will take effect at the start of your next billing cycle.",
  },
]

