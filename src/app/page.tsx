import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function HomePage() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
