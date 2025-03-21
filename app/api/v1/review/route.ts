import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { db } from "@/lib/db"

// Initialize ModelsLab with your API key
const API_KEY = process.env.MODELS_LAB_API_KEY as string

function generateSystemPrompt(code: string, language: string) {
  return `
You are a code reviewer that provides sarcastic but helpful feedback. Your task is to analyze code and provide a JSON response with a score, summary, detailed feedback, and metrics.

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
IMPORTANT: Your response must be valid JSON that can be parsed with JSON.parse().
`
}

async function fetchFromModelsLab(messages: any[], maxTokens = 2000) {
  const response = await fetch("https://modelslab.com/api/v6/llm/uncensored_chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: API_KEY,
      messages: messages,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    throw new Error(`ModelsLab API error: ${response.status}`)
  }

  return response.json()
}

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

    // Generate code review using ModelsLab
    const systemPrompt = generateSystemPrompt(body.code, language)

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Please review this code and provide feedback in the JSON format specified." },
    ]

    const response = await fetchFromModelsLab(formattedMessages, 2000)

    // Parse the JSON response
    let reviewResult
    try {
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const content = response.message
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)

      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content
      reviewResult = JSON.parse(jsonString)

      // Validate the required fields
      if (!reviewResult.score || !reviewResult.summary || !reviewResult.feedback || !reviewResult.metrics) {
        throw new Error("Invalid response format")
      }
    } catch (parseError) {
      console.error("Error parsing ModelsLab response:", parseError)
      console.log("Raw response:", response.message)

      // Fallback to a default response
      reviewResult = {
        score: Math.floor(Math.random() * 40) + 50,
        summary: "This code could use some improvement, but the AI had trouble providing specific feedback.",
        feedback: [
          {
            type: "issue",
            message: "The AI couldn't properly analyze your code. Please try again or submit a simpler code sample.",
          },
        ],
        metrics: {
          readability: Math.floor(Math.random() * 40) + 50,
          maintainability: Math.floor(Math.random() * 40) + 50,
          efficiency: Math.floor(Math.random() * 40) + 50,
          bestPractices: Math.floor(Math.random() * 40) + 50,
          security: Math.floor(Math.random() * 40) + 50,
        },
      }
    }

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

