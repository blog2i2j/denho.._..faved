'use client';

import * as React from 'react';
import { useContext, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { toJS } from 'mobx';
import { TagsObjectType } from '@/lib/types.ts';
import { getColorClass, TagBadgeMini } from '@/components/Table/Fields/TagBadge.tsx';

const TagEdit = observer(
  ({ className, tagIDs, onChange }: { className?: string; tagIDs: number[]; onChange: (values: number[]) => void }) => {
    const store = useContext(StoreContext);
    const [open, setOpen] = React.useState(false);
    const [selectedTags, setSelectedTags] = React.useState(tagIDs);
    const [query, setQuery] = React.useState('');
    const sortedTags = useMemo(() => {
      const t = Object.values(toJS(store.tags as TagsObjectType));
      t.sort((a, b) => {
        return Number(selectedTags.includes(b.id)) - Number(selectedTags.includes(a.id));
      });
      return t;
    }, [store.tags, selectedTags]);

    useEffect(() => {
      store.fetchTags();
    }, [store]);

    React.useEffect(() => {
      onChange(selectedTags);
    }, [selectedTags, onChange]);

    return (
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (v) {
            return;
          }
          setQuery('');
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={['flex h-auto w-full justify-start text-left whitespace-normal'].join(' ')}
          >
            <div className="flex flex-wrap gap-1">
              {selectedTags.length > 0 ? selectedTags.map((tagId) => <TagBadgeMini tagID={tagId} />) : 'Select tags...'}
            </div>
            <ChevronsUpDown className="ml-auto opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={[className, 'overflow-y-hidden p-0'].join(' ')}
          align="start"
          // Required to make the popover scrollable with mouse wheel and touch move inside modal
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command shouldFilter={false} disablePointerSelection={false} loop={false}>
            <CommandInput value={query} onValueChange={setQuery} placeholder="Search tags..." className="h-9" />

            <CommandList className="max-h-[25dvh] overflow-y-scroll">
              {/*<CommandEmpty>No tags found.</CommandEmpty>*/}
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
                        setSelectedTags((prev) =>
                          prev.includes(val) ? prev.filter((tagID) => val !== tagID) : [...prev, val]
                        );
                      }}
                    >
                      <span className={`h-3 w-3 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
                      <span>{tag.fullPath}</span>
                      <Check className={cn('ml-auto', selectedTags.includes(tag.id) ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  ))}

                {query.length > 1 &&
                  typeof sortedTags.find((t) => t.fullPath.toLowerCase() === query.trim().toLowerCase()) ===
                    'undefined' && (
                    <CommandItem
                      forceMount={true}
                      key="new_item"
                      value={query}
                      // keywords={[tag.fullPath]}
                      onSelect={async () => {
                        const newTagID = await store.createTag(query);
                        if (newTagID === null) {
                          return;
                        }
                        setSelectedTags((prev) => [...prev, Number(newTagID)]);
                        // setQuery('');
                        // setOpen(false)
                      }}
                    >
                      + Create new tag: "{query.trim()}"
                    </CommandItem>
                  )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

export { TagEdit };
