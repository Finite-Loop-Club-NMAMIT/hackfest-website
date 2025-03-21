import React from 'react'

import { LayoutDashboard } from 'lucide-react';
import { Button } from '@headlessui/react';

const DashButtom = () => {
  const handleNavigation = () => {
    window.location.href = '/dashboard';
  };

  return (
    <Button size="icon" variant="ghost" onClick={handleNavigation}>
      <LayoutDashboard className="h-5 w-5" />
    </Button>
  );
}

export default DashButtom
