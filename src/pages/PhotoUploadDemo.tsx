import { useState } from 'react'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from '@phosphor-icons/react'
import type { UploadedPhoto } from '@/hooks/usePhotoUpload'
import { GlassNav, HeroSection, GlassCard } from '@/components/ui/MarketingSections'

export function PhotoUploadDemo() {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const completedPhotos = uploadedPhotos.filter((p) => p.status === 'complete')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: 'FairTradeWorker' }}
        links={[{ label: 'Home', href: '#' }, { label: 'Photo Upload', href: '#', active: true }]}
        primaryLabel="Post Job" />

      <div className="w-full pt-20 pb-12 px-4 sm:px-6 lg:px-8 space-y-6">
        <HeroSection
          title="Real-time photo uploads"
          subtitle="Live progress, retries, and status—ready for AI scoping and documentation."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uploadedPhotos.length}</div>
            </CardContent>
          </GlassCard>

          <GlassCard className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{completedPhotos.length}</div>
                {completedPhotos.length > 0 && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={completedPhotos.length === uploadedPhotos.length && uploadedPhotos.length > 0 ? 'default' : 'secondary'}>
                {uploadedPhotos.length === 0
                  ? 'No uploads'
                  : completedPhotos.length === uploadedPhotos.length
                  ? 'All complete'
                  : 'Uploading...'}
              </Badge>
            </CardContent>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <CardHeader>
            <CardTitle>Upload files</CardTitle>
            <CardDescription>Track progress in real time with retries and completion markers.</CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoUploader onUploadComplete={(photos) => setUploadedPhotos(photos)} />
          </CardContent>
        </GlassCard>
      </div>
    </div>
  )
}

export default PhotoUploadDemo
