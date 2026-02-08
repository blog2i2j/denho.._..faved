import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useItemListState } from '@/hooks/useItemListState.ts';

export const NavMain = observer(() => {
  const store = React.useContext(StoreContext);
  const { isMobile, toggleSidebar } = useSidebar();
  const { setTagFilter } = useItemListState();

  const setAllTags = () => {
    setTagFilter(null);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const setWithoutTags = () => {
    setTagFilter('none');
    if (isMobile) {
      toggleSidebar();
    }
  };

  const navLinks = [
    {
      title: 'All items',
      onClick: setAllTags,
      isSelected: store.tagFilter === null,
      icon: null,
    },
    {
      title: 'Untagged',
      onClick: setWithoutTags,
      isSelected: store.tagFilter === 'none',
      icon: null,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {navLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={item.onClick}
                className={
                  'active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear' +
                  (item.isSelected ? ' !bg-primary !text-primary-foreground' : '')
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
