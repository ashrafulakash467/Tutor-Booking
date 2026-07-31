import { useState, useEffect } from 'react';
import { Star, Users, BookOpen, DollarSign, Globe, GraduationCap, Briefcase, Calendar, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BookSessionModal } from '@/components/BookSessionModal';
import api from '@/api';

export default function TutorDetails({ navigate, user, tutorId, isAdmin }) {
  const id = tutorId;
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    api.get(`/tutors/${id}`)
      .then(res => setTutor(res.data))
      .catch(() => {
        setTutor({
          _id: id, name: 'Sarah Mitchell', subject: 'Mathematics', rating: 4.9, price: 50,
          photoURL: '/images/pexels-photo-5303546.jpg',
          bio: 'PhD in Mathematics with 10+ years of teaching experience.',
          totalStudents: 250, education: 'PhD in Mathematics, MIT', experience: '10 years',
          languages: ['English', 'French'], availability: ['Monday', 'Wednesday', 'Friday'],
          availableSlots: 7, totalSlots: 10
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteTutor = async () => {
    if (!window.confirm('Are you sure you want to delete this tutor profile? This action cannot be undone.')) return;
    try {
      await api.delete(`/tutors/${id}`);
      navigate('find-tutors');
    } catch (err) {
      console.error('Failed to delete tutor', err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!tutor) return <div className="min-h-screen flex items-center justify-center"><p>Tutor not found</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('find-tutors')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tutors
          </Button>
          {user && isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('add-tutor', { editTutor: tutor })}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteTutor}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={tutor.photoURL} />
                    <AvatarFallback>{tutor.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold mb-1">{tutor.name}</h1>
                    <Badge className="bg-blue-100 text-blue-700 mb-3">{tutor.subject}</Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-500 justify-center sm:justify-start mb-3">
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current" /> {tutor.rating}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {tutor.totalStudents} students</span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600"><DollarSign className="h-4 w-4" /> ${tutor.price}/hr</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Education</p>
                    <p className="font-medium text-sm">{tutor.education}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium text-sm">{tutor.experience}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Languages</p>
                    <p className="font-medium text-sm">{tutor.languages?.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="font-medium text-sm">{tutor.availability?.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Book a Session</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hourly Rate</span>
                    <span className="font-semibold">${tutor.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available Slots</span>
                    <span className="font-semibold">{tutor.availableSlots}/{tutor.totalSlots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Session Duration</span>
                    <span className="font-semibold">1 hour</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => {
                  if (!user) { navigate('auth'); return; }
                  setShowBooking(true);
                }}>
                  <BookOpen className="mr-2 h-4 w-4" /> Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showBooking && tutor && (
          <BookSessionModal
            tutor={tutor}
            user={user}
            open={showBooking}
            onClose={() => setShowBooking(false)}
          />
        )}
      </div>
    </div>
  );
}