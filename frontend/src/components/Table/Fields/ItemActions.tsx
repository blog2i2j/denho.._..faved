import React from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { EllipsisVertical, Maximize } from 'lucide-react';
import { ActionType } from '@/lib/types.ts';
import { DeleteDialog } from '@/components/Table/Controls/DeleteDialog.tsx';

export const ItemsActions = ({ row }) => {
  const itemId = row.original.id;
  const store = React.useContext(StoreContext);
  const handleEdit = () => {
    store.setType(ActionType.EDIT);
    store.setIsShowEditModal(true);
    store.setIdItem(itemId);
  };

  const handleMakeCopy = async () => {
    const result = await store.createItem(row.original);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  const handleRefetch = async () => {
    const result = await store.refetchItemsMetadata([row.original.id]);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  const handleDelete = async () => {
    const result = await store.deleteItems([itemId]);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  return (
    <div className="flex gap-1">
      <Button onClick={handleEdit} variant="outline" className="onhover-visible">
        <Maximize />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="onhover-visible !pr-1.5 !pl-1.5">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleRefetch}>Refetch metadata</DropdownMenuItem>
          <DropdownMenuItem onClick={handleMakeCopy}>Make a copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteDialog onConfirm={handleDelete} itemsCount={1}>
            <div className="focus:bg-accent focus:text-accent-foreground hover:bg-destructive/90 relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              Delete
            </div>
          </DeleteDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
