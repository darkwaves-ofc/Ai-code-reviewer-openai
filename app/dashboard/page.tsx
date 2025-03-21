"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Code2, Copy, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CodeReviewResult } from "@/components/code-review-result"
import { reviewCode, getRecentReviews } from "@/app/actions/code-review"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

export default function Dashboard() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isLoading, setIsLoading] = useState(false)
  const [reviewResult, setReviewResult] = useState<any>(null)
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Check for success parameter in URL (from Stripe checkout)
  useEffect(() => {
    if (searchParams?.get("success") === "true") {
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated.",
      })
    }

    if (searchParams?.get("canceled") === "true") {
      toast({
        title: "Payment canceled",
        description: "Your subscription has not been activated.",
        variant: "destructive",
      })
    }

    // Load user data
    const loadData = async () => {
      try {
        const [reviewsData, subscriptionData] = await Promise.all([getRecentReviews(), getUserSubscriptionPlan()])

        setRecentReviews(reviewsData)
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please enter some code to review.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("code", code)
      formData.append("language", language)

      const result = await reviewCode(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })

        if (result.upgradeRequired) {
          // Redirect to pricing page
          toast({
            title: "Upgrade Required",
            description: "Please upgrade your plan to continue.",
            variant: "destructive",
          })
        }
      } else if (result.success) {
        setReviewResult(result.review)

        // Refresh recent reviews
        const reviewsData = await getRecentReviews()
        setRecentReviews(reviewsData)
      }
    } catch (error) {
      console.error("Error reviewing code:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Code Review Dashboard</h1>

      {isLoadingData ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {subscription && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>
                  Your current plan: <span className="font-medium capitalize">{subscription.plan}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {subscription.plan === "free" ? (
                      <p>You have used {recentReviews.length} out of 10 free reviews this month.</p>
                    ) : (
                      <p>
                        Your subscription is {subscription.isSubscribed ? "active" : "inactive"}.
                        {subscription.isCanceled &&
                          " Your subscription will end at the end of the current billing period."}
                      </p>
                    )}
                  </div>
                  <div>
                    {subscription.plan === "free" ? (
                      <Link href="/pricing">
                        <Button>Upgrade Plan</Button>
                      </Link>
                    ) : (
                      <form action="/actions/stripe">
                        <Button type="submit" variant="outline">
                          Manage Subscription
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Submit Your Code</CardTitle>
                <CardDescription>
                  Paste your code below and our AI will roast it with sarcastic feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Tabs defaultValue="javascript" onValueChange={(value) => setLanguage(value)}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="java">Java</TabsTrigger>
                      <TabsTrigger value="csharp">C#</TabsTrigger>
                      <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                    <div className="relative">
                      <Textarea
                        placeholder="Paste your code here..."
                        className="min-h-[300px] font-mono text-sm"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleCopyCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </Tabs>
                  <div className="flex justify-between mt-4">
                    <Button type="button" variant="outline" onClick={() => setCode("")}>
                      Clear
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Review Code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-1">
              {reviewResult ? (
                <CodeReviewResult result={reviewResult} />
              ) : (
                <Card className="h-full flex flex-col justify-center items-center p-6 text-center">
                  <Code2 className="h-16 w-16 text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No Review Yet</CardTitle>
                  <CardDescription>
                    Submit your code to get a sarcastic AI review with helpful insights.
                  </CardDescription>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Recent Reviews</h2>
            <Card>
              <CardHeader>
                <CardTitle>Your Review History</CardTitle>
                <CardDescription>
                  {subscription?.plan === "free"
                    ? `You have used ${recentReviews.length} out of 10 free reviews this month.`
                    : "Your recent code reviews are shown below."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentReviews.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No reviews yet. Submit your first code for review!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{review.language} Review</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()} • Score: {review.score}/100
                          </p>
                        </div>
                        <Link href={`/dashboard/reviews/${review.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {recentReviews.length > 0 && (
                <CardFooter>
                  <Link href="/dashboard/reviews" className="w-full">
                    <Button variant="outline" className="w-full">
                      View All Reviews
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

