import { ScrollArea } from '@/components/ui/scroll-area';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { ChevronDownIcon, ChevronRightIcon, Image as ImageIcon } from 'lucide-react';
import React, { useContext, useEffect, useMemo } from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { cn, safeDecodeURI } from '@/lib/utils.ts';
import { ActionType, UrlSchema } from '@/lib/types.ts';
import { PreviewImage } from '@/components/Table/Fields/PreviewImage.tsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button.tsx';

const normalizeUrl = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '') + new URL(u).pathname.replace(/\/$/, '');
  } catch {
    return u;
  }
};

const extractDomain = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export const DuplicatesList = ({ url }: { url: string }) => {
  const store = useContext(StoreContext);

  useEffect(() => {
    if (store.items.length === 0) {
      store.fetchItems();
    }
  }, [store]);

  let validUrl = null;
  try {
    validUrl = UrlSchema.parse(url);
  } catch {
    /* empty */
  }

  const exactMatches = useMemo(() => {
    if (!validUrl) {
      return [];
    }
    const normalizedUrl = normalizeUrl(validUrl);
    if (normalizedUrl === '') {
      return [];
    }
    return store.items.filter((item) => normalizeUrl(item.url) === normalizedUrl);
  }, [store.items, validUrl]);

  const domainMatches = useMemo(() => {
    if (!validUrl) {
      return [];
    }
    const urlDomain = extractDomain(validUrl);
    if (urlDomain === '') {
      return [];
    }
    return store.items.filter((item) => extractDomain(item.url) === urlDomain && !exactMatches.includes(item));
  }, [store.items, validUrl, exactMatches]);

  const openItem = (itemId: number) => {
    store.setType(ActionType.EDIT);
    store.setIsShowEditModal(true);
    store.setIdItem(itemId);
  };

  const exactMatchesCount = exactMatches.length;
  const domainMatchesCount = domainMatches.length;
  const totalMatchesCount = exactMatchesCount + domainMatchesCount;
  if (totalMatchesCount === 0) {
    return null;
  }

  const ItemCard = (item, highlightedText) => {
    const decodedHightlightedText = safeDecodeURI(highlightedText);
    const [before, after] = item.url.split(decodedHightlightedText);

    return (
      <Item variant="outline" size="sm" className="bookmark_item flex-nowrap" asChild key={item.id}>
        <a href="#" onClick={() => openItem(item.id)}>
          <ItemMedia>
            {item.image === '' ? (
              <div
                className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
                title="No image"
              >
                <ImageIcon />
              </div>
            ) : (
              <PreviewImage
                imageUrl={item.image}
                item={item}
                className="max-h-[64px] w-auto rounded-sm object-contain shadow-sm"
              />
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1 wrap-anywhere">{item.title}</ItemTitle>
            <ItemDescription className="line-clamp-1 wrap-anywhere">
              {before}
              <span className="bg-red-50 text-red-400">{decodedHightlightedText}</span>
              {after}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    );
  };

  return (
    <Collapsible className="my-2">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="group w-full p-6">
          Possible duplicate –{' '}
          {exactMatchesCount > 0 && `${exactMatchesCount} exact ${exactMatchesCount === 1 ? 'match' : 'matches'}`}
          {domainMatchesCount > 0 && exactMatchesCount > 0 && ' and '}
          {domainMatchesCount > 0 && `${domainMatchesCount} domain ${domainMatchesCount === 1 ? 'match' : 'matches'}`}
          <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-2">
        <ScrollArea className={cn('w-full', totalMatchesCount > 3 ? 'h-73' : '')}>
          <div className="flex w-full flex-col gap-2">
            {exactMatches.map((item) => ItemCard(item, normalizeUrl(item.url)))}
            {domainMatches.map((item) => ItemCard(item, extractDomain(item.url)))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
