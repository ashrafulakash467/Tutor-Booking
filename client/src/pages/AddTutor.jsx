import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Upload,
  Clock,
  Clock3,
  MapPin,
  GraduationCap,
  DollarSign,
  Calendar,
  ShieldCheck,
  Trash2,
  User,
  Mail,
  BookOpen,
  Languages,
  Tag,
  Info
} from 'lucide-react';
import api from '@/api';
import ConfirmationModal from '@/components/ConfirmationModal';

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature',
  'Spanish', 'French', 'German', 'Programming', 'Web Development',
  'Data Science', 'Machine Learning', 'History', 'Geography', 'Economics',
  'Accounting', 'Business Studies', 'Art & Design', 'Music', 'Test Preparation'
];

const teachingModes = ['Online', 'Offline', 'Both'];

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const inputClass = 'dark:bg-gray-700 dark:text-white dark:border-gray-600';
const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600';
const labelClass = 'flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200';

// Convert "5:00 PM" or "17:00" to 24-hour format "17:00" for <input type="time">
function convertTo24h(timeStr) {
  if (!timeStr) return '';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr.trim();
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3]?.toUpperCase();
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

// Parse a stored timeSlot like "17:00 - 20:00" or "5:00 PM - 8:00 PM"
function parseTimeSlot(timeSlot) {
  if (!timeSlot) return { startTime: '', endTime: '' };
  const parts = timeSlot.split('-').map(p => p.trim());
  if (parts.length < 2) return { startTime: '', endTime: '' };
  return {
    startTime: convertTo24h(parts[0]),
    endTime: convertTo24h(parts[1]),
  };
}

const emptyForm = {
  name: '', email: '', subject: '', bio: '', price: '',
  education: '', experience: '', photoURL: '', languages: '',
  availability: [], timeSlot: '', startTime: '', endTime: '', totalSlots: '10',
  sessionStartDate: '', location: '', teachingMode: 'Online'
};

const editFormDefaults = (tutor) => {
  const { startTime, endTime } = parseTimeSlot(tutor.timeSlot);
  return {
    name: tutor.name || '',
    email: tutor.email || '',
    subject: tutor.subject || '',
    bio: tutor.bio || '',
    price: tutor.price?.toString() || '',
    education: tutor.education || '',
    experience: tutor.experience || '',
    photoURL: tutor.photoURL || '',
    languages: Array.isArray(tutor.languages) ? tutor.languages.join(', ') : '',
    availability: Array.isArray(tutor.availability) ? tutor.availability : [],
    timeSlot: tutor.timeSlot || '',
    startTime,
    endTime,
    totalSlots: tutor.totalSlots?.toString() || '10',
    sessionStartDate: tutor.sessionStartDate ? tutor.sessionStartDate.split('T')[0] : '',
    location: tutor.location || '',
    teachingMode: tutor.teachingMode || 'Online',
  };
};

export default function AddTutor({ user, navigate, editTutor, onCancelEdit, isAdmin }) {
  const canManageTutors = Boolean(user && isAdmin);
  const [form, setForm] = useState(() =>
    editTutor
      ? editFormDefaults(editTutor)
      : { ...emptyForm }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(editTutor?.photoURL || '');
  const [deleteModal, setDeleteModal] = useState({ open: false, loading: false });
  const isEditing = !!editTutor;

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

  const toggleDay = (day) => {
    setForm(prev => {
      const hasDay = prev.availability.includes(day);
      return {
        ...prev,
        availability: hasDay
          ? prev.availability.filter(d => d !== day)
          : [...prev.availability, day],
      };
    });
  };

  const handleDelete = async () => {
    if (!canManageTutors) {
      setError('Only admins can delete tutor profiles.');
      setDeleteModal({ open: false, loading: false });
      return;
    }
    if (!editTutor?._id) return;

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
    setSuccess(false);
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
        availability: form.availability,
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
        // After successfully creating, allow adding another or go to list
        setSuccess(true);
        setForm({ ...emptyForm });
        setPhotoPreview('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} tutor`);
    } finally {
      setLoading(false);
    }
  };

  // Admin only access
  if (!canManageTutors) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4 animate-fade-in-up">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Admin Access Required</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Only admin users can add, edit, or delete tutor profiles.</p>
              <Button onClick={() => navigate('find-tutors')}>Browse Tutors</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <div className="animate-fade-in-up">
          <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-5">
              <div>
                <CardTitle className="text-2xl dark:text-white">{isEditing ? 'Edit Tutor Profile' : 'Add New Tutor'}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEditing ? 'Update the tutor details below' : 'Fill in the details to create a new tutor profile'}
                </p>
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onCancelEdit}>
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteModal({ open: true, loading: false })}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Tutor profile {isEditing ? 'updated' : 'created'} successfully!
                  </AlertDescription>
                </Alert>
              )}
              {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ===== Basic Info ===== */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <User className="h-4 w-4" /> Basic Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><User className="h-3.5 w-3.5" /> Tutor Name *</label>
                      <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. John Doe" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Mail className="h-3.5 w-3.5" /> Email *</label>
                      <Input type="email" value={form.email || user?.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="tutor@email.com" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><BookOpen className="h-3.5 w-3.5" /> Subject / Category *</label>
                      <select
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                        required
                        className={selectClass}
                      >
                        <option value="">Select a subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}><DollarSign className="h-3.5 w-3.5" /> Hourly Fee ($)</label>
                      <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="50" min="0" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}><Info className="h-3.5 w-3.5" /> Bio / Description</label>
                    <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} placeholder="Tell us about your teaching experience and style..." className={inputClass} />
                  </div>
                </section>

                {/* ===== Qualification & Photo ===== */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <GraduationCap className="h-4 w-4" /> Qualification & Photo
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><GraduationCap className="h-3.5 w-3.5" /> Institution & Education</label>
                      <Input value={form.education} onChange={e => setForm({...form, education: e.target.value})} placeholder="PhD, MIT" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Tag className="h-3.5 w-3.5" /> Experience</label>
                      <Input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="e.g. 10 years" className={inputClass} />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className={labelClass}><Upload className="h-3.5 w-3.5" /> Photo</label>
                      {photoPreview ? (
                        <div className="flex items-center gap-3 mt-2">
                          <img src={photoPreview} alt="Preview" className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                          <div className="flex gap-2">
                            <label className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400">
                              Change
                              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                            <button type="button" onClick={removePhoto} className="text-xs text-red-600 hover:underline dark:text-red-400">
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="mt-2 flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                          <Upload className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Click to upload photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </section>

                {/* ===== Availability ===== */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" /> Availability Schedule
                  </div>

                  <div>
                    <label className={labelClass}><Clock className="h-3.5 w-3.5" /> Available Days</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {weekDays.map((day) => (
                        <label
                          key={day}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                            form.availability.includes(day)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.availability.includes(day)}
                            onChange={() => toggleDay(day)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className="text-sm dark:text-white">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}><Clock3 className="h-3.5 w-3.5" /> Available Time Slot</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative flex-1">
                        <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="time"
                          value={form.startTime || ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              startTime: e.target.value,
                              timeSlot: `${e.target.value} - ${form.endTime || ''}`,
                            })
                          }
                          className={`pl-10 ${inputClass}`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">to</span>
                      <div className="relative flex-1">
                        <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="time"
                          value={form.endTime || ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              endTime: e.target.value,
                              timeSlot: `${form.startTime || ''} - ${e.target.value}`,
                            })
                          }
                          className={`pl-10 ${inputClass}`}
                        />
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Example: 05:00 PM – 08:00 PM</p>
                  </div>
                </section>

                {/* ===== Session & Details ===== */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <Calendar className="h-4 w-4" /> Session & Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><Calendar className="h-3.5 w-3.5" /> Session Start Date</label>
                      <Input type="date" value={form.sessionStartDate} onChange={e => setForm({...form, sessionStartDate: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Tag className="h-3.5 w-3.5" /> Total Available Slots</label>
                      <Input type="number" value={form.totalSlots} onChange={e => setForm({...form, totalSlots: e.target.value})} min="1" max="100" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><MapPin className="h-3.5 w-3.5" /> Location (Area/City)</label>
                      <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Dhaka, Bangladesh" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Tag className="h-3.5 w-3.5" /> Teaching Mode</label>
                      <select
                        value={form.teachingMode}
                        onChange={e => setForm({...form, teachingMode: e.target.value})}
                        className={selectClass}
                      >
                        {teachingModes.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}><Languages className="h-3.5 w-3.5" /> Languages (comma separated)</label>
                    <Input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} placeholder="English, Bengali" className={inputClass} />
                  </div>
                </section>

                {/* ===== Actions ===== */}
                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading
                      ? isEditing ? 'Updating...' : 'Creating...'
                      : isEditing ? 'Update Tutor' : 'Create Tutor'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    if (isEditing && onCancelEdit) onCancelEdit();
                    else navigate('my-tutors');
                  }} disabled={loading}>
                    Cancel
                  </Button>
                </div>
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