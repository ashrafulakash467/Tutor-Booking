import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import api from '@/api';

export default function AddTutor({ user, navigate }) {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', bio: '', price: '',
    education: '', experience: '', photoURL: '', languages: '', availability: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('auth'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/tutors', {
        ...form,
        price: Number(form.price),
        languages: form.languages.split(',').map(l => l.trim()),
        availability: form.availability.split(',').map(a => a.trim()),
        totalSlots: 10,
        availableSlots: 10,
      });
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', bio: '', price: '', education: '', experience: '', photoURL: '', languages: '', availability: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tutor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Become a Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">Tutor profile created successfully!</AlertDescription>
              </Alert>
            )}
            {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><label className="text-sm font-medium">Email *</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Subject</label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
                <div><label className="text-sm font-medium">Price ($/hr)</label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              </div>
              <div><label className="text-sm font-medium">Bio</label><Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Education</label><Input value={form.education} onChange={e => setForm({...form, education: e.target.value})} /></div>
                <div><label className="text-sm font-medium">Experience</label><Input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} /></div>
              </div>
              <div><label className="text-sm font-medium">Photo URL</label><Input value={form.photoURL} onChange={e => setForm({...form, photoURL: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Languages (comma separated)</label><Input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} /></div>
                <div><label className="text-sm font-medium">Availability (comma separated)</label><Input value={form.availability} onChange={e => setForm({...form, availability: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tutor Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}