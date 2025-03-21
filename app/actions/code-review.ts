"use server"

import { z } from "zod"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

// Schema for code review validation
const codeReviewSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
})

export async function reviewCode(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "You must be logged in to review code",
    }
  }

  const code = formData.get("code") as string
  const language = formData.get("language") as string

  // Validate form data
  const validatedFields = codeReviewSchema.safeParse({
    code,
    language,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Check user's subscription and review limits
  const subscription = await getUserSubscriptionPlan()

  if (subscription.plan === "free") {
    // Check if user has reached the free review limit (10 per month)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const reviewCount = await db.codeReview.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentMonth,
        },
      },
    })

    if (reviewCount >= 10) {
      return {
        error: "You've reached your monthly limit of 10 free reviews. Please upgrade to continue.",
        upgradeRequired: true,
      }
    }
  }

  try {
    // Generate code review using OpenAI
    const prompt = `
      Review the following ${language} code:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Provide a JSON response with the following structure:
      {
        "score": number, // 0-100 overall code quality score
        "summary": string, // A sarcastic but helpful summary of the code
        "feedback": [ // Array of feedback items
          {
            "type": string, // "roast", "issue", "suggestion", or "positive"
            "message": string // The feedback message
          }
        ],
        "metrics": { // Object with code quality metrics
          "readability": number, // 0-100
          "maintainability": number, // 0-100
          "efficiency": number, // 0-100
          "bestPractices": number, // 0-100
          "security": number // 0-100
        }
      }
      
      Make the review sarcastic and funny, but also provide genuinely helpful feedback.
      Be critical but fair, and include at least one positive aspect of the code.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system:
        "You are a code reviewer that provides sarcastic but helpful feedback. Your task is to analyze code and provide a JSON response with a score, summary, detailed feedback, and metrics.",
      prompt,
    })

    // Parse the JSON response
    const reviewResult = JSON.parse(text)

    // Save the review to the database
    const savedReview = await db.codeReview.create({
      data: {
        code,
        language,
        score: reviewResult.score,
        summary: reviewResult.summary,
        feedback: reviewResult.feedback,
        metrics: reviewResult.metrics,
        userId: user.id,
      },
    })

    return {
      success: true,
      review: {
        id: savedReview.id,
        ...reviewResult,
      },
    }
  } catch (error) {
    console.error("Error reviewing code:", error)
    return {
      error: "Failed to review code. Please try again.",
    }
  }
}

export async function getRecentReviews(limit = 5) {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const reviews = await db.codeReview.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })

  return reviews
}

export async function getReviewById(id: string) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const review = await db.codeReview.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })

  return review
}

