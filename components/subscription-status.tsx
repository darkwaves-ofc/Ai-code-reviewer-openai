"use client"

import { useRouter } from "next/navigation"
import { CalendarDays, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionButton } from "@/components/subscription-button"

interface SubscriptionStatusProps {
  subscription: {
    plan: string
    isSubscribed: boolean
    isCanceled: boolean
    endDate: string | null
  }
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const router = useRouter()

  const isPro = subscription.plan === "pro"
  const isTeam = subscription.plan === "team"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>
          Your current plan: <span className="font-medium capitalize">{subscription.plan}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {subscription.isSubscribed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Active subscription</span>
            </div>
            <span className="text-sm">{subscription.isSubscribed ? "Yes" : "No"}</span>
          </div>

          {subscription.isSubscribed && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {subscription.isCanceled ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span>Auto-renewal</span>
                </div>
                <span className="text-sm">{subscription.isCanceled ? "No" : "Yes"}</span>
              </div>

              {subscription.endDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <span>{subscription.isCanceled ? "Expires on" : "Next billing date"}</span>
                  </div>
                  <span className="text-sm">{new Date(subscription.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}

          {subscription.plan === "free" && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm">
                You are currently on the free plan with limited features. Upgrade to unlock unlimited code reviews, API
                access, and more.
              </p>
            </div>
          )}

          {subscription.isCanceled && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm">
                Your subscription has been canceled and will expire on{" "}
                {subscription.endDate && new Date(subscription.endDate).toLocaleDateString()}. You can reactivate your
                subscription before this date to maintain access.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {subscription.plan === "free" ? (
          <Button className="w-full" onClick={() => router.push("/pricing")}>
            Upgrade Plan
          </Button>
        ) : (
          <SubscriptionButton isSubscribed={subscription.isSubscribed} isPro={isPro} isTeam={isTeam} />
        )}
      </CardFooter>
    </Card>
  )
}

