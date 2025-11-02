'use client'

import { useState, useEffect, useMemo, useCallback } from "react"

import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Navbar from "@/components/shared/Navbar"
import Sidebar from "@/components/shared/Sidebar"
import Footer from "@/components/shared/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LifeBuoy, MessageCircle, Phone, Mail, ArrowRight, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react"

const fallbackTickets = [
  {
    id: "TCK-1024",
    subject: "Issue with recent booking",
    category: "bookings",
    status: "open",
    priority: "high",
    updated_at: "2024-05-12T08:30:00.000Z",
    reference_code: "BK-4831",
  },
  {
    id: "TCK-1019",
    subject: "Payment receipt clarification",
    category: "billing",
    status: "pending",
    priority: "medium",
    updated_at: "2024-05-08T14:10:00.000Z",
    reference_code: "INV-9023",
  },
  {
    id: "TCK-0987",
    subject: "Service provider feedback",
    category: "feedback",
    status: "resolved",
    priority: "low",
    updated_at: "2024-04-28T09:45:00.000Z",
    reference_code: "REV-2210",
  },
]

const fallbackFaqs = [
  {
    question: "How do I reschedule a booking?",
    answer: "Open your booking details from the My Bookings page and select Reschedule. Choose a new date and confirm the change."
  },
  {
    question: "Where can I download invoices?",
    answer: "Invoices are available under Billing History in your profile. Select the invoice and choose Download PDF."
  },
  {
    question: "How do I rate a completed service?",
    answer: "After a service is marked completed, visit the booking detail page and select Leave review to submit your feedback."
  },
  {
    question: "What if the provider does not arrive?",
    answer: "Contact us via live chat or call support immediately. We will coordinate with the provider and offer alternatives if required."
  },
]

const fallbackGuides = [
  {
    title: "Managing your bookings",
    summary: "Step-by-step instructions to create, update, and cancel bookings without additional charges.",
    link: "#"
  },
  {
    title: "Understanding service guarantees",
    summary: "Learn about our satisfaction policy, protection plans, and the resolution process for disputes.",
    link: "#"
  },
  {
    title: "Payments and refunds",
    summary: "Everything you need to know about accepted payment methods, billing cycles, and refund timelines.",
    link: "#"
  },
]

const sanitizeTicket = (ticket: any, index: number) => {
  const status = ticket?.status?.toLowerCase?.() ?? fallbackTickets[index % fallbackTickets.length].status
  const priority = ticket?.priority?.toLowerCase?.() ?? fallbackTickets[index % fallbackTickets.length].priority
  return {
    id: ticket?.id ?? `support-${index}`,
    subject: ticket?.subject ?? "Support request",
    category: ticket?.category ?? "general",
    status,
    priority,
    updated_at: ticket?.updated_at ?? new Date().toISOString(),
    reference_code: ticket?.reference_code ?? ticket?.reference ?? "",
  }
}

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
}

const priorityStyles: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-purple-100 text-purple-700",
  low: "bg-slate-100 text-slate-700",
}

const formatStatus = (value: string) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")

export default function CustomerSupportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState(fallbackTickets.map((ticket, index) => sanitizeTicket(ticket, index)))
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        const currentUser = data?.user
        if (!currentUser) {
          router.push("/auth/login")
          return
        }
        setUser(currentUser)
        const { data: records, error } = await supabase
          .from("support_tickets")
          .select("id, subject, category, status, priority, updated_at, reference_code")
          .eq("customer_id", currentUser.id)
          .order("updated_at", { ascending: false })
        if (error) {
          throw error
        }
        if (records && records.length > 0) {
          setTickets(records.map(sanitizeTicket))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.warn("Failed to load support data", message)
        toast.error("Unable to load support history")
        setTickets(fallbackTickets.map((ticket, index) => sanitizeTicket(ticket, index)))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const metrics = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((ticket) => ticket.status === "open").length
    const pending = tickets.filter((ticket) => ticket.status === "pending").length
    const resolved = tickets.filter((ticket) => ticket.status === "resolved").length
    return { total, open, pending, resolved }
  }, [tickets])

  const visibleTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      if (!matchesStatus) {
        return false
      }
      if (!normalizedSearch) {
        return true
      }
      const content = `${ticket.subject} ${ticket.category} ${ticket.reference_code}`.toLowerCase()
      return content.includes(normalizedSearch)
    })
  }, [tickets, statusFilter, searchTerm])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.subject.trim() || !formState.message.trim()) {
      toast.error("Please complete all required fields")
      return
    }
    if (!user) {
      toast.error("Please sign in to submit a request")
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const payload = {
        customer_id: user.id,
        subject: formState.subject.trim(),
        category: formState.category,
        priority: formState.priority,
        message: formState.message.trim(),
        status: "open",
      }
      const { data, error } = await supabase
        .from("support_tickets")
        .insert(payload)
        .select("id, subject, category, status, priority, updated_at, reference_code")
        .single()
      if (error) {
        throw error
      }
      const sanitized = sanitizeTicket(data, 0)
      setTickets((previous) => [sanitized, ...previous])
      setFormState({ subject: "", category: "general", priority: "medium", message: "" })
      toast.success("Support request submitted")
    } catch (error) {
      console.error("Failed to submit support request", error)
      toast.error("Unable to submit support request")
    } finally {
      setSubmitting(false)
    }
  }, [formState, user])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-lg text-slate-600">Loading support...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userType="customer" />
      <div className="flex flex-1">
        <Sidebar userType="customer" />
        <main className="flex-1 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <Card className="border-blue-200 bg-white">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge variant="outline" className="mb-2 w-fit border-blue-200 text-blue-700">
                    Customer support
                  </Badge>
                  <CardTitle className="text-3xl text-slate-900">How can we help you today?</CardTitle>
                  <CardDescription className="text-slate-600">
                    Reach out to our support specialists, explore quick answers, or check the status of your open requests.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" className="justify-center" onClick={() => router.push("/customer/bookings")}>
                    View bookings
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" onClick={() => router.push("/services")}>
                    Browse services
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-800">Open requests</CardTitle>
                        <CardDescription className="text-2xl font-semibold text-slate-900">{metrics.open}</CardDescription>
                      </div>
                      <LifeBuoy className="h-6 w-6 text-blue-600" />
                    </CardHeader>
                  </Card>
                  <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-800">Pending updates</CardTitle>
                        <CardDescription className="text-2xl font-semibold text-slate-900">{metrics.pending}</CardDescription>
                      </div>
                      <Clock className="h-6 w-6 text-amber-600" />
                    </CardHeader>
                  </Card>
                  <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-800">Resolved</CardTitle>
                        <CardDescription className="text-2xl font-semibold text-slate-900">{metrics.resolved}</CardDescription>
                      </div>
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </CardHeader>
                  </Card>
                  <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-800">Total requests</CardTitle>
                        <CardDescription className="text-2xl font-semibold text-slate-900">{metrics.total}</CardDescription>
                      </div>
                      <FileText className="h-6 w-6 text-slate-600" />
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card className="border-slate-200">
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl text-slate-900">Support history</CardTitle>
                      <CardDescription className="text-slate-600">Track the progress of your assistance requests and reference follow-ups.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        placeholder="Search by subject or reference"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full sm:w-64"
                      />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-44">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {visibleTickets.length > 0 ? (
                      visibleTickets.map((ticket) => (
                        <Card key={ticket.id} className="border-slate-200">
                          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg text-slate-900">{ticket.subject}</CardTitle>
                              <CardDescription className="text-sm text-slate-600">Updated {new Date(ticket.updated_at).toLocaleString()}</CardDescription>
                              <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                                <span>Category: {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</span>
                                {ticket.reference_code && <span>Reference: {ticket.reference_code}</span>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={statusStyles[ticket.status] ?? "bg-slate-100 text-slate-600"}>{formatStatus(ticket.status)}</Badge>
                              <Badge className={priorityStyles[ticket.priority] ?? "bg-slate-100 text-slate-600"}>{formatStatus(ticket.priority)}</Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <Card className="border-dashed border-2 border-slate-200 p-12 text-center text-slate-600">
                        No support requests match your filters
                      </Card>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-900">Frequently asked questions</CardTitle>
                    <CardDescription className="text-slate-600">Find quick answers before creating a new request.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {fallbackFaqs.map((faq, index) => (
                        <AccordionItem key={faq.question} value={`faq-${index}`}>
                          <AccordionTrigger className="text-left text-base text-slate-800">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-900">Submit a request</CardTitle>
                    <CardDescription className="text-slate-600">Share the details and our specialists will respond shortly.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Subject</label>
                        <Input
                          value={formState.subject}
                          onChange={(event) => setFormState((previous) => ({ ...previous, subject: event.target.value }))}
                          placeholder="Brief summary of your issue"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Category</label>
                          <Select
                            value={formState.category}
                            onValueChange={(value) => setFormState((previous) => ({ ...previous, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="bookings">Bookings</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Priority</label>
                          <Select
                            value={formState.priority}
                            onValueChange={(value) => setFormState((previous) => ({ ...previous, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Describe your issue</label>
                        <Textarea
                          value={formState.message}
                          onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
                          placeholder="Include as many details as possible to help us assist you faster"
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-900">Contact options</CardTitle>
                    <CardDescription className="text-slate-600">Prefer a direct conversation? Reach us instantly.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">Live chat support</p>
                        <p className="text-sm text-slate-600">Available daily from 8 AM to 10 PM IST for quick assistance.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                      <Phone className="h-6 w-6 text-emerald-600" />
                      <div>
                        <p className="font-medium text-slate-900">Call us at +91 80471 21110</p>
                        <p className="text-sm text-slate-600">Priority help for urgent booking issues and safety concerns.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                      <Mail className="h-6 w-6 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-900">support@servicehub.com</p>
                        <p className="text-sm text-slate-600">Expect a response within 12 business hours.</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full justify-center gap-2" onClick={() => router.push("/customer/profile")}>
                      Manage account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-900">Guides and policies</CardTitle>
                    <CardDescription className="text-slate-600">Stay informed with detailed walkthroughs and policy updates.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fallbackGuides.map((guide) => (
                      <button
                        key={guide.title}
                        type="button"
                        className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <p className="font-semibold text-slate-900">{guide.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{guide.summary}</p>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
