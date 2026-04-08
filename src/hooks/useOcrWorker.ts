import { useCallback, useEffect, useRef } from 'react'
import type { OcrLine } from '../lib/ocr'
import type { OcrLanguage } from '../types'

interface WorkerState {
  worker: import('tesseract.js').Worker
  language: OcrLanguage
}

export function useOcrWorker() {
  const stateRef = useRef<WorkerState | null>(null)
  const progressCallbackRef = useRef<((pct: number) => void) | null>(null)

  const runOcr = useCallback(
    async (
      imageDataUrl: string,
      onProgress: (pct: number) => void,
      language: OcrLanguage = 'eng',
    ): Promise<OcrLine[]> => {
      if (stateRef.current && stateRef.current.language !== language) {
        await stateRef.current.worker.reinitialize(language)
        stateRef.current.language = language
      }

      if (!stateRef.current) {
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker(language, 1, {
          logger: (m: { status: string; progress: number }) => {
            if (
              m.status === 'recognizing text' &&
              progressCallbackRef.current
            ) {
              progressCallbackRef.current(Math.round(10 + m.progress * 80))
            }
          },
        })
        stateRef.current = { worker, language }
      }

      progressCallbackRef.current = onProgress
      const result = await stateRef.current.worker.recognize(imageDataUrl)
      progressCallbackRef.current = null

      const lines: OcrLine[] = []
      for (const block of result.data.blocks ?? []) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            lines.push({
              text: line.text.trim(),
              confidence:
                line.words.length > 0
                  ? Math.round(
                      line.words.reduce(
                        (sum: number, w: { confidence: number }) =>
                          sum + w.confidence,
                        0,
                      ) / line.words.length,
                    )
                  : 0,
            })
          }
        }
      }
      return lines
    },
    [],
  )

  const terminateOcr = useCallback(async (): Promise<void> => {
    if (stateRef.current) {
      await stateRef.current.worker.terminate()
      stateRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (stateRef.current) {
        stateRef.current.worker.terminate()
        stateRef.current = null
      }
    }
  }, [])

  return { runOcr, terminateOcr }
}
