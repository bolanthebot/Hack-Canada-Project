import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0c0f14]">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1e27',
            color: '#e5e7eb',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '13px',
            borderRadius: '8px',
            padding: '10px 14px',
          },
        }}
      />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`flex-1 pb-20 md:pb-0 transition-all duration-200 ${collapsed ? 'md:ml-[52px]' : 'md:ml-52'}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
