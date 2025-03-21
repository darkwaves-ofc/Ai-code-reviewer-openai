"use server"
import { redirect } from "next/navigation"
import Stripe from "stripe"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Pricing plan IDs from Stripe
const PLANS = {
  free: "",
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  team: process.env.STRIPE_TEAM_PRICE_ID!,
}

export async function createCheckoutSession(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to subscribe",
    }
  }

  const priceId = formData.get("priceId") as string

  if (!priceId) {
    return {
      error: "Invalid price ID",
    }
  }

  // Get or create customer
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      subscription: true,
    },
  })

  if (!dbUser) {
    return {
      error: "User not found",
    }
  }

  let customerId = dbUser.subscription?.stripeCustomerId

  if (!customerId || customerId.startsWith("cus_free_")) {
    // Create a new customer
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.name!,
      metadata: {
        userId: user.id,
      },
    })

    customerId = customer.id

    // Update or create subscription record
    if (dbUser.subscription) {
      await db.subscription.update({
        where: {
          id: dbUser.subscription.id,
        },
        data: {
          stripeCustomerId: customerId,
        },
      })
    } else {
      await db.subscription.create({
        data: {
          stripeCustomerId: customerId,
          userId: user.id,
          plan: "free",
        },
      })
    }
  }

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId: user.id,
    },
  })

  if (!checkoutSession.url) {
    return {
      error: "Error creating checkout session",
    }
  }

  redirect(checkoutSession.url)
}

export async function createBillingPortalSession() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to manage your subscription",
    }
  }

  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      subscription: true,
    },
  })

  if (!dbUser?.subscription?.stripeCustomerId || dbUser.subscription.stripeCustomerId.startsWith("cus_free_")) {
    return {
      error: "You don't have an active subscription",
    }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  redirect(session.url)
}

export async function getUserSubscriptionPlan() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      plan: "free",
      isSubscribed: false,
      isCanceled: false,
      endDate: null,
    }
  }

  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      subscription: true,
    },
  })

  if (!dbUser?.subscription) {
    return {
      plan: "free",
      isSubscribed: false,
      isCanceled: false,
      endDate: null,
    }
  }

  const { plan, status, stripeCurrentPeriodEnd, stripeSubscriptionId } = dbUser.subscription

  // Check if subscription is active
  const isSubscribed = plan !== "free" && status === "active"

  // Check if subscription is canceled
  let isCanceled = false

  if (isSubscribed && stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    isCanceled = stripeSub.cancel_at_period_end
  }

  return {
    plan,
    isSubscribed,
    isCanceled,
    endDate: stripeCurrentPeriodEnd,
  }
}

