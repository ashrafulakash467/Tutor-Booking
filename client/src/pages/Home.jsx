import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, BookOpen, Users, Award, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/api';

const fallbackTutors = [
  { _id: '1', name: 'Sarah Mitchell', subject: 'Mathematics', rating: 4.9, price: 50, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', bio: 'PhD in Mathematics with 10+ years of experience', totalStudents: 250 },
  { _id: '2', name: 'James Chen', subject: 'Physics', rating: 4.8, price: 55, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', bio: 'Physics researcher turned educator', totalStudents: 180 },
  { _id: '3', name: 'Jhankar Mahbub', subject: 'Programming', rating: 4.9, price: 60, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jhankar', bio: 'Senior software engineer & bestselling author', totalStudents: 5000 },
];

export default function Home({ navigate }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tutors')
      .then(res => setTutors(res.data.slice(0, 3)))
      .catch(() => setTutors(fallbackTutors))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">Trusted by 5000+ Students</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Find Your Perfect<br />
                <span className="text-blue-600">Tutor Today</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Connect with expert tutors across all subjects. Learn at your own pace with personalized one-on-one sessions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('find-tutors')}>
                  <Search className="mr-2 h-5 w-5" /> Find Tutors
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('add-tutor')}>
                  Become a Tutor <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <img src="/images/hero-bg.svg" alt="Hero" className="w-full max-w-lg mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-600 py-12">
        <div className="container mx-auto px-4">
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

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Tutors</h2>
            <Button variant="ghost" className="text-blue-600" onClick={() => navigate('find-tutors')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
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
                <Card key={tutor._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('tutor', { id: tutor._id })}>
                  <CardContent className="p-6 text-center">
                    <img src={tutor.photoURL} alt={tutor.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover bg-gray-200" />
                    <h3 className="text-lg font-semibold">{tutor.name}</h3>
                    <p className="text-blue-600 text-sm mb-2">{tutor.subject}</p>
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm text-gray-600">{tutor.rating}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{tutor.bio?.slice(0, 60)}...</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {tutor.totalStudents}</span>
                      <span className="font-semibold text-blue-600">${tutor.price}/hr</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
    </div>
  );
}