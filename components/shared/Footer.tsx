"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container px-4 py-8 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">ServiceHub</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-slate-600 hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-600 hover:text-blue-600">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-slate-600 hover:text-blue-600">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">For Customers</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-slate-600 hover:text-blue-600">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-slate-600 hover:text-blue-600">
                  Safety
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-600 hover:text-blue-600">
                  Services
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">For Providers</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/join" className="text-slate-600 hover:text-blue-600">
                  Join as Pro
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-slate-600 hover:text-blue-600">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-slate-600 hover:text-blue-600">
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-slate-600 hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-blue-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} ServiceHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}