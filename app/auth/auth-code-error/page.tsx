"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Verification Error</h1>
          <p className="text-slate-600 mb-6">
            We encountered an error while verifying your email. This could be because:
          </p>

          <ul className="text-left text-slate-600 mb-6 space-y-2">
            <li>• The verification link has expired</li>
            <li>• The verification link has already been used</li>
            <li>• There was a technical issue with the verification process</li>
          </ul>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-700">
              Please try signing up again or contact support if the problem persists.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/signup">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}