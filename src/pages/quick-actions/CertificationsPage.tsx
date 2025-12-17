import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Certificate, 
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  FileText
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface CertificationsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function CertificationsPage({ user, onNavigate }: CertificationsPageProps) {
  const certifications = [
    { 
      id: 1, 
      name: "Licensed Electrician", 
      issuer: "State Board", 
      number: "EL-12345", 
      issueDate: "2020-01-15", 
      expiryDate: "2025-01-15", 
      status: "active",
      daysUntilExpiry: 15
    },
    { 
      id: 2, 
      name: "HVAC Certification", 
      issuer: "NATE", 
      number: "HV-67890", 
      issueDate: "2021-03-20", 
      expiryDate: "2026-03-20", 
      status: "active",
      daysUntilExpiry: 420
    },
    { 
      id: 3, 
      name: "General Contractor License", 
      issuer: "State Licensing Board", 
      number: "GC-11111", 
      issueDate: "2019-06-10", 
      expiryDate: "2024-06-10", 
      status: "expired",
      daysUntilExpiry: -180
    },
    { 
      id: 4, 
      name: "OSHA 30-Hour", 
      issuer: "OSHA", 
      number: "OS-22222", 
      issueDate: "2022-08-05", 
      expiryDate: "2025-08-05", 
      status: "active",
      daysUntilExpiry: 200
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
                <Certificate size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Certifications</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  Manage your professional credentials and licenses
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              Add Certification
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Certifications</p>
              <p className="text-2xl font-bold text-black dark:text-white">{certifications.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {certifications.filter(c => c.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Expiring Soon</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {certifications.filter(c => c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Expired</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {certifications.filter(c => c.status === 'expired').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Certifications List */}
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card 
              key={cert.id} 
              className={cert.daysUntilExpiry > 0 && cert.daysUntilExpiry <= 30 
                ? "border-2 border-amber-500 dark:border-amber-400" 
                : cert.status === 'expired'
                ? "border-2 border-red-500 dark:border-red-400"
                : "border-2 border-transparent dark:border-white"
              }
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-1">{cert.name}</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">Issuer: {cert.issuer}</p>
                        <p className="text-sm text-black/60 dark:text-white/60">License #: {cert.number}</p>
                      </div>
                      <Badge 
                        variant={cert.status === 'active' ? 'default' : 'destructive'}
                        className={cert.status === 'active' 
                          ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300" 
                          : "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300"
                        }
                      >
                        {cert.status === 'active' ? (
                          <CheckCircle size={12} className="mr-1" />
                        ) : (
                          <Clock size={12} className="mr-1" />
                        )}
                        {cert.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>Issued: {cert.issueDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>Expires: {cert.expiryDate}</span>
                      </div>
                    </div>
                    {cert.daysUntilExpiry > 0 && cert.daysUntilExpiry <= 30 && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          ⚠️ Expires in {cert.daysUntilExpiry} days
                        </p>
                      </div>
                    )}
                    {cert.status === 'expired' && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                          ⚠️ This certification has expired
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Details
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      <FileText size={16} className="mr-2" />
                      Download PDF
                    </Button>
                    {cert.daysUntilExpiry > 0 && cert.daysUntilExpiry <= 30 && (
                      <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        Renew Now
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
