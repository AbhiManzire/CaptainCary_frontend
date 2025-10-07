import React, { memo } from 'react';
import AdminSidebar from './AdminSidebar';

const StableSidebar = memo(({ sidebarOpen, setSidebarOpen, user, logout, reminders = [] }) => {
  return (
    <AdminSidebar 
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      user={user}
      logout={logout}
      reminders={reminders}
    />
  );
});

StableSidebar.displayName = 'StableSidebar';

export default StableSidebar;
