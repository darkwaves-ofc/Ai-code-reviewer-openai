import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      if (session.subscription && session.customer) {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        // Get the price ID from the subscription
        const priceId = subscription.items.data[0].price.id

        // Determine the plan based on the price ID
        let plan = "free"
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = "pro"
        } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
          plan = "team"
        }

        // Update user subscription
        if (session.metadata?.userId) {
          await db.subscription.upsert({
            where: {
              userId: session.metadata.userId,
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              plan,
              status: subscription.status,
            },
            create: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              plan,
              status: subscription.status,
              userId: session.metadata.userId,
            },
          })
        }
      }
      break
    case "invoice.payment_succeeded":
      if (session.subscription) {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        // Update subscription end date
        await db.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
          },
        })
      }
      break
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const deletedSubscription = event.data.object as Stripe.Subscription

      await db.subscription.updateMany({
        where: {
          stripeSubscriptionId: deletedSubscription.id,
        },
        data: {
          status: "canceled",
          plan: "free",
          stripeSubscriptionId: null,
          stripePriceId: null,
        },
      })
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new NextResponse(null, { status: 200 })
}

