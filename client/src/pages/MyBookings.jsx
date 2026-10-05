import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, XCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import api from '@/api';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function MyBookings({ user, navigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('auth'); return; }
    api.get('/bookings')
      .then(res => setBookings(res.data))
      .catch((err) => setErrorMsg(err.response?.data?.message || 'Unable to load your bookings.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const cancelBooking = async () => {
    if (!cancelModal.bookingId) return;
    setCancelLoading(true);
    setErrorMsg('');
    try {
      await api.patch(`/bookings/${cancelModal.bookingId}`, { status: 'cancelled' });
      setBookings((current) => current.map((booking) => (
        booking._id === cancelModal.bookingId ? { ...booking, status: 'cancelled' } : booking
      )));
      setSuccessMsg('Booking cancelled successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to cancel this booking.');
    } finally {
      setCancelLoading(false);
      setCancelModal({ open: false, bookingId: null });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">My Booked Sessions</h1>

        {successMsg && (
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">{successMsg}</AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : bookings.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No bookings yet. Start by finding a tutor!</p>
              <Button onClick={() => navigate('find-tutors')} className="gap-2">
                <Search className="h-4 w-4" /> Find Tutors
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
                      <TableHead className="dark:text-gray-300">Tutor Name</TableHead>
                      <TableHead className="dark:text-gray-300">Student Name</TableHead>
                      <TableHead className="dark:text-gray-300">Email</TableHead>
                      <TableHead className="dark:text-gray-300">Subject</TableHead>
                      <TableHead className="dark:text-gray-300">Date</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking._id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">{booking.tutorName}</TableCell>
                        <TableCell className="dark:text-gray-300">{booking.studentName}</TableCell>
                        <TableCell className="dark:text-gray-300">{booking.studentEmail}</TableCell>
                        <TableCell className="dark:text-gray-300">{booking.subject}</TableCell>
                        <TableCell className="dark:text-gray-300">{booking.date}</TableCell>
                        <TableCell>
                          <Badge className={
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === 'confirmed' && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => setCancelModal({ open: true, bookingId: booking._id })}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" /> Cancel
                            </Button>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="text-xs text-gray-400">Cancelled</span>
                          )}
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
          open={cancelModal.open}
          onClose={() => setCancelModal({ open: false, bookingId: null })}
          onConfirm={cancelBooking}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action will free up a slot for other students."
          confirmText="Yes, Cancel Booking"
          variant="cancel"
          loading={cancelLoading}
        />
      </div>
    </div>
  );
}
