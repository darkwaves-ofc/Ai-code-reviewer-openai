"use client"

import { AlertCircle, Copy, Info, Lightbulb, ThumbsUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CodeMetricsChart } from "@/components/code-metrics-chart"

interface CodeReviewResultProps {
  result: {
    score: number
    summary: string
    feedback: {
      type: string
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
}

export function CodeReviewResult({ result }: CodeReviewResultProps) {
  const { toast } = useToast()

  const handleCopyFeedback = () => {
    const feedbackText = `
Code Review Summary:
${result.summary}

Overall Score: ${result.score}/100

Detailed Feedback:
${result.feedback.map((item) => `- ${item.message}`).join("\n")}

Metrics:
- Readability: ${result.metrics.readability}/100
- Maintainability: ${result.metrics.maintainability}/100
- Efficiency: ${result.metrics.efficiency}/100
- Best Practices: ${result.metrics.bestPractices}/100
- Security: ${result.metrics.security}/100
    `.trim()

    navigator.clipboard.writeText(feedbackText)
    toast({
      title: "Copied!",
      description: "Review feedback copied to clipboard",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "roast":
        return <Info className="h-5 w-5 text-blue-500" />
      case "issue":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case "positive":
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Code Review Results</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCopyFeedback}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>AI-generated review with sarcastic feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Overall Score</h3>
            <p className="text-sm text-muted-foreground">Based on code quality metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}</div>
            <div className="text-xl text-muted-foreground">/100</div>
          </div>
        </div>

        <Progress value={result.score} className="h-2" indicatorClassName={getScoreBackground(result.score)} />

        {/* Summary */}
        <Alert>
          <AlertTitle>Summary</AlertTitle>
          <AlertDescription>{result.summary}</AlertDescription>
        </Alert>

        {/* Feedback */}
        <div>
          <h3 className="text-lg font-medium mb-3">Detailed Feedback</h3>
          <div className="space-y-3">
            {result.feedback.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 border rounded-lg">
                {getFeedbackIcon(item.type)}
                <div>{item.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Chart */}
        <div>
          <h3 className="text-lg font-medium mb-3">Code Metrics</h3>
          <div className="h-[300px]">
            <CodeMetricsChart metrics={result.metrics} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

