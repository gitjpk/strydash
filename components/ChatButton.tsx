'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ChatButton() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Don't show on StrAId page itself
  if (pathname === '/straid') {
    return null;
  }

  return (
    <Link
      href="/straid"
      className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-[100] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg whitespace-nowrap shadow-xl transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          Ask StrAId
          <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>

        {/* Button */}
        <div className="relative">
          <button className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-200 flex items-center justify-center relative z-10">
            <MessageSquare className="w-7 h-7" />
          </button>

          {/* Pulse animation ring */}
          <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-30"></span>
        </div>
      </div>
    </Link>
  );
}
