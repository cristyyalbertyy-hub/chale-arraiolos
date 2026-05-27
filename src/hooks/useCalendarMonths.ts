import { useEffect, useState } from 'react'

export function useCalendarMonths(): number {
  const [months, setMonths] = useState(
    () => (typeof window !== 'undefined' && window.innerWidth >= 640 ? 2 : 1),
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setMonths(mq.matches ? 2 : 1)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return months
}
