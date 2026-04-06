import { useRef } from 'react'
import { useShallow } from 'zustand/shallow'
import { BottomSheet } from '../../components/BottomSheet'
import { parseReceiptLines, preprocessImage, runOcr } from '../../lib/ocr'
import { useBillStore, useOcrStore, usePrefsStore } from '../../store'
import { OCR_LANGUAGES, type OcrLanguage } from '../../types'

interface OcrCaptureProps {
  onClose: () => void
}

export function OcrCapture({ onClose }: OcrCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { status, progress, setStatus, setProgress, setCandidates, clearOcr } =
    useOcrStore(
      useShallow((s) => ({
        status: s.status,
        progress: s.progress,
        setStatus: s.setStatus,
        setProgress: s.setProgress,
        setCandidates: s.setCandidates,
        clearOcr: s.clearOcr,
      })),
    )
  const currency = useBillStore((s) => s.currency)
  const ocrLanguage = usePrefsStore((s) => s.ocrLanguage)
  const setOcrLanguage = usePrefsStore((s) => s.setOcrLanguage)

  const handleFile = async (file: File) => {
    try {
      setStatus('processing')
      setProgress(5)

      const processedDataUrl = await preprocessImage(file)
      setProgress(10)

      const ocrLines = await runOcr(processedDataUrl, setProgress, ocrLanguage)
      setProgress(95)

      const parsed = parseReceiptLines(ocrLines, currency)

      setCandidates(parsed.map((p) => ({ ...p, selected: true })))
      setStatus('done')
      setProgress(100)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return null
  }

  return (
    <BottomSheet ariaLabel="Scan receipt">
      {status === 'idle' && (
        <>
          <h2 className="text-lg font-bold text-ink mb-4">Scan receipt</h2>
          <div className="mb-4">
            <label htmlFor="ocr-language" className="section-label block mb-1">
              Receipt language
            </label>
            <select
              id="ocr-language"
              value={ocrLanguage}
              onChange={(e) => setOcrLanguage(e.target.value as OcrLanguage)}
              className="input-text focus-ring w-full"
            >
              {(Object.keys(OCR_LANGUAGES) as OcrLanguage[]).map((code) => (
                <option key={code} value={code}>
                  {OCR_LANGUAGES[code]}
                </option>
              ))}
            </select>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Take photo or upload receipt image"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFile(file)
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary w-full mb-3 focus-ring"
          >
            <span aria-hidden="true">📷</span> Take photo / Upload
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost w-full focus-ring"
          >
            Cancel
          </button>
        </>
      )}

      {status === 'processing' && (
        <div aria-live="polite" role="status">
          <p className="text-center font-bold text-ink mb-4">
            Reading your receipt... <span aria-hidden="true">🧾</span>
          </p>
          <div
            className="w-full bg-surface rounded-full h-3"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="OCR progress"
          >
            <div
              className="bg-coral h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted text-center mt-2">{progress}%</p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p className="text-danger font-bold mb-2">
            <span aria-hidden="true">❌</span> Could not read the receipt.
          </p>
          <p className="text-sm text-muted mb-4">
            Try again with better lighting or a clearer photo.
          </p>
          <button
            type="button"
            onClick={() => clearOcr()}
            className="btn-primary w-full mb-2 focus-ring"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              clearOcr()
              onClose()
            }}
            className="btn-ghost w-full focus-ring"
          >
            Cancel
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
