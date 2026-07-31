import { useState, useEffect } from 'react';
import { Search, Star, Users, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/api';

const fallbackTutors = [
  { _id: '1', name: 'Sarah Mitchell', subject: 'Mathematics', rating: 4.9, price: 50, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', bio: 'PhD in Mathematics with 10+ years of experience', totalStudents: 250, education: 'PhD, MIT', languages: ['English', 'French'] },
  { _id: '2', name: 'James Chen', subject: 'Physics', rating: 4.8, price: 55, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', bio: 'Physics researcher turned educator', totalStudents: 180, education: 'MS, Stanford', languages: ['English', 'Mandarin'] },
  { _id: '3', name: 'Aisha Rahman', subject: 'English Literature', rating: 4.7, price: 45, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha', bio: 'Published author and literature professor', totalStudents: 320, education: 'MA, Oxford', languages: ['English', 'Urdu'] },
  { _id: '4', name: 'Carlos Rivera', subject: 'Spanish', rating: 4.9, price: 40, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', bio: 'Native Spanish speaker', totalStudents: 410, education: 'BA, Barcelona', languages: ['Spanish', 'English'] },
  { _id: '5', name: 'Jhankar Mahbub', subject: 'Programming', rating: 4.9, price: 60, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jhankar', bio: 'Senior software engineer & bestselling author', totalStudents: 5000, education: 'MS, Dhaka', languages: ['English', 'Bengali'] },
  { _id: '6', name: 'Priya Sharma', subject: 'Chemistry', rating: 4.8, price: 48, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', bio: 'Chemistry PhD with innovative teaching', totalStudents: 195, education: 'PhD, IIT Delhi', languages: ['English', 'Hindi'] },
];

export default function FindTutors({ navigate }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (subject) params.subject = subject;
    api.get('/tutors', { params })
      .then(res => setTutors(res.data))
      .catch(() => setTutors(fallbackTutors))
      .finally(() => setLoading(false));
  }, [search, subject]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Tutor</h1>
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Search tutors by name, subject, or bio..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Filter by subject" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        </div>

        {/* Tutor Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            tutors.map((tutor) => (
              <Card key={tutor._id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate('tutor', { id: tutor._id })}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img src={tutor.photoURL} alt={tutor.name} className="w-16 h-16 rounded-full object-cover bg-gray-200 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{tutor.name}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{tutor.subject}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tutor.bio}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current" /> {tutor.rating}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {tutor.totalStudents}</span>
                    <span className="font-semibold text-blue-600 ml-auto">${tutor.price}/hr</span>
                  </div>
                  <Button className="w-full" variant="outline">View Profile</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}