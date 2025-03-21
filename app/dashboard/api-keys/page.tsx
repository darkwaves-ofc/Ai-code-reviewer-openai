"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Key, Plus, Trash2, Loader2, Copy, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getUserApiKeys, createApiKey, deleteApiKey } from "@/app/actions/api-keys"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apiKeysData, subscriptionData] = await Promise.all([getUserApiKeys(), getUserSubscriptionPlan()])

        setApiKeys(apiKeysData)
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Error loading API keys data:", error)
        toast({
          title: "Error",
          description: "Failed to load API keys data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleCreateApiKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createApiKey(formData)

      if (result.error) {
        if (result.upgradeRequired) {
          toast({
            title: "Upgrade Required",
            description: "You need a Pro or Team subscription to create API keys.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: typeof result.error === "string" ? result.error : "Failed to create API key.",
            variant: "destructive",
          })
        }
      } else if (result.success) {
        toast({
          title: "API Key Created",
          description: "Your API key has been created successfully.",
        })

        // Store the new API key to display it
        setNewApiKey(result.apiKey.key)

        // Refresh API keys list
        const apiKeysData = await getUserApiKeys()
        setApiKeys(apiKeysData)

        // Reset form
        e.currentTarget.reset()
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    try {
      const result = await deleteApiKey(id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "API Key Deleted",
          description: "Your API key has been deleted successfully.",
        })

        // Refresh API keys list
        const apiKeysData = await getUserApiKeys()
        setApiKeys(apiKeysData)
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyApiKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey)
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      })
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Keys</h1>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setNewApiKey(null)
              setShowApiKey(false)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New API Key</DialogTitle>
              <DialogDescription>Create an API key to access the AI Code Reviewer API.</DialogDescription>
            </DialogHeader>
            {newApiKey ? (
              <div className="py-4">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Your API Key</p>
                  <div className="relative">
                    <Input
                      value={newApiKey}
                      readOnly
                      type={showApiKey ? "text" : "password"}
                      className="pr-20 font-mono"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyApiKey}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setNewApiKey(null)
                      setDialogOpen(false)
                    }}
                    className="w-full"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">API Key Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter a name for this API key"
                      required
                      disabled={isCreating}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create API Key"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {subscription && !subscription.isSubscribed && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Upgrade to the Pro or Team plan to access the API.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>With API access, you can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Integrate code reviews into your CI/CD pipeline</li>
                  <li>Automate code quality checks</li>
                  <li>Build custom integrations</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/pricing" className="w-full">
                  <Button className="w-full">Upgrade to Pro</Button>
                </Link>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>Manage your API keys for accessing the AI Code Reviewer API.</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Key className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">You haven't created any API keys yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        title="Delete API Key"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {apiKeys.length > 0 && (
              <CardFooter>
                <div className="w-full">
                  <h3 className="font-medium mb-2">API Usage Example</h3>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                      {`curl -X POST https://your-domain.com/api/v1/review \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "function example() { return true; }", "language": "javascript"}'`}
                    </pre>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

