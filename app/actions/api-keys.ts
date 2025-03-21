"use server"

import { z } from "zod"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

// Schema for API key creation validation
const createApiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
})

export async function createApiKey(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to create an API key",
    }
  }

  const name = formData.get("name") as string

  // Validate form data
  const validatedFields = createApiKeySchema.safeParse({
    name,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Check user's subscription
  const subscription = await getUserSubscriptionPlan()

  if (!subscription.isSubscribed) {
    return {
      error: "You need a Pro or Team subscription to create API keys",
      upgradeRequired: true,
    }
  }

  try {
    // Generate a unique API key
    const key = `acr_${nanoid(32)}`

    // Create the API key
    const apiKey = await db.apiKey.create({
      data: {
        key,
        name,
        userId: user.id,
      },
    })

    revalidatePath("/dashboard/api-keys")

    return {
      success: true,
      apiKey: {
        ...apiKey,
        key, // Include the key in the response so it can be shown to the user
      },
    }
  } catch (error) {
    console.error("Error creating API key:", error)
    return {
      error: "Failed to create API key. Please try again.",
    }
  }
}

export async function deleteApiKey(id: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to delete an API key",
    }
  }

  try {
    // Check if the API key belongs to the user
    const apiKey = await db.apiKey.findUnique({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!apiKey) {
      return {
        error: "API key not found",
      }
    }

    // Delete the API key
    await db.apiKey.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/api-keys")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting API key:", error)
    return {
      error: "Failed to delete API key. Please try again.",
    }
  }
}

export async function getUserApiKeys() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const apiKeys = await db.apiKey.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsed: true,
    },
  })

  return apiKeys
}

