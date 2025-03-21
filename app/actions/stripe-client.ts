"use client"

import { createCheckoutSession, createBillingPortalSession } from "@/app/actions/stripe"

export async function handleSubscribe(priceId: string) {
  const formData = new FormData()
  formData.append("priceId", priceId)

  return createCheckoutSession(formData)
}

export async function handleManageBilling() {
  return createBillingPortalSession()
}

