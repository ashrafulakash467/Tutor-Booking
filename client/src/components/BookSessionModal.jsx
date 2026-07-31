import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check } from 'lucide-react';
import api from '@/api';

export function BookSessionModal({ tutor, user, open, onClose }) {
  const [form, setForm] = useState({
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    date: '',
    timeSlot: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/bookings', {
        tutorId: tutor._id,
        studentEmail: form.studentEmail,
        studentName: form.studentName,
        date: form.date,
        timeSlot: form.timeSlot,
        subject: tutor.subject,
      });
      setSuccess({ ...res.data.booking, token: Math.random().toString(36).substr(2, 8).toUpperCase() });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (success?.token) {
      navigator.clipboard.writeText(success.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Session with {tutor.name}</DialogTitle>
          <DialogDescription>
            {tutor.subject} - ${tutor.price}/hr
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-green-600">
                Session booked successfully!
              </AlertDescription>
            </Alert>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Your booking reference:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono font-bold text-blue-600">
                  {success.token}
                </code>
                <Button variant="outline" size="icon" onClick={copyToken}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Save this token for future reference</p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Date:</strong> {success.date}</p>
              <p><strong>Time:</strong> {success.timeSlot || 'Flexible'}</p>
              <p><strong>Tutor:</strong> {tutor.name}</p>
            </div>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.studentEmail} onChange={e => setForm({...form, studentEmail: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Input id="date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="time">Time Slot</Label>
              <Input id="time" type="time" value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Booking...' : `Confirm Booking - $${tutor.price}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}