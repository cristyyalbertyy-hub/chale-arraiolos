import { useState } from 'react'
import { About } from '../components/About'
import { AboutHost } from '../components/AboutHost'
import { Testimonials } from '../components/Testimonials'
import { Activities } from '../components/Activities'
import { Amenities } from '../components/Amenities'
import { BookingForm } from '../components/BookingForm'
import { Footer } from '../components/Footer'
import { HostPsNote } from '../components/HostPsNote'
import { Gallery } from '../components/Gallery'
import { BathroomNotice } from '../components/BathroomNotice'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import type { ActivitySelection } from '../types/activity'

export function HomePage() {
  const [activitySelections, setActivitySelections] = useState<ActivitySelection[]>(
    [],
  )

  return (
    <>
      <Header />
      <BathroomNotice variant="banner" />
      <main>
        <Hero />
        <About />
        <AboutHost />
        <Testimonials />
        <Amenities />
        <Gallery />
        <Activities
          selections={activitySelections}
          onChange={setActivitySelections}
        />
        <BookingForm
          activitySelections={activitySelections}
          onReset={() => setActivitySelections([])}
        />
      </main>
      <HostPsNote />
      <Footer />
    </>
  )
}
