import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Trash2, Users, PlusCircle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '@/api';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function MyTutors({ user, navigate }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, tutorId: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) { navigate('auth'); return; }
    if (!isAdmin) { navigate('find-tutors'); return; }
    // Admin sees ALL tutors in the database
    api.get('/tutors')
      .then(res => setTutors(res.data))
      .catch((err) => setErrorMsg(err.response?.data?.message || 'Failed to load tutors'))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  const deleteTutor = async () => {
    const { tutorId } = deleteModal;
    if (!tutorId) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/tutors/${tutorId}`);
      setTutors(prev => prev.filter(t => t._id !== tutorId));
      setDeleteModal({ open: false, tutorId: null });
      setSuccessMsg('Tutor profile deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setDeleteModal({ open: false, tutorId: null });
      setErrorMsg(err.response?.data?.message || 'Failed to delete tutor');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Admin only access - show access denied for non-admins instead of blank screen
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">Only admin users can manage tutor profiles.</p>
              <Button onClick={() => navigate('find-tutors')}>Browse Tutors</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold dark:text-white">All Tutors</h1>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 gap-1">
              <ShieldCheck className="h-3 w-3" /> Admin
            </Badge>
          </div>
          <Button onClick={() => navigate('add-tutor')} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Tutor
          </Button>
        </div>

        {successMsg && (
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">{successMsg}</AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert variant="destructive" className="mb-4 animate-fade-in">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : tutors.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No tutors added yet. Create the first tutor profile!</p>
              <Button onClick={() => navigate('add-tutor')} className="gap-2">
                <PlusCircle className="h-4 w-4" /> Create Tutor Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-fade-in">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Tutor</TableHead>
                      <TableHead className="dark:text-gray-300">Subject</TableHead>
                      <TableHead className="dark:text-gray-300">Price</TableHead>
                      <TableHead className="dark:text-gray-300">Slots</TableHead>
                      <TableHead className="dark:text-gray-300">Teaching Mode</TableHead>
                      <TableHead className="dark:text-gray-300">Location</TableHead>
                      <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tutors.map((tutor) => (
                      <TableRow key={tutor._id} className="dark:border-gray-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={tutor.photoURL} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {tutor.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium dark:text-white">{tutor.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{tutor.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">{tutor.subject}</Badge></TableCell>
                        <TableCell className="dark:text-gray-300">${tutor.price}/hr</TableCell>
                        <TableCell className="dark:text-gray-300">
                          <span className={tutor.availableSlots <= 0 ? 'text-red-500 font-semibold' : ''}>
                            {tutor.availableSlots}/{tutor.totalSlots}
                          </span>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{tutor.teachingMode || 'N/A'}</TableCell>
                        <TableCell className="dark:text-gray-300">{tutor.location || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('add-tutor', { editTutor: tutor })}
                              title={`Edit ${tutor.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteModal({ open: true, tutorId: tutor._id })}
                              title={`Delete ${tutor.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        <ConfirmationModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, tutorId: null })}
          onConfirm={deleteTutor}
          title="Delete Tutor Profile"
          message="Are you sure you want to delete this tutor profile? This action cannot be undone. All associated data will be permanently removed."
          confirmText="Delete"
          variant="destructive"
          loading={deleteLoading}
        />
      </div>
    </div>
  );
}