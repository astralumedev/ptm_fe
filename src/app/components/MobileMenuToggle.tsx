'use client';

import { RiMenuFill } from 'react-icons/ri';

interface MobileMenuToggleProps {
  onClick: () => void;
}

function MobileMenuToggle({ onClick }: MobileMenuToggleProps) {
  return (
    <button 
      onClick={onClick} 
      className="text-gray-900 hover:bg-gray-200/80 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
      aria-label="Open Navigation Menu"
    >
      <RiMenuFill size={26} className="text-gray-900" />
    </button>
  );
}

export default MobileMenuToggle;