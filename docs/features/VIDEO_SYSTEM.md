# 150 MB Video Upload System - Implementation Guide

## Overview
The FairTradeWorker Texas platform now supports advanced video uploads up to 150 MB with comprehensive analysis capabilities. This system enables homeowners to record detailed walkthrough videos of their repair needs while providing contractors with rich visual and audio context.

## Key Features

### 1. Large File Handling
- **File Size**: Up to 150 MB per video
- **Supported Formats**: MP4, MOV, MKV, WebM
- **Chunked Upload**: 5 MB chunks using resumable upload protocol
- **Total Chunks**: ~30 chunks for maximum file size
- **Pause/Resume**: Full support for pausing and resuming uploads

### 2. Upload Progress & UX
- **Circular Progress Indicator**: Orange ring with percentage display
- **Pause/Resume Controls**: Prominent buttons during upload
- **Thumbnail Preview**: 5 frames extracted at 0%, 25%, 50%, 75%, 100% duration
- **Cover Selection**: User can click any thumbnail to set as cover image
- **Real-time Stats**: Shows bytes uploaded and remaining

### 3. Duplicate Detection
- **Hash Algorithm**: SHA-256 of first and last 1 MB
- **Detection Window**: 24 hours
- **User Feedback**: Toast notification suggesting to check existing jobs
- **Storage**: Local hash cache with automatic cleanup

### 4. Video Analysis

#### Technical Metadata
- Codec (H.264, VP9, etc.)
- Bitrate (target: 1.3 Mbps)
- Frame rate (FPS)
- Resolution (e.g., 1920x1080)
- Color space (bt.709, bt.601)

#### GPS & Device Info
- GPS coordinates extracted from video metadata
- Auto-fill job address when GPS available
- Device make and model (e.g., "Apple iPhone 13")
- Stored for future device-specific optimizations

#### Audio Analysis
- Sample rate and bit depth
- Channel layout (stereo/mono)
- Loudness measurement (LUFS)
- Quality classification:
  - **Good**: > -30 LUFS
  - **Poor**: -30 to -40 LUFS
  - **Barely Audible**: < -40 LUFS (triggers voice note suggestion)

#### Scene Detection
- Scene change detection using FFmpeg threshold analysis
- Timestamp array of significant scene cuts
- Proves user walked around problem area
- Confidence scores for each cut

#### Motion Analysis
- Motion blur scoring using PSNR between frames
- **Shaky Detection**: < 22 dB triggers warning
- User notification: "Retake steadier shot" (non-blocking)
- Stored for quality metrics

#### Object Recognition
- Simulated computer vision detection
- Labels: water_heater, pvc_pipe, faucet, etc.
- Confidence scores (0-1)
- Bounding boxes [x, y, width, height]
- Future: Enable similarity search ("show me jobs with water heaters")

#### Sound Event Detection
- 5-second sliding window analysis
- Classifications: grinding, drip, hiss, click, hum, squeal
- Each event includes:
  - Start timestamp (seconds)
  - Peak dB level
  - Confidence score
- Displayed as colored markers on video timeline

#### Audio Transcription
- Whisper-style transcription (simulated)
- Word-level timestamps (start/end in milliseconds)
- Clickable captions that seek video playback
- Profanity filter (keeps content PG-rated)
- Language auto-detection
  - ≥40% Spanish → tag as `lang=es`
  - Prioritizes Spanish-speaking contractors

### 5. Enhanced AI Scope Generation
Video analysis data feeds into scope generation:
```
Video: 2 min 14 s, 6 scene cuts, water_heater(91%), drip_sound(3×),
transcript: "leaking from bottom",
GPS: 30.2672,-97.7431, inside garage, filmed on iPhone 13
→ scope: replace water heater, likely drain valve
```

### 6. Quality Warnings

#### Shaky Footage
- Triggers when motion blur < 22 dB
- Non-blocking orange warning
- Suggests: "Consider retaking with a steadier hand"

#### Low Audio
- Triggers when loudness < -40 LUFS
- Shows toast: "We can't hear you well – want to add voice note?"
- Allows additional audio recording

#### Compression Suggestion
- Files > 50 MB show compression toggle
- WebCodecs in-browser compression
- Reduces 4K → 720p @ 30fps
- Saves ~60% bandwidth while maintaining quality

## File Structure

```
src/lib/video/
├── types.ts              - TypeScript interfaces for video system
└── videoProcessor.ts     - Core upload and analysis functions

src/components/jobs/
└── VideoUploader.tsx     - Main video upload component
```

## Usage Example

```typescript
import { VideoUploader } from "@/components/jobs/VideoUploader"
import type { VideoAnalysis } from "@/lib/video/types"

function JobPoster() {
  const handleVideoComplete = (file: File, analysis: VideoAnalysis) => {
    console.log("Duration:", analysis.duration)
    console.log("Scene cuts:", analysis.sceneCuts.length)
    console.log("Objects:", analysis.objects)
    console.log("Transcript:", analysis.transcript.map(w => w.word).join(' '))
    
    // Use analysis to enhance AI scope generation
  }
  
  return (
    <VideoUploader 
      onUploadComplete={handleVideoComplete}
      onCancel={() => console.log("Upload cancelled")}
    />
  )
}
```

## Storage Considerations

### Current Implementation (Demo Mode)
- Files are processed but not permanently stored
- Metadata and analysis results are retained
- Suitable for demonstration and testing

### Production Recommendations
The specification includes guidance for production deployment:

1. **Storage Backend**: Supabase Storage or Cloudflare R2
2. **Bucket Configuration**: `job-videos` bucket with lifecycle rules
3. **CDN**: Cloudflare R2 with Dallas POP for Texas viewers
4. **Lifecycle**: 
   - Infrequent access after 30 days
   - Glacier after 1 year (5 min retrieval)
5. **Capacity**: 600 GB included (~4,000 videos/month at 150 MB each)

## Performance Targets

- **Upload Success Rate**: 98% target
- **Upload Time**: < 90 seconds for 150 MB on 20 Mbps uplink
- **Processing Time**: ~1.5 seconds for analysis
- **Thumbnail Generation**: < 2 seconds for 5 frames
- **First Frame Display**: < 500ms

## Video Duration Labels

Videos are automatically categorized:
- **Quick**: ≤ 30 seconds (green badge)
- **Standard**: 31-90 seconds (yellow badge)
- **Detailed**: > 90 seconds (red badge)

## Privacy Modes (Spec Only)

The specification includes privacy mode support:
- **Public** (default): All contractors can view
- **Private**: Only invited contractors see job
- Stored as `is_private` flag on job record

## Future Enhancements

Based on the specification, these features are planned:

1. **Server-Side Transcoding**: FFmpeg edge function for format conversion
2. **Streaming Optimization**: Generate 720p @ 1 Mbps version for fast preview
3. **Background Upload**: Service Worker continuation when navigating away
4. **Web Push Notifications**: "Upload 90% done" alerts
5. **Real-Time Object Detection**: Actual ML model integration
6. **Bandwidth Detection**: Auto-serve appropriate quality based on connection
7. **Metrics Dashboard**: Upload success rate, duration tracking, storage alerts

## Bitrate Recommendations

For optimal quality within 150 MB limit:
- **Target Bitrate**: 1.3 Mbps
- **Example**: 2 min 30 sec video ≈ 24 MB
- **Recording Hint**:
  ```javascript
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 1_300_000
  });
  ```

## Error Handling

- **File Too Large**: Clear message with current size
- **Invalid Format**: Lists supported formats
- **Duplicate Upload**: Suggests checking "My Jobs"
- **Network Error**: Automatic retry with exponential backoff
- **Processing Error**: Graceful fallback to basic metadata

## Testing

The video system can be tested with:
1. Various file sizes (1 MB to 150 MB)
2. Different video formats (MP4, MOV, MKV, WebM)
3. Portrait and landscape orientations
4. Different durations (10 seconds to 10 minutes)
5. Pause/resume during upload
6. Navigation during upload
7. Duplicate file detection

## Notes

- This is a demo implementation suitable for showcasing capabilities
- Production deployment requires actual video storage configuration
- ML models are simulated; real implementations would use GPT-4 Vision, Whisper, etc.
- All processing happens client-side for demo purposes
- Thumbnails are generated as WebP for optimal size/quality balance
