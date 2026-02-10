'use client';

import * as React from 'react';
import { ReactNode, useContext, useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { getColorClass } from '@/components/Table/Fields/TagBadge.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';

export const TagSelect = observer(
  ({
    className,
    selectedTagsAll,
    selectedTagsSome,
    onSubmit,
    children,
  }: {
    className?: string;
    selectedTagsAll: number[];
    selectedTagsSome: number[];
    onSubmit: ({ newSelectedTagsAll, newSelectedTagsSome }) => Promise<boolean>;
    children: ReactNode;
  }) => {
    const store = useContext(StoreContext);
    const [sortedTags, setSortedTags] = React.useState([]);
    const [newSelectedTagsAll, setNewSelectedTagsAll] = React.useState(selectedTagsAll);
    const [newSelectedTagsSome, setNewSelectedTagsSome] = React.useState(selectedTagsSome);
    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [isSubmitInProgress, setIsSubmitInProgress] = React.useState(false);

    const isChanged: boolean = useMemo(
      () =>
        newSelectedTagsSome.length !== selectedTagsSome.length ||
        newSelectedTagsAll.length !== selectedTagsAll.length ||
        newSelectedTagsAll.some((tag) => !selectedTagsAll.includes(tag)) ||
        selectedTagsAll.some((tag) => !newSelectedTagsAll.includes(tag)),
      [newSelectedTagsAll, newSelectedTagsSome, selectedTagsAll, selectedTagsSome]
    );

    const getSortedTags = (tags, selectedTags) => {
      const t = Object.values(store.tags);
      t.sort((a, b) => {
        return Number(selectedTags.includes(b.id)) - Number(selectedTags.includes(a.id));
      });
      return t;
    };

    React.useEffect(() => {
      setSortedTags(getSortedTags(store.tags, [...newSelectedTagsAll, ...newSelectedTagsSome]));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.tags]);

    const resetTags = () => {
      setQuery('');
      setNewSelectedTagsAll(selectedTagsAll);
      setNewSelectedTagsSome(selectedTagsSome);
      setSortedTags(getSortedTags(store.tags, [...selectedTagsAll, ...selectedTagsSome]));
    };

    return (
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (false === v) {
            return;
          }
          resetTags();
        }}
      >
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          className={[className, 'overflow-y-hidden p-0'].join(' ')}
          align="center"
          // Required to make the popover scrollable with mouse wheel and touch move inside modal
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command shouldFilter={false} disablePointerSelection={false} loop={false}>
            <CommandInput value={query} onValueChange={setQuery} placeholder="Search tags..." className="h-9" />

            <CommandList className="max-h-[25dvh] overflow-y-scroll">
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {sortedTags
                  .filter((tag) => tag.fullPath.toLowerCase().includes(query.toLowerCase().trim()))
                  .map((tag) => (
                    <CommandItem
                      className="flex items-center gap-3"
                      key={tag.id}
                      // Need to convert to string because CommandItem expects value to be string, otherwise it will fallback to inner text (presumably)
                      value={tag.id.toString()}
                      keywords={[tag.fullPath]}
                      onSelect={(currentValue) => {
                        const val = Number(currentValue);

                        setNewSelectedTagsSome((prev) => prev.filter((tagID) => tagID !== tag.id));

                        setNewSelectedTagsAll((prev) =>
                          prev.includes(val) ? prev.filter((tagID) => tagID !== val) : [...prev, val]
                        );
                      }}
                    >
                      <Checkbox
                        checked={
                          newSelectedTagsAll.includes(tag.id) ||
                          (newSelectedTagsSome.includes(tag.id) ? 'indeterminate' : false)
                        }
                        aria-label="Select all"
                      />
                      <span className={`h-3 w-3 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
                      <span>{tag.fullPath}</span>
                    </CommandItem>
                  ))}

                {query.length > 1 &&
                  !sortedTags.some((t) => t.fullPath.toLowerCase() === query.trim().toLowerCase()) && (
                    <CommandItem
                      forceMount={true}
                      key="new_item"
                      value={query}
                      onSelect={async () => {
                        const newTagID = await store.createTag(query);
                        if (newTagID === null) {
                          return;
                        }
                        setNewSelectedTagsAll((prev) => [...prev, Number(newTagID)]);
                        setQuery('');
                      }}
                    >
                      + Create new tag: "{query.trim()}"
                    </CommandItem>
                  )}
              </CommandGroup>
            </CommandList>
            <div className="bg-background w-full p-1">
              <Button
                type="button"
                variant="default"
                disabled={!isChanged || isSubmitInProgress}
                size="sm"
                key="apply"
                value={query}
                className="w-full"
                onClick={async () => {
                  setIsSubmitInProgress(true);
                  await onSubmit({ newSelectedTagsAll, newSelectedTagsSome });
                  setIsSubmitInProgress(false);
                  setOpen(false);
                }}
              >
                {isSubmitInProgress && <Spinner />}
                Apply changes
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
