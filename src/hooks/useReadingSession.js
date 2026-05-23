import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react'

const initialReadingSession = {
  textId: null,
  currentParagraph: 0,
  progress: 0,
  startTime: null,
  endTime: null,
  lastParagraph: null,
  maxReachedParagraph: 0,
  paragraphCount: 0,
  dwellTimes: {},
  revisitCount: {},
  readPath: [],
  difficultMarks: [],
  notes: [],
  mode: 'gentle',
  theme: 'light',
  companionLevel: 'medium',
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

  const startSession = useCallback(({ textId, paragraphCount, mode = 'gentle', theme = 'light' }) => {
    setReadingSession({
      ...initialReadingSession,
      textId,
      paragraphCount,
      mode,
      theme,
      startTime: Date.now(),
      maxReachedParagraph: paragraphCount > 0 ? 0 : -1,
      progress: paragraphCount > 0 ? calculateProgress(0, paragraphCount) : 0,
    })
  }, [])

  const updateCurrentParagraph = useCallback((index) => {
    setReadingSession((current) => {
      if (index < 0 || index >= current.paragraphCount || index === current.currentParagraph) {
        return current
      }

      const hasRevisited = index < current.maxReachedParagraph
      const maxReachedParagraph = Math.max(current.maxReachedParagraph, index)

      return {
        ...current,
        lastParagraph: current.currentParagraph,
        currentParagraph: index,
        maxReachedParagraph,
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
            at: Date.now(),
            type: hasRevisited ? 'revisit' : 'advance',
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
      markDifficult,
      addNote,
      setCompanionLevel,
      finishSession,
      getSessionSummary,
    }),
    [
      addDwellTime,
      addNote,
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
