import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  IdentificationCard, 
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  Building,
  FileText,
  Upload
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface ManageCredentialsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function ManageCredentialsPage({ user, onNavigate }: ManageCredentialsPageProps) {
  const credentials = [
    { 
      id: 1, 
      type: "Insurance", 
      name: "General Liability Insurance", 
      provider: "ABC Insurance Co.", 
      policyNumber: "GL-123456", 
      expiryDate: "2025-06-30", 
      status: "active",
      verified: true
    },
    { 
      id: 2, 
      type: "Bond", 
      name: "Surety Bond", 
      provider: "XYZ Bonding", 
      policyNumber: "SB-789012", 
      expiryDate: "2025-12-31", 
      status: "active",
      verified: true
    },
    { 
      id: 3, 
      type: "License", 
      name: "Business License", 
      provider: "City of Downtown", 
      policyNumber: "BL-345678", 
      expiryDate: "2025-03-15", 
      status: "active",
      verified: false
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black dark:bg-white">
                <IdentificationCard size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Manage Credentials</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  Keep track of insurance, bonds, licenses, and other credentials
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              Add Credential
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Credentials</p>
              <p className="text-2xl font-bold text-black dark:text-white">{credentials.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Verified</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {credentials.filter(c => c.verified).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Expiring Soon</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">1</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Compliance Score</p>
              <p className="text-2xl font-bold text-primary">95%</p>
            </CardContent>
          </Card>
        </div>

        {/* Credentials List */}
        <div className="space-y-4">
          {credentials.map((cred) => (
            <Card key={cred.id} className="border-2 border-transparent dark:border-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-black dark:text-white">{cred.name}</h3>
                          {cred.verified && (
                            <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                              <CheckCircle size={12} className="mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-black/60 dark:text-white/60 mb-1">Provider: {cred.provider}</p>
                        <p className="text-sm text-black/60 dark:text-white/60">Policy #: {cred.policyNumber}</p>
                      </div>
                      <Badge variant="outline" className="border-transparent dark:border-white">
                        {cred.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>Expires: {cred.expiryDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/60 dark:text-white/60">
                        <Building size={16} />
                        <span>{cred.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Details
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      <Upload size={16} className="mr-2" />
                      Upload Document
                    </Button>
                    {!cred.verified && (
                      <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        Verify Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
