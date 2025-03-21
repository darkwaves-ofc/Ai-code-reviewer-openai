"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CreditCard, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { SubscriptionStatus } from "@/components/subscription-status"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
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
  }, [toast])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {subscription && <SubscriptionStatus subscription={subscription} />}

          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison</CardTitle>
              <CardDescription>Compare the features of our different plans.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Feature</th>
                      <th className="text-center py-3 px-2">Free</th>
                      <th className="text-center py-3 px-2">Pro</th>
                      <th className="text-center py-3 px-2">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2">Code Reviews</td>
                      <td className="text-center py-3 px-2">10/month</td>
                      <td className="text-center py-3 px-2">Unlimited</td>
                      <td className="text-center py-3 px-2">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">API Access</td>
                      <td className="text-center py-3 px-2">Limited</td>
                      <td className="text-center py-3 px-2">Full</td>
                      <td className="text-center py-3 px-2">Full</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">Team Members</td>
                      <td className="text-center py-3 px-2">1</td>
                      <td className="text-center py-3 px-2">1</td>
                      <td className="text-center py-3 px-2">Up to 5</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">Response Time</td>
                      <td className="text-center py-3 px-2">24 hours</td>
                      <td className="text-center py-3 px-2">1 hour</td>
                      <td className="text-center py-3 px-2">1 hour</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">Support</td>
                      <td className="text-center py-3 px-2">Community</td>
                      <td className="text-center py-3 px-2">Priority</td>
                      <td className="text-center py-3 px-2">Dedicated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/pricing" className="w-full">
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Pricing Plans
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payment history.</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.isSubscribed ? (
                <p className="text-sm text-muted-foreground">
                  Your billing history is available in the Stripe customer portal. Click the button below to access your
                  invoices and payment methods.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You don't have any billing history yet. Subscribe to a paid plan to view your invoices here.
                </p>
              )}
            </CardContent>
            {subscription?.isSubscribed && (
              <CardFooter>
                <form action="/actions/stripe">
                  <Button type="submit" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                  </Button>
                </form>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

