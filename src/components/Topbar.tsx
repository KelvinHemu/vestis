// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../contexts/authStore';
// import { Button } from './ui/button';
// import { Bell } from 'lucide-react';

// export function Topbar() {
//   const { isAuthenticated, user, logout } = useAuthStore();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <header className="fixed top-0 left-16 right-0 h-16 bg-white flex items-center justify-between px-6 z-30">
//       {/* Left side - can be used for breadcrumbs or page title */}
//       <div className="flex items-center space-x-4">
//       </div>

//       {/* Right side - Actions */}
//       <div className="flex items-center space-x-2">


//         {/* Notifications */}
//         <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
//           <Bell className="w-5 h-5" />
//           <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full"></span>
//         </button>

   




//         {/* User Profile / Auth */}
//         {isAuthenticated ? (
//           <div className="flex items-center space-x-3">
//             <div className="hidden sm:flex flex-col items-end">
//               <span className="text-gray-900 text-sm font-medium">{user?.name}</span>
//               <span className="text-gray-500 text-xs">{user?.email}</span>
//             </div>
//             <button 
//               onClick={handleLogout}
//               className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold hover:bg-gray-800 transition-colors"
//             >
//               {user?.name?.[0]?.toUpperCase() || 'U'}
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center space-x-2">
//             <Button 
//               onClick={() => navigate('/login')}
//               variant="ghost" 
//               className="text-gray-900 hover:bg-gray-100"
//             >
//               Sign in
//             </Button>
//             <Button 
//               onClick={() => navigate('/signup')}
//               className="bg-gray-900 hover:bg-gray-800 text-white"
//             >
//               Sign up
//             </Button>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }
