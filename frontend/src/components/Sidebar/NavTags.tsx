import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar.tsx';
import * as React from 'react';
import { TagType } from '@/lib/types.ts';
import { SidebarTag } from '@/components/Sidebar/SidebarTag.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';

export const NavTags = observer(() => {
  const store = React.useContext(StoreContext);
  const selectedTag = store.tags[store.tagFilter] ?? null;

  function renderTag(parentID: number, level = 0): React.JSX.Element[] {
    const output: React.JSX.Element[] = [];
    const tags: TagType[] = Object.values(store.tags).filter((tag: TagType) => tag.parent === parentID) as TagType[];
    tags.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.title.localeCompare(b.title);
    });

    level++;

    for (const tag of tags) {
      const innerItems = renderTag(tag.id, level);
      const isTagSelected = store.tagFilter === tag.id;
      const isChildTagSelected = !isTagSelected && selectedTag && selectedTag.fullPath.indexOf(tag.fullPath) === 0;

      const code = (
        <SidebarTag
          key={tag.id}
          tag={tag}
          innerItems={innerItems}
          level={level}
          isTagSelected={isTagSelected}
          isChildTagSelected={isChildTagSelected}
        />
      );
      output.push(code);
    }

    return output;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tags</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>{renderTag(0)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
