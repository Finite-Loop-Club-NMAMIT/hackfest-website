import React from 'react'
import { useSession } from 'next-auth/react'
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@headlessui/react';

const DashboardButton = () => {
  const { data: session } = useSession();
  
  if (!session?.user || session.user.role === 'PARTICIPANT') {
    return null;
  }

  const handleNavigation = () => {
    window.location.href = '/dashboard';
  };

  return (
    <Button size="icon" variant="ghost" onClick={handleNavigation}>
      <LayoutDashboard className="h-5 w-5" />
    </Button>
  );
}

export default DashboardButton
