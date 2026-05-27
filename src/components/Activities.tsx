import { useTranslation } from 'react-i18next'
import { creativeActivities, mealActivities } from '../data/activities'
import { MAX_PEOPLE } from '../lib/booking'
import {
  formatActivityPrice,
  formatDuration,
  getActivitiesTotal,
  getActivityName,
  isFixedPriceActivity,
} from '../lib/activities'
import type { Activity } from '../types/activity'
import type { ActivitySelection } from '../types/activity'

interface ActivitiesProps {
  selections: ActivitySelection[]
  onChange: (selections: ActivitySelection[]) => void
}

function getPeople(selections: ActivitySelection[], id: string): number {
  return selections.find((s) => s.id === id)?.people ?? 1
}

interface ActivityCardProps {
  activity: Activity
  checked: boolean
  people: number
  onToggle: (id: string) => void
  onSetPeople: (id: string, people: number) => void
}

function ActivityCard({
  activity,
  checked,
  people,
  onToggle,
  onSetPeople,
}: ActivityCardProps) {
  const { t, i18n } = useTranslation()
  const isMeal = activity.category === 'meal'
  const fixedPrice = isFixedPriceActivity(activity)
  const name = getActivityName(activity.id, t)
  const lang = i18n.language.split('-')[0]

  return (
    <li>
      <div
        className={`flex gap-3 rounded-2xl border p-4 transition-all sm:p-5 ${
          checked
            ? 'border-olive bg-olive/5 ring-2 ring-olive/20'
            : 'border-sand bg-white'
        }`}
      >
        {!fixedPrice && (
          <div className="flex shrink-0 flex-col items-center gap-1">
            <label
              htmlFor={`people-${activity.id}`}
              className="text-[10px] font-medium uppercase tracking-wide text-stone-muted"
            >
              {t('activities.peopleShort')}
            </label>
            <input
              id={`people-${activity.id}`}
              type="number"
              min={1}
              max={MAX_PEOPLE}
              value={people}
              disabled={!checked}
              aria-label={t('activities.peopleIn', { name })}
              onChange={(e) =>
                onSetPeople(activity.id, Number(e.target.value) || 1)
              }
              className="w-12 rounded-lg border border-sand bg-white px-1 py-2 text-center text-sm font-semibold text-stone outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 disabled:cursor-not-allowed disabled:bg-sand/50 disabled:text-stone-muted"
            />
          </div>
        )}

        <label className="flex min-w-0 flex-1 cursor-pointer gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(activity.id)}
            className="mt-1 h-5 w-5 shrink-0 rounded border-sand text-olive focus:ring-olive/30"
          />
          <span className="min-w-0 flex-1">
            <span
              className={`block font-semibold text-stone ${isMeal ? 'italic' : ''}`}
            >
              {name}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-muted">
              <span className="font-medium text-terracotta">
                {formatActivityPrice(activity, t, lang)}
              </span>
              {activity.durationHours !== null && (
                <span>{formatDuration(activity.durationHours)}</span>
              )}
            </span>
          </span>
        </label>
      </div>
    </li>
  )
}

interface ActivityGridProps {
  items: Activity[]
  selections: ActivitySelection[]
  onToggle: (id: string) => void
  onSetPeople: (id: string, people: number) => void
}

function ActivityGrid({
  items,
  selections,
  onToggle,
  onSetPeople,
}: ActivityGridProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          checked={selections.some((s) => s.id === activity.id)}
          people={getPeople(selections, activity.id)}
          onToggle={onToggle}
          onSetPeople={onSetPeople}
        />
      ))}
    </ul>
  )
}

export function Activities({ selections, onChange }: ActivitiesProps) {
  const { t } = useTranslation()

  function toggle(id: string) {
    const exists = selections.some((s) => s.id === id)
    if (exists) {
      onChange(selections.filter((s) => s.id !== id))
    } else {
      onChange([...selections, { id, people: 1 }])
    }
  }

  function setPeople(id: string, people: number) {
    const clamped = Math.min(MAX_PEOPLE, Math.max(1, people))
    onChange(
      selections.map((s) => (s.id === id ? { ...s, people: clamped } : s)),
    )
  }

  const activitiesSubtotal = getActivitiesTotal(selections)

  return (
    <section id="actividades" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            {t('activities.eyebrow')}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            {t('activities.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-muted">
            {t('activities.intro', { max: MAX_PEOPLE })}
          </p>
        </div>

        <div className="mt-10">
          <h3 className="font-display text-xl font-semibold text-olive sm:text-2xl">
            {t('activities.creativeTitle')}
          </h3>
          <ActivityGrid
            items={creativeActivities}
            selections={selections}
            onToggle={toggle}
            onSetPeople={setPeople}
          />
        </div>

        <div className="mt-14 sm:mt-16">
          <h3 className="font-display text-xl font-semibold text-olive sm:text-2xl">
            {t('activities.mealsTitle')}
          </h3>
          <ActivityGrid
            items={mealActivities}
            selections={selections}
            onToggle={toggle}
            onSetPeople={setPeople}
          />
        </div>

        {selections.length > 0 && (
          <p className="mt-8 text-sm text-olive">
            {t(
              selections.length === 1
                ? 'activities.selectedOne'
                : 'activities.selectedMany',
              { count: selections.length },
            )}
            {activitiesSubtotal > 0 && (
              <span>{t('activities.subtotalNote')}</span>
            )}
          </p>
        )}
      </div>
    </section>
  )
}
