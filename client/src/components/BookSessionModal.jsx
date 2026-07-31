import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Phone, Calendar, Clock } from 'lucide-react';
import api from '@/api';

export function BookSessionModal({ tutor, user, open, onClose }) {
  const [form, setForm] = useState({
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    phone: '',
    date: '',
    timeSlot: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [slotError, setSlotError] = useState('');

  // Check slot availability and date restrictions
  useEffect(() => {
    if (!tutor) return;
    
    // Check if total slots are available
    if (tutor.availableSlots <= 0) {
      setSlotError('No available slots left. This session is fully booked.');
    } else if (tutor.sessionStartDate) {
      const sessionDate = new Date(tutor.sessionStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today < sessionDate) {
        setSlotError('Booking is not available yet for this tutor. Sessions start on ' + tutor.sessionStartDate.split('T')[0]);
      } else {
        setSlotError('');
      }
    } else {
      setSlotError('');
    }
  }, [tutor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check date restriction
    if (tutor?.sessionStartDate) {
      const sessionDate = new Date(tutor.sessionStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today < sessionDate) {
        setError('Booking is not available yet for this tutor. Sessions start on ' + tutor.sessionStartDate.split('T')[0]);
        setLoading(false);
        return;
      }
    }

    // Check if slots are available
    if (tutor?.availableSlots <= 0) {
      setError('This session is fully booked. You can\'t join at the moment.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/bookings', {
        tutorId: tutor._id,
        studentEmail: form.studentEmail,
        studentName: form.studentName,
        phone: form.phone,
        date: form.date,
        timeSlot: form.timeSlot || tutor.timeSlot,
        subject: tutor.subject,
      });
      setSuccess({ 
        ...res.data.booking, 
        token: Math.random().toString(36).substr(2, 8).toUpperCase(),
        phone: form.phone 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
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
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Book a Session with {tutor?.name}
          </DialogTitle>
          <DialogDescription>
            {tutor?.subject} - ${tutor?.price}/hr
            {tutor?.timeSlot && <span className="block text-xs mt-1"><Clock className="h-3 w-3 inline mr-1" />{tutor.timeSlot}</span>}
          </DialogDescription>
        </DialogHeader>

        {/* Slot Availability Warning */}
        {slotError && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{slotError}</AlertDescription>
          </Alert>
        )}

        {/* Slot Info */}
        {tutor && tutor.availableSlots > 0 && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2 text-sm">
            <span className="text-blue-700 dark:text-blue-400">Available Slots</span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {tutor.availableSlots}/{tutor.totalSlots}
            </span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <AlertDescription className="text-green-600 dark:text-green-400 font-medium">
                Session booked successfully!
              </AlertDescription>
            </Alert>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your booking reference:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-gray-700 px-3 py-2 rounded border dark:border-gray-600 text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                  {success.token}
                </code>
                <Button variant="outline" size="icon" onClick={copyToken}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Save this token for future reference</p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p><strong>Tutor:</strong> {tutor?.name}</p>
              <p><strong>Date:</strong> {success.date}</p>
              <p><strong>Time:</strong> {success.timeSlot || 'Flexible'}</p>
              <p><strong>Phone:</strong> {success.phone || 'Not provided'}</p>
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
              <Label htmlFor="name">Student Name</Label>
              <Input id="name" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} required className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div>
              <Label htmlFor="email">Student Email</Label>
              <Input id="email" type="email" value={form.studentEmail} onChange={e => setForm({...form, studentEmail: e.target.value})} required className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div>
              <Label htmlFor="phone">
                <Phone className="h-3 w-3 inline mr-1" />Phone Number
              </Label>
              <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 123-4567" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Input id="date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div>
              <Label htmlFor="time">Time Slot</Label>
              <Input id="time" type="time" value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              {tutor?.timeSlot && (
                <p className="text-xs text-gray-500 mt-1">Tutor's availability: {tutor.timeSlot}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading || tutor?.availableSlots <= 0}>
              {loading ? 'Booking...' : `Confirm Booking - $${tutor?.price}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}