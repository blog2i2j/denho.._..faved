import { SidebarProvider } from '@/components/ui/sidebar.tsx';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { AppSidebar } from '@/components/Sidebar/AppSidebar.tsx';
import { SettingsDialog } from '../components/Settings/SettingsDialog.tsx';
import { EditItemDialog } from '@/components/EditItem/EditItemDialog.tsx';
import { OnboardingBanner } from '@/components/OnboardingBanner/OnboardingBanner';

export const Dashboard = observer(({ children }: { children: React.ReactNode }) => {
  const store = useContext(StoreContext);

  return (
    <>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 14)',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <main className="bg-background @container/main relative flex w-full flex-1 flex-col">{children}</main>
      </SidebarProvider>
      {store.isShowEditModal && <EditItemDialog />}
      {store.isOpenSettingsModal && <SettingsDialog />}
      <OnboardingBanner />
    </>
  );
});
