import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Download, 
  FileText, 
  Users, 
  Clock, 
  Play,
  Pause,
  Square,
  MoreVertical,
  Eye,
  Trash2,
  Share2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { MeetingSession } from '../../../types/meeting-types'
import { MeetingAgentService } from '../../../services/meetingAgentService'
import { useToast } from '../../../components/ui/use-toast'

interface MeetingSessionCardProps {
  session: MeetingSession
  onLeave?: () => void
  onRefresh?: () => void
}

export function MeetingSessionCard({ session, onLeave, onRefresh }: MeetingSessionCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Calculate duration
  const getDuration = () => {
    if (session.duration) {
      return Math.round(session.duration / 60) // Convert to minutes
    }
    
    if (session.endTime) {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      return Math.round(duration / (1000 * 60)) // Convert to minutes
    }
    
    if (session.status === 'active' || session.status === 'recording') {
      const duration = Date.now() - new Date(session.startTime).getTime()
      return Math.round(duration / (1000 * 60)) // Convert to minutes
    }
    
    return 0
  }

  // Get status color
  const getStatusColor = () => {
    switch (session.status) {
      case 'active':
      case 'recording':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      case 'joining':
      case 'transcribing':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get status variant
  const getStatusVariant = () => {
    switch (session.status) {
      case 'active':
      case 'recording':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Handle download recording
  const handleDownloadRecording = async () => {
    if (!session.recordingUrl) return
    
    try {
      setIsLoading(true)
      const result = await MeetingAgentService.downloadRecording(session.id)
      
      if (result.success && result.downloadUrl) {
        // Create download link
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = `${session.title || 'meeting'}_recording.mp4`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: 'Success',
          description: 'Recording download started'
        })
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download recording'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle download transcription
  const handleDownloadTranscription = async () => {
    if (!session.transcriptionText) return
    
    try {
      const transcriptionData = await MeetingAgentService.getTranscription(session.id)
      
      // Create downloadable text file
      const content = `Meeting: ${session.title || 'Untitled Meeting'}
Date: ${new Date(session.startTime).toLocaleString()}
Platform: ${session.platform.name}
Duration: ${getDuration()} minutes

FULL TRANSCRIPTION:
${transcriptionData.fullText}

SEGMENTED TRANSCRIPTION:
${transcriptionData.segments.map(segment => 
  `[${Math.floor(segment.startTime / 60)}:${String(Math.floor(segment.startTime % 60)).padStart(2, '0')}] ${segment.speakerName}: ${segment.text}`
).join('\n')}
`
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${session.title || 'meeting'}_transcription.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Success',
        description: 'Transcription downloaded'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download transcription'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  // Handle generate summary
  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true)
      const result = await MeetingAgentService.generateMeetingSummary(session.id)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Meeting summary generated successfully'
        })
        onRefresh?.()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete session
  const handleDeleteSession = async () => {
    if (!confirm('Are you sure you want to delete this meeting session? This action cannot be undone.')) {
      return
    }
    
    try {
      setIsLoading(true)
      const result = await MeetingAgentService.deleteMeetingSession(session.id)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Meeting session deleted'
        })
        onRefresh?.()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const duration = getDuration()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <div>
              <CardTitle className="text-lg">
                {session.title || 'Untitled Meeting'}
              </CardTitle>
              <CardDescription>
                {session.platform.name} • {new Date(session.startTime).toLocaleString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant()}>
              {session.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(session.meetingUrl, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Meeting URL
                </DropdownMenuItem>
                {session.status === 'completed' && (
                  <DropdownMenuItem onClick={handleGenerateSummary} disabled={isLoading}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Summary
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(session.meetingUrl)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteSession} 
                  disabled={isLoading}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{session.participants.length} participants</span>
          </div>
          <div className="flex items-center gap-2">
            {session.metadata.recordingEnabled ? (
              <Video className="h-4 w-4 text-green-500" />
            ) : (
              <VideoOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span>Recording {session.metadata.recordingEnabled ? 'On' : 'Off'}</span>
          </div>
          <div className="flex items-center gap-2">
            {session.metadata.transcriptionEnabled ? (
              <Mic className="h-4 w-4 text-green-500" />
            ) : (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span>Transcription {session.metadata.transcriptionEnabled ? 'On' : 'Off'}</span>
          </div>
        </div>

        {/* Progress bar for active sessions */}
        {(session.status === 'active' || session.status === 'recording') && session.metadata.maxDuration && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{duration} / {session.metadata.maxDuration} min</span>
            </div>
            <Progress 
              value={(duration / session.metadata.maxDuration) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {session.status === 'active' && onLeave && (
            <Button size="sm" variant="destructive" onClick={onLeave}>
              <Square className="h-3 w-3 mr-1" />
              Leave Meeting
            </Button>
          )}

          {session.status === 'completed' && (
            <>
              {session.recordingUrl && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDownloadRecording}
                  disabled={isLoading}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Recording
                </Button>
              )}
              
              {session.transcriptionText && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDownloadTranscription}
                  disabled={isLoading}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Transcription
                </Button>
              )}
            </>
          )}

          {(session.status === 'joining' || session.status === 'transcribing') && (
            <Badge variant="outline" className="animate-pulse">
              {session.status === 'joining' ? 'Joining...' : 'Processing...'}
            </Badge>
          )}
        </div>

        {/* Participants List (if expanded) */}
        {session.participants.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Participants</p>
            <div className="space-y-1">
              {session.participants.slice(0, 3).map((participant) => (
                <div key={participant.id} className="flex items-center justify-between text-sm">
                  <span>{participant.name}</span>
                  <Badge variant="outline" size="sm">
                    {participant.role}
                  </Badge>
                </div>
              ))}
              {session.participants.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{session.participants.length - 3} more participants
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
