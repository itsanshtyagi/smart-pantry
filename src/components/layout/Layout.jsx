import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content - offset by sidebar width on desktop */}
            <div className="lg:pl-72 min-h-screen flex flex-col">
                <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
                <main className="flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
