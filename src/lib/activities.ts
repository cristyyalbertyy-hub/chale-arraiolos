import type { TFunction } from 'i18next'
import { activities } from '../data/activities'
import type { Activity, ActivitySelection } from '../types/activity'
import { formatCurrency } from './booking'

export function getActivityName(id: string, t: TFunction): string {
  return t(`activities.items.${id}`)
}

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

export function formatActivityPrice(
  price: number,
  t: TFunction,
  lang: string,
): string {
  if (price === 0) return t('common.noExtraCost')
  return `${formatCurrency(price, lang)}${t('common.perPerson')}`
}

export function formatActivitySelectionLabel(
  selection: ActivitySelection,
  t: TFunction,
): string {
  const activity = getActivityById(selection.id)
  if (!activity) return ''
  const name = getActivityName(activity.id, t)
  const peopleLabel =
    selection.people === 1
      ? t('common.personOne')
      : t('common.personMany', { count: selection.people })
  return `${name} (${peopleLabel})`
}
