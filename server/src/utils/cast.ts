export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function asNumber(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function asParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? ''
}
