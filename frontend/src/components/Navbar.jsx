import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpenIcon, LayoutDashboardIcon, LogOutIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <motion.nav
      className='bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg'
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className='max-w-7xl mx-auto p-4 flex items-center justify-between'>
        <Link to='/' className='group flex items-center gap-3 hover:scale-105 transition-transform duration-200'>
          <div className='size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg'>
            <SparklesIcon className='size-6 text-white' />
          </div>
          <div className='flex flex-col'>
            <span className='font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider'>
              Standor
            </span>
            <span className='text-xs text-base-content/60 font-medium -mt-1'>Code Together</span>
          </div>
        </Link>

        <div className='flex items-center gap-1'>
          <Link to='/problems' className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive('/problems') ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'}`}>
            <div className='flex items-center gap-x-2.5'>
              <BookOpenIcon className='size-4' />
              <span className='font-medium hidden sm:inline'>Problems</span>
            </div>
          </Link>

          <Link to='/dashboard' className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive('/dashboard') ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'}`}>
            <div className='flex items-center gap-x-2.5'>
              <LayoutDashboardIcon className='size-4' />
              <span className='font-medium hidden sm:inline'>Dashboard</span>
            </div>
          </Link>

          <div className='relative ml-3 group'>
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className='w-9 h-9 rounded-full cursor-pointer border-2 border-primary/30 hover:border-primary transition-colors'
            />
            <div className='absolute right-0 top-full mt-2 hidden group-hover:block bg-base-100 shadow-xl rounded-xl border border-base-200 py-2 w-52 z-50'>
              <div className='px-4 py-2 border-b border-base-200'>
                <p className='font-semibold text-sm truncate'>{user?.name}</p>
                <p className='text-xs text-base-content/60 truncate'>{user?.email}</p>
              </div>
              <button onClick={handleSignOut} className='w-full text-left px-4 py-2 text-sm hover:bg-base-200 text-error flex items-center gap-2 transition-colors'>
                <LogOutIcon className='size-4' />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
export default Navbar;
