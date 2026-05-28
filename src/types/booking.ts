export interface BookingFormData {
  checkIn: string
  checkOut: string
  name: string
  email: string
  phone: string
  adults: number
  children: number
}

export interface BookingTotal {
  nights: number
  basePerNight: number
  base: number
  activities: number
  people: number
  total: number
}
