import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Get API key from Authorization header
    const authHeader = (await headers()).get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.split("Bearer ")[1]

    // Validate API key
    const dbApiKey = await db.apiKey.findUnique({
      where: {
        key: apiKey,
      },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!dbApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Check if user has an active subscription
    if (
      !dbApiKey.user.subscription ||
      dbApiKey.user.subscription.status !== "active" ||
      dbApiKey.user.subscription.plan === "free"
    ) {
      return NextResponse.json({ error: "API access requires an active Pro or Team subscription" }, { status: 403 })
    }

    // Update last used timestamp
    await db.apiKey.update({
      where: {
        id: dbApiKey.id,
      },
      data: {
        lastUsed: new Date(),
      },
    })

    // Parse request body
    const body = await req.json()

    // Validate request
    if (!body.code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const language = body.language || "javascript"

    // Generate code review using OpenAI
    const prompt = `
      Review the following ${language} code:
      
      \`\`\`${language}
      ${body.code}
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
    await db.codeReview.create({
      data: {
        code: body.code,
        language,
        score: reviewResult.score,
        summary: reviewResult.summary,
        feedback: reviewResult.feedback,
        metrics: reviewResult.metrics,
        userId: dbApiKey.user.id,
      },
    })

    return NextResponse.json(reviewResult)
  } catch (error) {
    console.error("Error in API review:", error)
    return NextResponse.json({ error: "Failed to process code review" }, { status: 500 })
  }
}

