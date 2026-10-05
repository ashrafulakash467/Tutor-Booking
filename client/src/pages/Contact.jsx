import { Clock, Mail, MapPin, Phone } from 'lucide-react';

const contactDetails = [
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@tutor-booking.com',
    href: 'mailto:hello@tutor-booking.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: '123 Education Street, New York',
  },
  {
    icon: Clock,
    title: 'Support hours',
    value: 'Monday–Friday, 9:00 AM–6:00 PM',
  },
];

export default function Contact() {
  return (
    <div className="px-4 py-16 sm:py-20">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Contact us</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">We are here to help</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          Have a question about tutors, bookings, or your account? Reach out and our team will be happy to assist you.
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
        {contactDetails.map(({ icon: Icon, title, value, href }) => (
          <article key={title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
              {href ? (
                <a className="mt-1 block text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" href={href}>
                  {value}
                </a>
              ) : (
                <p className="mt-1 text-gray-600 dark:text-gray-300">{value}</p>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
