"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Check Your Email</h1>
          <p className="text-slate-600 mb-6">
            We've sent a confirmation link to your email address. Please click the link to verify your account and get
            started.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-700">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
          </div>

          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  )
}
