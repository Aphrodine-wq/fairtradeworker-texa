import { useState } from 'react'
import { PhotoUploader } from '@/components/ui/PhotoUploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from '@phosphor-icons/react'
import type { UploadedPhoto } from '@/hooks/usePhotoUpload'

export function PhotoUploadDemo() {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])

  const completedPhotos = uploadedPhotos.filter(p => p.status === 'complete')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Real-Time Photo Upload</h1>
          <p className="text-muted-foreground">
            Upload photos with live progress tracking, automatic retry, and error handling
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uploadedPhotos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{completedPhotos.length}</div>
                {completedPhotos.length > 0 && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={completedPhotos.length === uploadedPhotos.length && uploadedPhotos.length > 0 ? "default" : "secondary"}>
                {uploadedPhotos.length === 0 ? 'No uploads' : 
                 completedPhotos.length === uploadedPhotos.length ? 'All complete' : 
                 'Uploading...'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
            <CardDescription>
              Drag and drop or click to upload. Maximum 20 photos, 10MB each.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              maxPhotos={20}
              maxSize={10 * 1024 * 1024}
              onPhotosChange={setUploadedPhotos}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compact Mode</CardTitle>
            <CardDescription>
              A space-saving version for forms and inline use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              compact
              maxPhotos={10}
              maxSize={5 * 1024 * 1024}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Real-time progress tracking</strong> - See upload progress for each photo with animated progress bars</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Automatic retry</strong> - Failed uploads can be retried with one click</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Drag and drop support</strong> - Drag files directly onto the upload area</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>File validation</strong> - Automatic checks for file size and type</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Image metadata extraction</strong> - Automatically reads dimensions and file size</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Multiple photos at once</strong> - Select and upload multiple files simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Preview before upload</strong> - See thumbnails of all selected photos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Remove photos</strong> - Delete individual photos before or after upload</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
