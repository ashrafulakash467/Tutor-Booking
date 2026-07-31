import { useState, useEffect } from 'react';
import { Search, Star, BookOpen, Award, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/api';

const fallbackTutors = [
  { _id: '1', name: 'Sarah Mitchell', subject: 'Mathematics', rating: 4.9, price: 50, photoURL: '/images/pexels-photo-5303546.jpg', bio: 'PhD in Mathematics with 10+ years of experience', totalStudents: 250 },
  { _id: '2', name: 'James Chen', subject: 'Physics', rating: 4.8, price: 55, photoURL: '/images/pexels-photo-5905621.jpg', bio: 'Physics researcher turned educator', totalStudents: 180 },
  { _id: '3', name: 'Aisha Rahman', subject: 'English Literature', rating: 4.7, price: 45, photoURL: '/images/pexels-photo-7692514.jpg', bio: 'Published author and literature professor', totalStudents: 320 },
  { _id: '4', name: 'Carlos Rivera', subject: 'Spanish', rating: 4.9, price: 40, photoURL: '/images/pexels-photo-8192096.jpg', bio: 'Native Spanish speaker', totalStudents: 410 },
  { _id: '5', name: 'Jhankar Mahbub', subject: 'Programming', rating: 4.9, price: 60, photoURL: '/images/pexels-photo-6503157.jpg', bio: 'Senior software engineer & bestselling author', totalStudents: 5000 },
  { _id: '6', name: 'Priya Sharma', subject: 'Chemistry', rating: 4.8, price: 48, photoURL: '/images/pexels-photo-8617761.jpg', bio: 'Chemistry PhD with innovative teaching', totalStudents: 195 },
];

export default function Home({ navigate, user }) {
  const [tutors, setTutors] = useState([]);
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = ['/images/bgimage/img1.jpg', '/images/bgimage/img2.jpg', '/images/bgimage/img3.jpg'];

  useEffect(() => {
    api.get('/tutors')
      .then(res => setTutors(res.data.slice(0, 6)))
      .catch(() => setTutors(fallbackTutors))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section with Slider */}
      <section className="relative overflow-hidden h-[400px] lg:h-[500px]">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={slide} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 w-full">
            <div className="max-w-2xl text-center lg:text-left">
              <Badge className="mb-4 bg-blue-600/90 text-white hover:bg-blue-700 border-0">Trusted by 5000+ Students</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Find Your Perfect<br />
                <span className="text-blue-300">Tutor Today</span>
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-xl">
                Connect with expert tutors across all subjects. Learn at your own pace with personalized one-on-one sessions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('find-tutors')}>
                  <Search className="mr-2 h-5 w-5" /> Find Tutors
                </Button>
                <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/20" onClick={() => navigate('add-tutor')}>
                  {isAdmin ? 'Manage Tutors' : 'Become a Tutor'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Slider Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-2xl font-bold transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-2xl font-bold transition-colors"
        >
          ›
        </button>
        {/* Slider Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

   

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Find a Tutor', desc: 'Browse our list of expert tutors and find the perfect match for your learning needs.' },
              { icon: BookOpen, title: 'Book a Session', desc: 'Choose a convenient time slot and book your session with just a few clicks.' },
              { icon: Award, title: 'Start Learning', desc: 'Connect with your tutor and start your personalized learning journey.' },
            ].map((item, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Tutors</h2>
            <Button variant="ghost" className="text-blue-600" onClick={() => navigate('find-tutors')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <Skeleton className="h-3 w-24 mx-auto mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              tutors.map((tutor) => (
                <div key={tutor._id} className="max-w-sm overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" onClick={() => navigate('tutor', { id: tutor._id })}>
                  <div className="relative p-4 pb-0">
                    <img src={tutor.photoURL} alt={tutor.name} className="h-56 w-full rounded-2xl border border-gray-300 object-cover" />
                    <span className="absolute right-6 top-6 rounded-full bg-cyan-500 px-4 py-1 text-sm font-semibold text-white shadow">
                      Online
                    </span>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-600">{tutor.name}</h2>
                    <p className="mt-2 text-xl font-semibold text-blue-700">{tutor.subject}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-orange-500" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
                      </svg>
                      <span className="font-semibold text-orange-500">{tutor.rating}</span>
                      <span className="font-semibold text-gray-400">({tutor.totalStudents})</span>
                    </div>
                    <div className="my-6 border-t border-gray-200"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">${tutor.price}</span>
                        <span className="text-xl font-semibold text-gray-500">/hr</span>
                      </div>
                      <button
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:scale-105 hover:shadow-lg"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Emily R.', text: 'The tutors are incredibly knowledgeable. I improved my grades significantly!', role: 'Mathematics Student' },
              { name: 'Alex K.', text: 'Flexible scheduling and amazing tutors. Highly recommend for anyone struggling with a subject.', role: 'Physics Student' },
              { name: 'Maria G.', text: 'I found the perfect programming tutor. The one-on-one attention really makes a difference.', role: 'CS Student' },
            ].map((t, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-1 text-yellow-500 mb-3">
                  {Array(5).fill(0).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-gray-600 mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

         {/* Stats Bar */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl font-bold">5000+</div>
              <div className="text-blue-200 mt-1">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold">200+</div>
              <div className="text-blue-200 mt-1">Expert Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-blue-200 mt-1">Subjects</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-blue-200 mt-1">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}