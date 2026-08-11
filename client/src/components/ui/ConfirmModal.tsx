interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: ConfirmModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-2 font-serif-display text-2xl text-[rgb(var(--ink))]">{title}</h3>
        <p className="mb-6 text-sm text-[rgb(var(--ink-soft))]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-[rgb(var(--ink-soft))] hover:text-[rgb(var(--ink))]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
