import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, RefreshCw, Plus } from 'lucide-react'

import { Button } from './ui/button'
import { CalendarService, CalendarEvent } from '../services/calendarService'
import { EventModal } from './EventModal'

type CalendarView = 'month' | 'week' | 'day'

interface CalendarViewerProps {
  initialDate?: Date
  initialView?: CalendarView
  onEventClick?: (event: CalendarEvent) => void
}

export function CalendarViewer({ initialDate, initialView = 'month', onEventClick }: CalendarViewerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date())
  const [view, setView] = useState<CalendarView>(initialView)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const startOfWeek = useCallback((date: Date) => {
    const d = new Date(date)
    const day = (d.getDay() + 7) % 7 // 0 = Sunday
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const startOfMonth = useCallback((date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const endOfMonth = useCallback((date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    d.setHours(23, 59, 59, 999)
    return d
  }, [])

  const visibleRange = useMemo(() => {
    if (view === 'day') {
      const start = new Date(currentDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(currentDate)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    if (view === 'week') {
      const start = startOfWeek(currentDate)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    const start = startOfWeek(startOfMonth(currentDate))
    const end = new Date(start)
    end.setDate(end.getDate() + 41) // 6 weeks grid
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [currentDate, view, startOfWeek, startOfMonth])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await CalendarService.listEvents({
        timeMin: visibleRange.start.toISOString(),
        timeMax: visibleRange.end.toISOString(),
        maxResults: 2500,
        singleEvents: true,
        orderBy: 'startTime'
      })
      setEvents(resp.items || [])
    } finally {
      setLoading(false)
    }
  }, [visibleRange.start, visibleRange.end])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setIsModalOpen(true)
    onEventClick?.(event)
  }

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null)
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleEventSaved = () => {
    loadEvents()
  }

  const handleEventDeleted = () => {
    loadEvents()
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedDate(null)
  }

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const goToday = () => setCurrentDate(new Date())
  const goPrev = () => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() - 1)
    else if (view === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }
  const goNext = () => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() + 1)
    else if (view === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  const title = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = view === 'month'
      ? { month: 'long', year: 'numeric' }
      : view === 'week'
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    if (view === 'week') {
      const start = visibleRange.start
      const end = visibleRange.end
      return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`
    }
    return currentDate.toLocaleDateString(undefined, options)
  }, [currentDate, view, visibleRange.start, visibleRange.end])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    const add = (key: string, ev: CalendarEvent) => {
      const arr = map.get(key) || []
      arr.push(ev)
      map.set(key, arr)
    }
    for (const ev of events) {
      const startStr = ev.start?.dateTime || ev.start?.date
      if (!startStr) continue
      const d = new Date(startStr)
      const key = d.toISOString().slice(0, 10)
      add(key, ev)
    }
    return map
  }, [events])

  const renderMonth = () => {
    const days: Date[] = []
    const start = visibleRange.start
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return (
      <div className="flex-1 overflow-auto bg-zinc-900">
        <div className="grid grid-cols-7 border-t border-l border-zinc-700 h-full">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} className="p-2 text-xs font-medium text-slate-400 border-r border-b border-zinc-700 bg-zinc-800">{d}</div>
          ))}
          {days.map((d, idx) => {
            const key = d.toISOString().slice(0,10)
            const dayEvents = eventsByDate.get(key) || []
            const isCurrentMonth = d.getMonth() === currentDate.getMonth()
            const isToday = (new Date()).toDateString() === d.toDateString()
            return (
              <div 
                key={idx} 
                className={`min-h-[7rem] p-1 border-r border-b border-zinc-700 ${isCurrentMonth ? 'bg-zinc-800' : 'bg-zinc-900'} ${isToday ? 'ring-1 ring-blue-500' : ''} cursor-pointer hover:bg-zinc-700/50 transition-colors`}
                onClick={() => handleDateClick(d)}
              >
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span className={`px-1 rounded ${isToday ? 'bg-blue-600 text-white' : ''}`}>{d.getDate()}</span>
                  <Plus className="h-3 w-3 text-slate-500 hover:text-slate-300" />
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(ev => (
                    <button 
                      key={ev.id} 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEventClick(ev)
                      }} 
                      className="w-full text-left truncate text-xs px-1 py-0.5 rounded bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 border border-blue-700/50"
                    >
                      {ev.summary || '(No title)'}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-500">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const formatTime = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderWeek = () => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(visibleRange.start)
      d.setDate(visibleRange.start.getDate() + i)
      days.push(d)
    }
    return (
      <div className="flex-1 overflow-auto bg-zinc-900">
        <div className="grid grid-cols-7 border-t border-l border-zinc-700 h-full">
          {days.map((d) => (
            <div key={d.toISOString()} className="p-2 text-xs font-medium text-slate-400 border-r border-b border-zinc-700 bg-zinc-800">
              {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          ))}
          {days.map((d) => {
            const key = d.toISOString().slice(0,10)
            const dayEvents = (eventsByDate.get(key) || []).slice().sort((a,b) => {
              const as = a.start?.dateTime || a.start?.date || ''
              const bs = b.start?.dateTime || b.start?.date || ''
              return as.localeCompare(bs)
            })
            return (
              <div 
                key={key} 
                className="flex-1 p-2 border-r border-b border-zinc-700 bg-zinc-800 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                onClick={() => handleDateClick(d)}
              >
                {dayEvents.length === 0 ? (
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>No events</span>
                    <Plus className="h-3 w-3 text-slate-500 hover:text-slate-300" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map(ev => (
                      <button 
                        key={ev.id} 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(ev)
                        }} 
                        className="w-full text-left p-2 rounded border border-blue-700/50 bg-blue-900/50 text-blue-300 hover:bg-blue-800/50"
                      >
                        <div className="text-xs font-medium truncate">{ev.summary || '(No title)'}</div>
                        <div className="text-[11px] text-blue-400 flex items-center gap-2">
                          <Clock className="h-3 w-3" /> {formatTime(ev.start?.dateTime)}{ev.end?.dateTime ? ` - ${formatTime(ev.end?.dateTime)}` : ''}
                        </div>
                        {ev.location && (
                          <div className="text-[11px] text-blue-400 flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> {ev.location}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDay = () => {
    const key = currentDate.toISOString().slice(0,10)
    const dayEvents = (eventsByDate.get(key) || []).slice().sort((a,b) => {
      const as = a.start?.dateTime || a.start?.date || ''
      const bs = b.start?.dateTime || b.start?.date || ''
      return as.localeCompare(bs)
    })
    return (
      <div 
        className="flex-1 overflow-auto bg-zinc-900 cursor-pointer"
        onClick={() => handleDateClick(currentDate)}
      >
        <div className="p-4 space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-sm text-slate-400 flex items-center justify-between">
              <span>No events for today.</span>
              <Plus className="h-4 w-4 text-slate-500 hover:text-slate-300" />
            </div>
          ) : (
            dayEvents.map(ev => (
              <button 
                key={ev.id} 
                onClick={(e) => {
                  e.stopPropagation()
                  handleEventClick(ev)
                }} 
                className="w-full text-left p-3 rounded border border-blue-700/50 bg-blue-900/50 text-blue-300 hover:bg-blue-800/50"
              >
                <div className="text-sm font-medium truncate">{ev.summary || '(No title)'}</div>
                <div className="text-xs text-blue-400 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> {formatTime(ev.start?.dateTime)}{ev.end?.dateTime ? ` - ${formatTime(ev.end?.dateTime)}` : ''}
                </div>
                {ev.location && (
                  <div className="text-xs text-blue-400 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {ev.location}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" className="h-8 px-3 bg-slate-700 hover:bg-slate-600 text-white" onClick={goToday}>Today</Button>
          <div className="ml-3 text-sm font-medium text-slate-200 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className={`h-8 px-3 ${view==='month' ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-300 border-slate-600 hover:bg-slate-800'}`} onClick={() => setView('month')}>Month</Button>
          <Button variant="outline" size="sm" className={`h-8 px-3 ${view==='week' ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-300 border-slate-600 hover:bg-slate-800'}`} onClick={() => setView('week')}>Week</Button>
          <Button variant="outline" size="sm" className={`h-8 px-3 ${view==='day' ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-300 border-slate-600 hover:bg-slate-800'}`} onClick={() => setView('day')}>Day</Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200" onClick={loadEvents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      {view === 'month' && renderMonth()}
      {view === 'week' && renderWeek()}
      {view === 'day' && renderDay()}
      
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onEventSaved={handleEventSaved}
        onEventDeleted={handleEventDeleted}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default CalendarViewer


