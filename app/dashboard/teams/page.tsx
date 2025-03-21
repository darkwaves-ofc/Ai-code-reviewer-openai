"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Users, Loader2 } from "lucide-react"

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
import { getUserTeams, createTeam } from "@/app/actions/team"
import { getUserSubscriptionPlan } from "@/app/actions/stripe"

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, subscriptionData] = await Promise.all([getUserTeams(), getUserSubscriptionPlan()])

        setTeams(teamsData)
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Error loading teams data:", error)
        toast({
          title: "Error",
          description: "Failed to load teams data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createTeam(formData)

      if (result.error) {
        if (result.upgradeRequired) {
          toast({
            title: "Upgrade Required",
            description: "You need a team subscription to create a team.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: typeof result.error === "string" ? result.error : "Failed to create team.",
            variant: "destructive",
          })
        }
      } else if (result.success) {
        toast({
          title: "Team Created",
          description: "Your team has been created successfully.",
        })

        // Refresh teams list
        const teamsData = await getUserTeams()
        setTeams(teamsData)

        // Close dialog
        setDialogOpen(false)

        // Reset form
        e.currentTarget.reset()
      }
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Team</DialogTitle>
              <DialogDescription>Create a team to collaborate on code reviews with your colleagues.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input id="name" name="name" placeholder="Enter team name" required disabled={isCreating} />
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
                    "Create Team"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {subscription && subscription.plan !== "team" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Team Features</CardTitle>
                <CardDescription>Upgrade to the Team plan to create and manage teams.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>With the Team plan, you can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create multiple teams</li>
                  <li>Invite team members</li>
                  <li>Collaborate on code reviews</li>
                  <li>Share API access</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/pricing" className="w-full">
                  <Button className="w-full">Upgrade to Team Plan</Button>
                </Link>
              </CardFooter>
            </Card>
          )}

          {teams.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Teams Yet</CardTitle>
                <CardDescription>Create your first team to start collaborating on code reviews.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">You haven't created or joined any teams yet.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Team
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>
                      Role: <span className="capitalize">{team.role}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/dashboard/teams/${team.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Manage Team
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

