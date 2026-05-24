import { createContext, createElement, useCallback, useContext, useMemo, useRef, useState } from 'react'

const initialReadingSession = {
  textId: null,
  currentParagraph: 0,
  paragraphCount: 0,
  progress: 0,
  maxReachedParagraph: 0,
  visitedParagraphs: [],
  dwellTimes: {},
  revisitCount: {},
  difficultMarks: [],
  notes: [],
  companionLevel: 'medium',
  mode: 'gentle',
  theme: 'light',
  startTime: null,
  endTime: null,
  readPath: [],
  paragraphPath: [],
  rhythmHistory: [],
  lastParagraph: null,
}

const ReadingSessionContext = createContext(null)

function calculateProgress(maxReachedParagraph, paragraphCount) {
  if (!paragraphCount) return 0
  return Math.min(100, Math.round(((maxReachedParagraph + 1) / paragraphCount) * 100))
}

function chooseSuggestedMode(session, averageDwellTime, revisitTotal) {
  const difficultRatio = session.paragraphCount ? session.difficultMarks.length / session.paragraphCount : 0

  if (difficultRatio >= 0.35 || averageDwellTime >= 45) return 'clear'
  if (revisitTotal >= 3 || averageDwellTime >= 25) return 'focus'
  return session.mode || 'gentle'
}

function chooseSuggestedCompanionLevel(session, revisitTotal) {
  const signalCount = session.difficultMarks.length + session.notes.length + revisitTotal

  if (session.companionLevel === 'off') return 'weak'
  if (signalCount >= 6) return 'strong'
  if (signalCount >= 2) return 'medium'
  return 'weak'
}

export function ReadingSessionProvider({ children }) {
  const [readingSession, setReadingSession] = useState(initialReadingSession)
  const revisitCooldownRef = useRef({})

  const startSession = useCallback(({ textId, paragraphCount, mode = 'gentle', theme = 'light', companionLevel }) => {
    setReadingSession((current) => {
      if (current.textId === textId) {
        return {
          ...current,
          paragraphCount,
          mode,
          theme,
          companionLevel: companionLevel || current.companionLevel,
          endTime: null,
          maxReachedParagraph: Math.min(current.maxReachedParagraph, Math.max(paragraphCount - 1, 0)),
          progress: calculateProgress(Math.min(current.maxReachedParagraph, Math.max(paragraphCount - 1, 0)), paragraphCount),
        }
      }

      const firstParagraph = paragraphCount > 0 ? 0 : -1
      revisitCooldownRef.current = {}

      return {
        ...initialReadingSession,
        textId,
        paragraphCount,
        mode,
        theme,
        companionLevel: companionLevel || (mode === 'focus' ? 'medium' : 'weak'),
        startTime: Date.now(),
        maxReachedParagraph: firstParagraph,
        currentParagraph: firstParagraph,
        visitedParagraphs: firstParagraph >= 0 ? [firstParagraph] : [],
        progress: paragraphCount > 0 ? calculateProgress(firstParagraph, paragraphCount) : 0,
      }
    })
  }, [])

  const updateCurrentParagraph = useCallback((index) => {
    setReadingSession((current) => {
      if (index < 0 || index >= current.paragraphCount || index === current.currentParagraph) {
        return current
      }

      const now = Date.now()
      const hasVisited = current.visitedParagraphs.includes(index)
      const isMovingBack = index < current.currentParagraph
      const cooldownKey = `${current.currentParagraph}-${index}`
      const isCoolingDown = now - (revisitCooldownRef.current[cooldownKey] || 0) < 1000
      const hasRevisited = isMovingBack && hasVisited && !isCoolingDown
      const maxReachedParagraph = Math.max(current.maxReachedParagraph, index)
      const visitedParagraphs = hasVisited ? current.visitedParagraphs : [...current.visitedParagraphs, index]

      if (hasRevisited) {
        revisitCooldownRef.current[cooldownKey] = now
      }

      return {
        ...current,
        lastParagraph: current.currentParagraph,
        currentParagraph: index,
        maxReachedParagraph,
        visitedParagraphs,
        progress: calculateProgress(maxReachedParagraph, current.paragraphCount),
        revisitCount: hasRevisited
          ? {
              ...current.revisitCount,
              [index]: (current.revisitCount[index] || 0) + 1,
            }
          : current.revisitCount,
        readPath: [
          ...current.readPath,
          {
            from: current.currentParagraph,
            to: index,
            paragraphIndex: index,
            at: now,
            type: hasRevisited ? 'revisit' : 'advance',
          },
        ],
        paragraphPath: [
          ...current.paragraphPath,
          {
            paragraph: index,
            at: now,
            type: hasRevisited ? 'revisit' : 'move',
          },
        ],
      }
    })
  }, [])

  const addDwellTime = useCallback((paragraphIndex, seconds) => {
    if (paragraphIndex == null || seconds <= 0) return

    setReadingSession((current) => ({
      ...current,
      dwellTimes: {
        ...current.dwellTimes,
        [paragraphIndex]: Number(((current.dwellTimes[paragraphIndex] || 0) + seconds).toFixed(1)),
      },
    }))
  }, [])

  const recordRhythmSample = useCallback(({ paragraph, type, dwellSec }) => {
    if (!type || paragraph == null) return

    setReadingSession((current) => {
      const now = Date.now()
      const last = current.rhythmHistory[current.rhythmHistory.length - 1]

      if (last && last.type === type && now - last.at < 5000) {
        return current
      }

      return {
        ...current,
        rhythmHistory: [
          ...current.rhythmHistory,
          {
            at: now,
            paragraph,
            type,
            dwellSec: Number((dwellSec || 0).toFixed(1)),
          },
        ],
      }
    })
  }, [])

  const markDifficult = useCallback((paragraphIndex) => {
    setReadingSession((current) => {
      const exists = current.difficultMarks.includes(paragraphIndex)

      return {
        ...current,
        difficultMarks: exists
          ? current.difficultMarks.filter((item) => item !== paragraphIndex)
          : [...current.difficultMarks, paragraphIndex],
      }
    })
  }, [])

  const addNote = useCallback((paragraphIndex, text) => {
    const noteText = text?.trim()
    if (paragraphIndex == null || !noteText) return

    setReadingSession((current) => ({
      ...current,
      notes: [
        {
          id: `${paragraphIndex}-${Date.now()}`,
          paragraphIndex,
          para: paragraphIndex + 1,
          text: noteText,
          createdAt: Date.now(),
        },
        ...current.notes,
      ],
    }))
  }, [])

  const updateNote = useCallback((noteId, text) => {
    const noteText = text?.trim()
    if (!noteId || !noteText) return

    setReadingSession((current) => ({
      ...current,
      notes: current.notes.map((note) => (note.id === noteId ? { ...note, text: noteText, updatedAt: Date.now() } : note)),
    }))
  }, [])

  const deleteNote = useCallback((noteId) => {
    if (!noteId) return

    setReadingSession((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== noteId),
    }))
  }, [])

  const setCompanionLevel = useCallback((level) => {
    if (!['off', 'weak', 'medium', 'strong'].includes(level)) return

    setReadingSession((current) => ({
      ...current,
      companionLevel: level,
    }))
  }, [])

  const finishSession = useCallback(() => {
    setReadingSession((current) => ({
      ...current,
      endTime: Date.now(),
    }))
  }, [])

  const getSessionSummary = useCallback(() => {
    const endTime = readingSession.endTime || Date.now()
    const totalDuration = readingSession.startTime ? Math.max(0, Math.round((endTime - readingSession.startTime) / 1000)) : 0
    const dwellEntries = Object.entries(readingSession.dwellTimes)
    const dwellTotal = dwellEntries.reduce((sum, [, seconds]) => sum + seconds, 0)
    const averageDwellTime = dwellEntries.length ? Number((dwellTotal / dwellEntries.length).toFixed(1)) : 0
    const longestDwellParagraph = dwellEntries.reduce(
      (longest, [paragraphIndex, seconds]) => (seconds > longest.seconds ? { paragraphIndex: Number(paragraphIndex), seconds } : longest),
      { paragraphIndex: null, seconds: 0 },
    )
    const revisitTotal = Object.values(readingSession.revisitCount).reduce((sum, count) => sum + count, 0)

    return {
      totalDuration,
      completedParagraphs: readingSession.paragraphCount ? readingSession.maxReachedParagraph + 1 : 0,
      progress: readingSession.progress,
      difficultCount: readingSession.difficultMarks.length,
      noteCount: readingSession.notes.length,
      revisitTotal,
      longestDwellParagraph,
      averageDwellTime,
      suggestedMode: chooseSuggestedMode(readingSession, averageDwellTime, revisitTotal),
      suggestedCompanionLevel: chooseSuggestedCompanionLevel(readingSession, revisitTotal),
    }
  }, [readingSession])

  const value = useMemo(
    () => ({
      readingSession,
      startSession,
      updateCurrentParagraph,
      addDwellTime,
      recordRhythmSample,
      markDifficult,
      addNote,
      updateNote,
      deleteNote,
      setCompanionLevel,
      finishSession,
      getSessionSummary,
    }),
    [
      addDwellTime,
      recordRhythmSample,
      addNote,
      updateNote,
      deleteNote,
      finishSession,
      getSessionSummary,
      markDifficult,
      readingSession,
      setCompanionLevel,
      startSession,
      updateCurrentParagraph,
    ],
  )

  return createElement(ReadingSessionContext.Provider, { value }, children)
}

export function useReadingSession() {
  const context = useContext(ReadingSessionContext)

  if (!context) {
    throw new Error('useReadingSession must be used within ReadingSessionProvider')
  }

  return context
}
