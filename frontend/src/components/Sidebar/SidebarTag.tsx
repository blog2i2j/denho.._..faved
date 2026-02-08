import * as React from 'react';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible.tsx';
import { IconChevronRight, IconDotsVertical, IconPinned } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import { colorMap } from '@/lib/utils.ts';
import { getColorClass } from '@/components/Table/Fields/TagBadge.tsx';
import { useItemListState } from '@/hooks/useItemListState.ts';
import { TagType } from '@/lib/types.ts';

export function SidebarTag({
  tag,
  innerItems = [],
  level,
  isTagSelected,
  isChildTagSelected,
}: {
  tag: TagType;
  innerItems?: React.ReactNode[];
  level: number;
  isTagSelected: boolean;
  isChildTagSelected?: boolean;
}) {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(isChildTagSelected);

  const [newTagTitle, setNewTagTitle] = React.useState(tag.fullPath);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setNewTagTitle(tag.fullPath);
  }, [tag.fullPath]);

  React.useEffect(() => {
    if (isChildTagSelected !== true || isChildTagSelected === isCollapsibleOpen) {
      return;
    }
    setIsCollapsibleOpen(isChildTagSelected);
  }, [isChildTagSelected, isCollapsibleOpen]);

  const store = React.useContext(StoreContext);
  const { isMobile, toggleSidebar } = useSidebar();
  const { setTagFilter } = useItemListState();

  const deleteTag = () => {
    store.onDeleteTag(tag.id);
  };
  const enableRenaming = () => {
    setIsRenaming(true);
    if (!isMobile) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 50);
    }
  };

  const submit = () => {
    store.onChangeTagTitle(tag.id, newTagTitle as string);
    // Add your submit logic here, e.g., store.onUpdateTagTitle(tag.id, newTagTitle)
    setIsRenaming(false);
  };

  const revert = () => {
    setNewTagTitle(tag.fullPath);
    setIsRenaming(false);
  };

  const setTag = () => {
    if (isRenaming) {
      return;
    }
    setTagFilter(tag.id);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const tagContent = (className = '') => {
    return (
      <div onClick={setTag} className={`${className} flex w-full items-center justify-start gap-2 py-2 pe-0 text-left`}>
        <span className={`h-2.5 w-2.5 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
        <input
          ref={inputRef}
          className={[
            'tag-title-edit-input w-[85%] rounded-sm',
            isRenaming ? '' : 'hidden',
            isMobile ? 'border-1' : 'border-none',
          ].join(' ')}
          value={newTagTitle as string}
          onChange={(e) => setNewTagTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              revert();
            } else if (e.key === 'Enter') {
              submit();
            }
          }}
          onBlur={() => {
            if (!isMobile) revert();
          }}
        />
        {!isRenaming && (
          <span title={tag.title} className="line-clamp-1 break-all">
            {tag.title}
          </span>
        )}
        <IconPinned className={`ms-auto h-4 w-4 ` + (tag.pinned ? 'visible' : 'invisible')} />
      </div>
    );
  };

  const actionButtons = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction className="data-[state=open]:bg-accent hover:bg-sidebar-accent sidebar-menu-action cursor-pointer rounded-sm">
          <IconDotsVertical />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-24 rounded-lg"
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
      >
        {level === 1 && (
          <DropdownMenuItem onClick={() => store.onChangeTagPinned(tag.id, !tag.pinned)}>
            <span>{tag.pinned ? 'Unpin' : 'Pin'} tag</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={enableRenaming}>
          <span>Rename</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger> Color</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {Object.keys(colorMap).map((color) => (
                <DropdownMenuItem
                  key={color}
                  className={`text-${colorMap[color]}-foreground hover:bg-${colorMap[color]}-foreground/10`}
                  onClick={() => store.onChangeTagColor(tag.id, color)}
                >
                  <span className={`mr-1 inline-block h-3 w-3 rounded-full ${colorMap[color]}`}></span>{' '}
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                  <span className="ml-auto">{tag.color === color ? '✓' : ''}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={deleteTag}>
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const code =
    innerItems.length > 0 ? (
      <Collapsible className="group/collapsible" open={isCollapsibleOpen}>
        <SidebarMenuItem data-selected={isTagSelected}>
          <SidebarMenuButton
            className={
              'active:bg-primary/90 active:text-primary-foreground gap-0 p-0' +
              (isTagSelected ? ' !bg-primary !text-primary-foreground' : '')
            }
          >
            <div className="p-2 hover:cursor-pointer" onClick={() => setIsCollapsibleOpen(!isCollapsibleOpen)}>
              <IconChevronRight className={`h-4 w-4 transition-transform ` + (isCollapsibleOpen ? ` rotate-90` : '')} />
            </div>
            {tagContent()}
          </SidebarMenuButton>

          <CollapsibleContent>
            <SidebarMenuSub className="mr-[1px] pr-0">{innerItems}</SidebarMenuSub>
          </CollapsibleContent>
          {actionButtons}
        </SidebarMenuItem>
      </Collapsible>
    ) : (
      <SidebarMenuItem data-selected={isTagSelected}>
        <SidebarMenuButton
          className={
            `p-0` +
            (isTagSelected ? ' bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '')
          }
        >
          {tagContent('pl-8')}
        </SidebarMenuButton>
        {actionButtons}
      </SidebarMenuItem>
    );

  return code;
}
