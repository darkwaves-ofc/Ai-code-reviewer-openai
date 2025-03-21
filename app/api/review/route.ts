import { type NextRequest, NextResponse } from "next/server"
import { reviewCode, type CodeReviewRequest } from "@/lib/api-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!body.code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const reviewRequest: CodeReviewRequest = {
      code: body.code,
      language: body.language || "javascript",
    }

    const result = await reviewCode(reviewRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in review API:", error)
    return NextResponse.json({ error: "Failed to process code review" }, { status: 500 })
  }
}

