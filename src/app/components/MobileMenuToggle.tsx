'use client';

import { RiMenuFill } from 'react-icons/ri';

interface MobileMenuToggleProps {
  onClick: () => void;
}

function MobileMenuToggle({ onClick }: MobileMenuToggleProps) {
  return (
    <button 
      onClick={onClick} 
      className="text-white p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
    >
      <RiMenuFill size={28} className="text-white transform rotate-90" />
      <span className="text-white text-sm tracking-wider font-medium">MENU</span>
    </button>
  );
}

export default MobileMenuToggle;