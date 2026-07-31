import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound({ navigate }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button size="lg" onClick={() => navigate('home')}>
          <Home className="mr-2 h-5 w-5" /> Back to Home
        </Button>
      </div>
    </div>
  );
}