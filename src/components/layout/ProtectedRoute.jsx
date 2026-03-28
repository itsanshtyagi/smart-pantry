import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute({ children }) {
    const { user } = useAuthStore();

    if (user === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <p className="text-gray-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}
