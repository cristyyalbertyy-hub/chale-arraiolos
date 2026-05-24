import type { BookingFormData } from './booking'
import type { ActivitySelection } from './activity'

export interface BookingSubmission {
  locale: string
  form: BookingFormData
  activitySelections: ActivitySelection[]
}
