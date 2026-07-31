import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Users } from 'lucide-react';
import api from '@/api';

export default function MyTutors({ user, navigate }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTutor, setEditTutor] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!user) { navigate('auth'); return; }
    api.get('/tutors', { params: { email: user.email } })
      .then(res => setTutors(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const openEdit = (tutor) => {
    setEditTutor(tutor);
    setEditForm({ ...tutor });
  };

  const saveEdit = async () => {
    try {
      const res = await api.put(`/tutors/${editTutor._id}`, editForm);
      setTutors(tutors.map(t => t._id === editTutor._id ? res.data.tutor : t));
      setEditTutor(null);
    } catch (err) {
      console.error('Failed to update tutor', err);
    }
  };

  const deleteTutor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tutor?')) return;
    try {
      await api.delete(`/tutors/${id}`);
      setTutors(tutors.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete tutor', err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Tutors</h1>
          <Button onClick={() => navigate('add-tutor')}>Add New Tutor</Button>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : tutors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tutors yet</p>
              <Button className="mt-4" onClick={() => navigate('add-tutor')}>Create Tutor Profile</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Slots</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tutors.map((tutor) => (
                    <TableRow key={tutor._id}>
                      <TableCell className="font-medium">{tutor.name}</TableCell>
                      <TableCell><Badge variant="secondary">{tutor.subject}</Badge></TableCell>
                      <TableCell>${tutor.price}/hr</TableCell>
                      <TableCell>{tutor.availableSlots}/{tutor.totalSlots}</TableCell>
                      <TableCell>{tutor.rating || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(tutor)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteTutor(tutor._id)}>
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
        )}

        <Dialog open={!!editTutor} onOpenChange={() => setEditTutor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tutor</DialogTitle>
            </DialogHeader>
            {editTutor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">Name</label><Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                  <div><label className="text-sm font-medium">Subject</label><Input value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} /></div>
                </div>
                <div><label className="text-sm font-medium">Bio</label><Textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">Price ($/hr)</label><Input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} /></div>
                  <div><label className="text-sm font-medium">Photo URL</label><Input value={editForm.photoURL} onChange={e => setEditForm({...editForm, photoURL: e.target.value})} /></div>
                </div>
                <Button className="w-full" onClick={saveEdit}>Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}