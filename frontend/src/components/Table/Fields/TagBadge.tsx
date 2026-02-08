import React from 'react';
import { Badge } from '../../ui/badge.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { colorMap } from '@/lib/utils.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { useItemListState } from '@/hooks/useItemListState.ts';

export const getColorClass = (color: string | undefined) => {
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
};

const formatTagPathForDisplay = (path) => {
  return path.replaceAll('\\/', '/');
};

export const TagBadgeMini: React.FC<{ tagID: number }> = observer(({ tagID }) => {
  const store = React.useContext(StoreContext);
  const tag = store.tags[tagID];
  if (!tag) {
    return null;
  }
  const fullPath = formatTagPathForDisplay(tag.fullPath);
  const colorClass = getColorClass(tag.color);

  return (
    <Badge variant="secondary">
      <span className={`h-3 w-3 flex-none rounded-full ${colorClass}`}></span>
      <span>{fullPath}</span>
    </Badge>
  );
});

export const TagBadge: React.FC<{ tagID: number }> = observer(({ tagID }) => {
  const store = React.useContext(StoreContext);
  const tag = store.tags[tagID] ?? null;
  if (!tag) {
    return null;
  }
  const { setTagFilter } = useItemListState();

  const fullPath = formatTagPathForDisplay(tag.fullPath);
  const tagTitle = tag.title;
  const isTagSelected = store.tagFilter === tagID;

  const setTag = () => {
    setTagFilter(tagID);
  };

  const colorClass =
    tag.color && colorMap[tag.color as keyof typeof colorMap]
      ? colorMap[tag.color as keyof typeof colorMap]
      : colorMap.gray;

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge variant={isTagSelected ? 'outline' : 'secondary'} className="cursor-pointer" onClick={setTag}>
          <span className={`h-3 w-3 flex-none rounded-full ${colorClass}`}></span>
          <span>{tagTitle}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{fullPath}</TooltipContent>
    </Tooltip>
  );
});
