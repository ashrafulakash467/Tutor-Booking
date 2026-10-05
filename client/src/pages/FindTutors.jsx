import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import api from '@/api';

export default function FindTutors({ navigate }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (subject) params.subject = subject;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    api.get('/tutors', { params })
      .then(res => {
        setTutors(res.data);
        setError('');
      })
      .catch(() => {
        setTutors([]);
        setError('Unable to load tutors. Please check the server connection and try again.');
      })
      .finally(() => setLoading(false));
  }, [search, subject, startDate, endDate]);

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = search || subject || startDate || endDate;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Find Your Perfect Tutor</h1>
        
        {/* Search & Filter */}
        <section className="w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
                </svg>
                <input
                  type="text" placeholder="Search by name or subject..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-14 pr-5 text-gray-700 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-500 dark:text-gray-400">Start Date</label>
              <input
                type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-14 w-44 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 text-gray-700 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-500 dark:text-gray-400">End Date</label>
              <input
                type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-14 w-44 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 text-gray-700 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-500 dark:text-gray-400">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="h-14 w-48 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 text-gray-700 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Programming">Programming</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            {/* Reset */}
            <div>
              <button
                onClick={clearFilters}
                className="h-14 rounded-2xl bg-gray-200 dark:bg-gray-600 px-8 font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Tutor Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                <div className="p-4 pb-0">
                  <Skeleton className="h-56 w-full rounded-2xl dark:bg-gray-700" />
                </div>
                <div className="p-6 space-y-3">
                  <Skeleton className="h-8 w-48 dark:bg-gray-700" />
                  <Skeleton className="h-6 w-32 dark:bg-gray-700" />
                  <Skeleton className="h-5 w-24 dark:bg-gray-700" />
                  <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-24 dark:bg-gray-700" />
                    <Skeleton className="h-12 w-36 rounded-2xl dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : tutors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tutors found matching your criteria.</p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            tutors.map((tutor) => (
              <div key={tutor._id} className="stagger-item max-w-sm overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" onClick={() => navigate('tutor', { id: tutor._id })}>
                <div className="relative p-4 pb-0">
                  <img src={tutor.photoURL} alt={tutor.name} className="h-56 w-full rounded-2xl border border-gray-300 dark:border-gray-600 object-cover" />
                  <Badge className="absolute right-6 top-6 bg-cyan-500 hover:bg-cyan-600 text-white border-0">
                    {tutor.teachingMode || 'Online'}
                  </Badge>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tutor.name}</h2>
                  <p className="mt-2 font-semibold text-blue-700 dark:text-blue-500">{tutor.subject}</p>
                  {tutor.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 {tutor.location}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-orange-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
                    </svg>
                    <span className="font-semibold text-orange-500">{tutor.rating}</span>
                    <span className="font-semibold text-gray-400 dark:text-gray-500">({tutor.totalStudents})</span>
                  </div>
                  <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">${tutor.price}</span>
                      <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">/hr</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('tutor', { id: tutor._id }); }}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:scale-105 hover:shadow-lg"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
