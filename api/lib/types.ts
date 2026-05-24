export interface BookingFormData {
  checkIn: string
  checkOut: string
  name: string
  email: string
  phone: string
  adults: number
  children: number
}

export interface ActivitySelection {
  id: string
  people: number
}

export interface BookingSubmission {
  locale: string
  form: BookingFormData
  activitySelections: ActivitySelection[]
}
