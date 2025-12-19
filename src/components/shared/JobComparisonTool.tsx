/**
 * Job Comparison Tool
 * Free Feature - Side-by-side view of saved jobs
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Compare,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  Calendar
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"

interface JobComparisonToolProps {
  user: User
}

export function JobComparisonTool({ user }: JobComparisonToolProps) {
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])

  // Get saved/bookmarked jobs (in production, use a savedJobs array)
  const savedJobs = jobs.filter(j => {
    // Simple logic: jobs user has viewed or saved
    return j.status === 'open'
  })

  const toggleJob = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : prev.length < 4 ? [...prev, jobId] : prev
    )
  }

  const comparisonJobs = selectedJobs
    .map(id => savedJobs.find(j => j.id === id))
    .filter(Boolean) as Job[]

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compare weight="duotone" size={24} />
            Compare Jobs
          </CardTitle>
          <CardDescription>
            Select up to 4 jobs to compare side-by-side
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className={`p-4 border-2 cursor-pointer transition-all ${
                  selectedJobs.includes(job.id)
                    ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10 dark:bg-[#00FF00]/10'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
                onClick={() => toggleJob(job.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-black dark:text-white flex-1">{job.title}</h3>
                  {selectedJobs.includes(job.id) ? (
                    <CheckCircle size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
                  ) : (
                    <XCircle size={20} className="text-black dark:text-white opacity-50" />
                  )}
                </div>
                <p className="text-sm text-black dark:text-white mb-2 line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-2 text-xs text-black dark:text-white">
                  <MapPin size={12} />
                  <span>{job.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-black dark:text-white mt-1">
                  <DollarSign size={12} />
                  <span>${job.aiScope.priceLow.toLocaleString()} - ${job.aiScope.priceHigh.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedJobs.length > 0 && (
            <Button
              onClick={() => setSelectedJobs([])}
              variant="outline"
              className="w-full"
            >
              Clear Selection ({selectedJobs.length})
            </Button>
          )}
        </CardContent>
      </Card>

      {comparisonJobs.length > 0 && (
        <Card glass={false}>
          <CardHeader>
            <CardTitle>Comparison View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-800">
                    <th className="p-2 text-left text-black dark:text-white">Criteria</th>
                    {comparisonJobs.map((job) => (
                      <th key={job.id} className="p-2 text-left text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800">
                        {job.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <td className="p-2 font-semibold text-black dark:text-white">Budget Range</td>
                    {comparisonJobs.map((job) => (
                      <td key={job.id} className="p-2 text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800">
                        ${job.aiScope.priceLow.toLocaleString()} - ${job.aiScope.priceHigh.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <td className="p-2 font-semibold text-black dark:text-white">Location</td>
                    {comparisonJobs.map((job) => (
                      <td key={job.id} className="p-2 text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800">
                        {job.address || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <td className="p-2 font-semibold text-black dark:text-white">Category</td>
                    {comparisonJobs.map((job) => (
                      <td key={job.id} className="p-2 text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800">
                        <Badge variant="outline">{job.category || 'General'}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <td className="p-2 font-semibold text-black dark:text-white">Size</td>
                    {comparisonJobs.map((job) => (
                      <td key={job.id} className="p-2 text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800 capitalize">
                        {job.size}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <td className="p-2 font-semibold text-black dark:text-white">Posted</td>
                    {comparisonJobs.map((job) => (
                      <td key={job.id} className="p-2 text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-black dark:text-white">Bids</td>
                    {comparisonJobs.map((job) => (
                      <td key={job.id} className="p-2 text-black dark:text-white border-l-2 border-gray-200 dark:border-gray-800">
                        {job.bids?.length || 0}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
