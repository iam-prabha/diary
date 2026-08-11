import { toast, Toaster as ToasterHost } from 'react-hot-toast'

const style = {
  borderRadius: '12px',
  background: 'rgb(var(--paper-card))',
  color: 'rgb(var(--ink))',
  border: '1px solid rgb(var(--paper-line))',
}

export const toaster = {
  success: (msg: string) => toast.success(msg, { style }),
  error: (msg: string) => toast.error(msg, { style }),
  info: (msg: string) => toast(msg, { style }),
}

export function Toaster() {
  return <ToasterHost position="top-right" />
}
