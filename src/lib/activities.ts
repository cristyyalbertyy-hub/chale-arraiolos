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

export function isGroupPriceActivity(activity: Activity): boolean {
  return activity.pricingMode === 'group'
}

export function isPriceOnRequestActivity(activity: Activity): boolean {
  return activity.pricingMode === 'onRequest'
}

export function isPerPersonActivity(activity: Activity): boolean {
  return !isGroupPriceActivity(activity) && !isPriceOnRequestActivity(activity)
}

export function hidesPeopleSelector(activity: Activity): boolean {
  return isGroupPriceActivity(activity) || isPriceOnRequestActivity(activity)
}

export function getActivitiesTotal(selections: ActivitySelection[]): number {
  return selections.reduce((sum, selection) => sum + getActivityLineTotal(selection), 0)
}

export function getActivityLineTotal(selection: ActivitySelection): number {
  const activity = getActivityById(selection.id)
  if (!activity || isPriceOnRequestActivity(activity)) return 0
  if (isGroupPriceActivity(activity)) return activity.pricePerPerson
  return activity.pricePerPerson * selection.people
}

export function formatActivityPrice(
  activity: Activity,
  t: TFunction,
  lang: string,
): string {
  if (isPriceOnRequestActivity(activity)) {
    return `${t('activities.priceOnRequest')} · ${t('activities.perGroup')}`
  }
  if (isGroupPriceActivity(activity)) {
    return `${formatCurrency(activity.pricePerPerson, lang)} · ${t('activities.perGroup')}`
  }
  if (activity.pricePerPerson === 0) return t('common.noExtraCost')
  return `${formatCurrency(activity.pricePerPerson, lang)}${t('common.perPerson')}`
}

export function formatActivityLinePrice(
  selection: ActivitySelection,
  t: TFunction,
  lang: string,
): string {
  const activity = getActivityById(selection.id)
  if (!activity) return ''
  if (isPriceOnRequestActivity(activity)) return t('activities.priceOnRequest')
  if (isGroupPriceActivity(activity)) {
    return `${formatCurrency(activity.pricePerPerson, lang)} (${t('activities.perGroup')})`
  }
  return formatCurrency(getActivityLineTotal(selection), lang)
}

export function formatActivitySelectionLabel(
  selection: ActivitySelection,
  t: TFunction,
): string {
  const activity = getActivityById(selection.id)
  if (!activity) return ''
  const name = getActivityName(activity.id, t)
  if (hidesPeopleSelector(activity)) return name
  const peopleLabel =
    selection.people === 1
      ? t('common.personOne')
      : t('common.personMany', { count: selection.people })
  return `${name} (${peopleLabel})`
}
