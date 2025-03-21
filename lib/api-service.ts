export interface CodeReviewRequest {
  code: string
  language: string
}

export interface CodeReviewResponse {
  score: number
  summary: string
  feedback: {
    type: string // "roast" | "issue" | "suggestion" | "positive"
    message: string
  }[]
  metrics: {
    readability: number
    maintainability: number
    efficiency: number
    bestPractices: number
    security: number
  }
}

export async function reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
  try {
    // In a real implementation, this would use the AI SDK to generate the review
    // For now, we'll simulate a response

    // This is how you would use the AI SDK with OpenAI in a real implementation
    /*
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: "You are a code reviewer that provides sarcastic but helpful feedback. Your task is to analyze code and provide a JSON response with a score, summary, detailed feedback, and metrics.",
      prompt: `Review the following ${request.language} code:\n\n${request.code}\n\nProvide a JSON response with a score (0-100), summary, feedback array (with type and message), and metrics object (readability, maintainability, efficiency, bestPractices, security).`,
    })
    
    // Parse the JSON response
    return JSON.parse(text) as CodeReviewResponse
    */

    // For demo purposes, we'll return a mock response
    return mockReviewResponse()
  } catch (error) {
    console.error("Error reviewing code:", error)
    throw new Error("Failed to review code")
  }
}

function mockReviewResponse(): CodeReviewResponse {
  // Generate random scores
  const readability = Math.floor(Math.random() * 40) + 50
  const maintainability = Math.floor(Math.random() * 40) + 50
  const efficiency = Math.floor(Math.random() * 40) + 50
  const bestPractices = Math.floor(Math.random() * 40) + 50
  const security = Math.floor(Math.random() * 40) + 50

  const overallScore = Math.floor((readability + maintainability + efficiency + bestPractices + security) / 5)

  const roasts = [
    "Your variable names are so cryptic, even the NSA couldn't decode them. What's next, naming variables 'a', 'aa', 'aaa'?",
    "This code is more nested than a Russian doll collection. Have you heard of early returns?",
    "I've seen spaghetti more organized than this code. And I'm talking about the kind that's been dropped on the floor.",
    "Your comments are like UFOs - rare sightings that leave more questions than answers.",
    "This function is longer than a CVS receipt. Have you considered breaking it down?",
  ]

  const issues = [
    "You're not handling errors properly. Exceptions will crash your app faster than my enthusiasm for meetings on Monday mornings.",
    "Memory leaks here, there, and everywhere. Your RAM is crying for help.",
    "This code has more race conditions than a poorly organized marathon.",
    "Security vulnerabilities detected. It's like you left your front door open with a sign saying 'Hackers Welcome'.",
    "Performance bottlenecks found. This code runs slower than a turtle with a hangover.",
  ]

  const suggestions = [
    "Consider using async/await instead of nested callbacks. Your code is more nested than a Russian doll collection.",
    "Implement proper error handling. Try/catch blocks aren't just for decoration.",
    "Use meaningful variable names. Future you will thank present you.",
    "Add unit tests. They're like insurance - boring but necessary.",
    "Consider refactoring this into smaller functions. Your function is doing more things than a Swiss Army knife.",
  ]

  const positives = [
    "At least your code is consistent... consistently confusing, but consistent nonetheless.",
    "Your indentation is perfect. If only the logic matched the formatting.",
    "I appreciate your creative approach. It's wrong, but creative.",
    "Your comments are actually helpful. That's rare, like finding a unicorn in the wild.",
    "The code works, which is more than I can say for most submissions I review.",
  ]

  // Randomly select feedback items
  const feedback = [
    { type: "roast", message: roasts[Math.floor(Math.random() * roasts.length)] },
    { type: "issue", message: issues[Math.floor(Math.random() * issues.length)] },
    { type: "suggestion", message: suggestions[Math.floor(Math.random() * suggestions.length)] },
    { type: "positive", message: positives[Math.floor(Math.random() * positives.length)] },
  ]

  const summaries = [
    "This code looks like it was written by a sleep-deprived developer after their fifth cup of coffee. It works, but at what cost?",
    "Your code is like a mystery novel - intriguing, but unnecessarily complicated and with plot holes.",
    "If this code was a car, it would be a vintage model - charming, but inefficient and in need of serious maintenance.",
    "This code has potential, like a diamond in the rough. A very, very rough diamond that needs a lot of polishing.",
    "Your code is like fast food - it gets the job done, but nobody's proud of how it was made.",
  ]

  return {
    score: overallScore,
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    feedback,
    metrics: {
      readability,
      maintainability,
      efficiency,
      bestPractices,
      security,
    },
  }
}

