import { useState } from 'react'
import { About } from '../components/About'
import { AboutHost } from '../components/AboutHost'
import { Activities } from '../components/Activities'
import { Amenities } from '../components/Amenities'
import { BookingForm } from '../components/BookingForm'
import { Footer } from '../components/Footer'
import { Gallery } from '../components/Gallery'
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
      <main>
        <Hero />
        <About />
        <AboutHost />
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
      <Footer />
    </>
  )
}
