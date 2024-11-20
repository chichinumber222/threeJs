export const useCount = (start?: number) => {
  let current = start ?? 0
  return () => {
    const next = current + 1
    current = next
    return current
  }
}
