import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';
import { Button } from './ui/button';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
            Vestis
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">
              Welcome, {user?.name}
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
