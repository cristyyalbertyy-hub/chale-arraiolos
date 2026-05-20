import { activities } from '../data/activities'
import type { Activity, ActivitySelection } from '../types/activity'
import { formatCurrency } from './booking'

export function formatDuration(hours: number): string {
  if (hours % 1 === 0) return `${hours}h`
  return `${String(hours).replace('.', ',')}h`
}

export function getActivityById(id: string): Activity | undefined {
  return activities.find((a) => a.id === id)
}

export function getSelectedActivities(
  selections: ActivitySelection[],
): Activity[] {
  return selections
    .map((s) => getActivityById(s.id))
    .filter((a): a is Activity => a !== undefined)
}

export function getActivitiesTotal(selections: ActivitySelection[]): number {
  return selections.reduce((sum, selection) => {
    const activity = getActivityById(selection.id)
    if (!activity) return sum
    return sum + activity.pricePerPerson * selection.people
  }, 0)
}

export function getActivityLineTotal(selection: ActivitySelection): number {
  const activity = getActivityById(selection.id)
  if (!activity) return 0
  return activity.pricePerPerson * selection.people
}

export function formatActivityPrice(price: number): string {
  return `${formatCurrency(price)}/pessoa`
}

export function formatActivitySelectionLabel(selection: ActivitySelection): string {
  const activity = getActivityById(selection.id)
  if (!activity) return ''
  const peopleLabel =
    selection.people === 1 ? '1 pessoa' : `${selection.people} pessoas`
  return `${activity.name} (${peopleLabel})`
}
