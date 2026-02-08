import * as React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { RefreshCw, Square, SquareCheckBig, SquareMinus, TagsIcon, Trash, X } from 'lucide-react';
import { StoreContext } from '@/store/storeContext.ts';
import { Spinner } from '@/components/ui/spinner.tsx';
import { DeleteDialog } from '@/components/Table/Controls/DeleteDialog.tsx';
import { useSidebar } from '@/components/ui/sidebar.tsx';
import { cn } from '@/lib/utils.ts';
import { TagSelect } from '@/components/Table/Controls/TagSelect.tsx';

export const BulkActionControls = ({ table }) => {
  const { isMobile, state } = useSidebar();
  const enableSidebarIndent = !isMobile && state === 'expanded';
  const store = React.useContext(StoreContext);
  const [deleteInProgress, setDeleteInProgress] = React.useState(false);
  const [fetchInProgress, setFetchInProgress] = React.useState(false);
  const filteredSelectedRows = table.getFilteredSelectedRowModel().rows;

  const deleteSelected = async () => {
    setDeleteInProgress(true);
    const result = await store.deleteItems(filteredSelectedRows.map((row) => row.original.id));
    if (!result) {
      return;
    }
    store.fetchItems();
    table.resetRowSelection();
    setDeleteInProgress(false);
  };

  const refetchSelected = async () => {
    setFetchInProgress(true);
    const result = await store.refetchItemsMetadata(filteredSelectedRows.map((row) => row.original.id));
    if (result) {
      store.fetchItems();
    }
    setFetchInProgress(false);
  };

  const updateTagsSelected = async ({ newSelectedTagsAll, newSelectedTagsSome }) => {
    await store.updateItemsTags({
      itemIds: filteredSelectedRows.map((row) => row.original.id),
      newSelectedTagsAll,
      newSelectedTagsSome,
    });
    await store.fetchItems();
    return true;
  };

  if (table.getFilteredSelectedRowModel().rows.length === 0) {
    return null;
  }
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedTags = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.tags)
    .flat();

  // Count occurrences of each tag
  const selectedTagsCount = selectedTags.reduce(
    (count, tagID) => ((count[tagID] = (count[tagID] || 0) + 1), count),
    {}
  );
  const selectedTagsAll = Object.keys(selectedTagsCount)
    .filter((tagID) => selectedTagsCount[tagID] === selectedRowsCount)
    .map((tagID) => Number(tagID));
  const selectedTagsSome = Object.keys(selectedTagsCount)
    .filter((tagID) => selectedTagsCount[tagID] < selectedRowsCount)
    .map((tagID) => Number(tagID));
  return (
    <div
      className={cn(
        'fixed bottom-20 z-50 flex translate-x-1/2 items-center gap-1',
        enableSidebarIndent ? 'right-[calc((100%-287px)/2)]' : 'right-1/2'
      )}
    >
      <Button
        variant="outline"
        className="bg-primary-foreground rounded-full"
        onClick={() => table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected())}
      >
        {(table.getIsAllPageRowsSelected() && <SquareCheckBig />) ||
          (table.getIsSomePageRowsSelected() && <SquareMinus />) || <Square />}
        <span className="whitespace-nowrap">{table.getFilteredSelectedRowModel().rows.length} selected</span>
      </Button>

      <TagSelect selectedTagsAll={selectedTagsAll} selectedTagsSome={selectedTagsSome} onSubmit={updateTagsSelected}>
        <Button variant="outline" className="bg-primary-foreground rounded-full">
          <TagsIcon />
          <span className="hidden @md/main:block">Tags</span>
        </Button>
      </TagSelect>

      <Button
        variant="outline"
        onClick={refetchSelected}
        disabled={fetchInProgress}
        className="bg-primary-foreground rounded-full"
      >
        {fetchInProgress ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
        <span className="hidden @md/main:block">Refetch</span>
      </Button>

      <DeleteDialog onConfirm={deleteSelected} itemsCount={table.getFilteredSelectedRowModel().rows.length}>
        <Button variant="outline" disabled={deleteInProgress} className="bg-primary-foreground rounded-full">
          {deleteInProgress ? <Spinner /> : <Trash />}
          <span className="hidden @md/main:block">Delete</span>
        </Button>
      </DeleteDialog>
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.resetRowSelection()}
        className="bg-primary-foreground rounded-full"
      >
        <X />
      </Button>
    </div>
  );
};
