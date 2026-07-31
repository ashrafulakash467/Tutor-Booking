import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Upload, X, Clock, MapPin, GraduationCap, DollarSign, Calendar, ShieldCheck, Trash2 } from 'lucide-react';
import api from '@/api';
import ConfirmationModal from '@/components/ConfirmationModal';

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature',
  'Spanish', 'French', 'German', 'Programming', 'Web Development',
  'Data Science', 'Machine Learning', 'History', 'Geography', 'Economics',
  'Accounting', 'Business Studies', 'Art & Design', 'Music', 'Test Preparation'
];

const teachingModes = ['Online', 'Offline', 'Both'];

export default function AddTutor({ user, navigate, editTutor, onCancelEdit }) {
  const isAdmin = user?.role === 'admin';
  const canManageTutors = Boolean(user && isAdmin);
  const [form, setForm] = useState({
    name: '', email: '', subject: '', bio: '', price: '',
    education: '', experience: '', photoURL: '', languages: '',
    availability: '', timeSlot: '', totalSlots: '10',
    sessionStartDate: '', location: '', teachingMode: 'Online'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, loading: false });
  const isEditing = !!editTutor;

  // Initialize form from editTutor prop
  if (editTutor && !form.name) {
    setForm({
      name: editTutor.name || '',
      email: editTutor.email || '',
      subject: editTutor.subject || '',
      bio: editTutor.bio || '',
      price: editTutor.price?.toString() || '',
      education: editTutor.education || '',
      experience: editTutor.experience || '',
      photoURL: editTutor.photoURL || '',
      languages: Array.isArray(editTutor.languages) ? editTutor.languages.join(', ') : '',
      availability: Array.isArray(editTutor.availability) ? editTutor.availability.join(', ') : '',
      timeSlot: editTutor.timeSlot || '',
      totalSlots: editTutor.totalSlots?.toString() || '10',
      sessionStartDate: editTutor.sessionStartDate ? editTutor.sessionStartDate.split('T')[0] : '',
      location: editTutor.location || '',
      teachingMode: editTutor.teachingMode || 'Online',
    });
    if (editTutor.photoURL) setPhotoPreview(editTutor.photoURL);
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
      setForm(prev => ({ ...prev, photoURL: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setForm(prev => ({ ...prev, photoURL: '' }));
  };

  const handleDelete = async () => {
    if (!canManageTutors) {
      setError('Only admins can delete tutor profiles.');
      setDeleteModal({ open: false, loading: false });
      return;
    }

    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await api.delete(`/tutors/${editTutor._id}`);
      setDeleteModal({ open: false, loading: false });
      setSuccess(true);
      setTimeout(() => {
        if (onCancelEdit) onCancelEdit();
        navigate('my-tutors');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tutor');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('auth'); return; }
    if (!canManageTutors) {
      setError('Only admins can manage tutor profiles.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const tutorData = {
        name: form.name,
        email: form.email || user.email,
        subject: form.subject,
        bio: form.bio,
        price: Number(form.price),
        education: form.education,
        experience: form.experience,
        photoURL: form.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
        availability: form.availability.split(',').map(a => a.trim()).filter(Boolean),
        timeSlot: form.timeSlot,
        totalSlots: Number(form.totalSlots) || 10,
        availableSlots: Number(form.totalSlots) || 10,
        sessionStartDate: form.sessionStartDate ? new Date(form.sessionStartDate) : null,
        location: form.location,
        teachingMode: form.teachingMode,
        createdBy: user.email,
      };

      if (isEditing) {
        await api.put(`/tutors/${editTutor._id}`, tutorData);
        setSuccess(true);
        setTimeout(() => {
          if (onCancelEdit) onCancelEdit();
          navigate('my-tutors');
        }, 1500);
      } else {
        await api.post('/tutors', tutorData);
        setSuccess(true);
        setForm({ name: '', email: '', subject: '', bio: '', price: '', education: '', experience: '', photoURL: '', languages: '', availability: '', timeSlot: '', totalSlots: '10', sessionStartDate: '', location: '', teachingMode: 'Online' });
        setPhotoPreview('');
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} tutor`);
    } finally {
      setLoading(false);
    }
  };

  // Admin only access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4 animate-fade-in-up">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Admin Access Required</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Only admin users can add or edit tutor profiles.</p>
              <Button onClick={() => navigate('find-tutors')}>Browse Tutors</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 lg:px-8">
        <div className="animate-fade-in-up">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl dark:text-white">{isEditing ? 'Edit Tutor Profile' : 'Manage Tutor Profiles'}</CardTitle>
              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onCancelEdit}>
                    Cancel Editing
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteModal({ open: true, loading: false })}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Tutor profile {isEditing ? 'updated' : 'created'} successfully!
                  </AlertDescription>
                </Alert>
              )}
              {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Tutor Name *</label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. John Doe" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Email *</label>
                    <Input type="email" value={form.email || user?.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="tutor@email.com" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Subject/Category *</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      <DollarSign className="h-3 w-3 inline mr-1" />Hourly Fee ($)
                    </label>
                    <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="50" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium dark:text-gray-200">Bio / Description</label>
                  <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us about your teaching experience and style..." className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      <GraduationCap className="h-3 w-3 inline mr-1" />Institution & Education
                    </label>
                    <Input value={form.education} onChange={e => setForm({...form, education: e.target.value})} placeholder="PhD, MIT" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Experience</label>
                    <Input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="e.g. 10 years" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium block mb-1 dark:text-gray-200">Photo</label>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                      <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      <Clock className="h-3 w-3 inline mr-1" />Available Days
                    </label>
                    <Input value={form.availability} onChange={e => setForm({...form, availability: e.target.value})} placeholder="e.g. Sun - Thu" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Available Time Slot</label>
                    <Input value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} placeholder="e.g. 5:00 PM - 8:00 PM" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      <Calendar className="h-3 w-3 inline mr-1" />Session Start Date
                    </label>
                    <Input type="date" value={form.sessionStartDate} onChange={e => setForm({...form, sessionStartDate: e.target.value})} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Total Available Slots</label>
                    <Input type="number" value={form.totalSlots} onChange={e => setForm({...form, totalSlots: e.target.value})} min="1" max="100" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      <MapPin className="h-3 w-3 inline mr-1" />Location (Area/City)
                    </label>
                    <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Dhaka, Bangladesh" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Teaching Mode</label>
                    <select
                      value={form.teachingMode}
                      onChange={e => setForm({...form, teachingMode: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      {teachingModes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">Languages (comma separated)</label>
                    <Input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} placeholder="English, Bengali" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Tutor Profile' : 'Create Tutor Profile')}
                </Button>
              </form>
              <ConfirmationModal
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, loading: false })}
                onConfirm={handleDelete}
                title="Delete Tutor Profile"
                message="Are you sure you want to delete this tutor profile? This action cannot be undone. All associated data will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                loading={deleteModal.loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}