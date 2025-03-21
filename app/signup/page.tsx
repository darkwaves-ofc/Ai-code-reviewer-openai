"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Github } from "lucide-react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { signup } from "@/app/actions/auth"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Record<string, string[]> | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)

      if (result.error._form) {
        toast({
          title: "Signup failed",
          description: result.error._form[0],
          variant: "destructive",
        })
      }
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An error occurred during signup. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>Create an account to get started with AI Code Reviewer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin("github")}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
              >
                Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" type="text" required disabled={isLoading} />
                  {error?.name && <p className="text-sm text-destructive">{error.name[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isLoading}
                  />
                  {error?.email && <p className="text-sm text-destructive">{error.email[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required disabled={isLoading} />
                  {error?.password && <p className="text-sm text-destructive">{error.password[0]}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" name="terms" required />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                      privacy policy
                    </Link>
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

