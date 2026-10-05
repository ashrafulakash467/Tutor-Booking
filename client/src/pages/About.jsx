import { CalendarCheck, GraduationCap, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Search,
    title: 'Find the right tutor',
    description: 'Browse tutors by subject and choose the one who fits your learning needs.',
  },
  {
    icon: CalendarCheck,
    title: 'Book with confidence',
    description: 'Choose a convenient session and keep your bookings organized in one place.',
  },
  {
    icon: Users,
    title: 'Learn your way',
    description: 'Get focused support from experienced tutors for your personal goals.',
  },
];

export default function About({ navigate }) {
  return (
    <div className="px-4 py-16 sm:py-20">
      <section className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <GraduationCap className="h-8 w-8" />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">About Tutor-Booking</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Learning support made simple
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          Tutor-Booking connects students with trusted tutors and makes finding, comparing, and booking learning support easy.
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">{description}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-14 max-w-5xl rounded-3xl bg-blue-600 px-6 py-10 text-center text-white sm:px-10">
        <h2 className="text-2xl font-bold">Ready to start learning?</h2>
        <p className="mx-auto mt-2 max-w-xl text-blue-100">Explore available tutors and find the right match for your next session.</p>
        <Button className="mt-6 bg-white text-blue-600 hover:bg-blue-50" onClick={() => navigate('find-tutors')}>
          Find a Tutor
        </Button>
      </section>
    </div>
  );
}
