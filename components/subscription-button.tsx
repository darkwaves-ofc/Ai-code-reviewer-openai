"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createBillingPortalSession } from "@/app/actions/stripe"

interface SubscriptionButtonProps {
  isSubscribed: boolean
  isPro: boolean
  isTeam: boolean
}

export function SubscriptionButton({ isSubscribed, isPro, isTeam }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscription = async () => {
    setIsLoading(true)

    try {
      if (isSubscribed) {
        // Manage existing subscription
        await createBillingPortalSession()
        // Note: The server action will redirect to Stripe
      } else {
        // Redirect to pricing page
        router.push("/pricing")
      }
    } catch (error) {
      console.error("Error managing subscription:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscription} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : isSubscribed ? (
        "Manage Subscription"
      ) : (
        "Upgrade"
      )}
    </Button>
  )
}

