import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid rgba(0,0,0,0.05)',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          },
        }}
      />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`flex-1 pb-16 md:pb-0 transition-all duration-200 ${collapsed ? 'md:ml-[52px]' : 'md:ml-52'}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
