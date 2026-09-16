import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { driveMutations } from '@renderer/features/drive/mutations';
import { driveQueries } from '@renderer/features/drive/queries';
import type { DriveFolderCrumb } from '@renderer/features/drive/types';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronRightIcon, FolderIcon, FolderPlusIcon, HomeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DriveFolderPickerDialog(): React.JSX.Element {
  const request = useDialogStore((state) => state.driveFolderPicker);
  const closeDriveFolderPicker = useDialogStore((state) => state.closeDriveFolderPicker);

  const startParentId = request?.startParentId ?? 'root';
  const startPath = request?.startPath ?? 'My Drive';
  const currentFolderId = request?.currentFolderId;
  const currentFolderName = request?.currentFolderPath?.split('/').filter(Boolean).pop();

  const [breadcrumbs, setBreadcrumbs] = useState<DriveFolderCrumb[]>([{ id: startParentId, name: startPath }]);
  const [newFolderName, setNewFolderName] = useState('');

  const open = request !== null;
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  useEffect(() => {
    setNewFolderName('');
    if (!open) return;
    setBreadcrumbs(
      currentFolderId
        ? [
            { id: startParentId, name: startPath },
            { id: currentFolderId, name: currentFolderName ?? 'Current folder' },
          ]
        : [{ id: startParentId, name: startPath }],
    );
  }, [open, startParentId, startPath, currentFolderId, currentFolderName]);

  const { data: folders = [], isLoading } = useQuery(driveQueries.folders(currentFolder.id, open));
  const createFolderMutation = useMutation(driveMutations.createFolder(currentFolder.id));

  const openFolder = (folder: DriveFolderCrumb): void => {
    setBreadcrumbs((prev) => [...prev, folder]);
  };

  const goToBreadcrumb = (index: number): void => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = (): void => {
    const name = newFolderName.trim();
    if (!name) return;
    createFolderMutation.mutate(name, {
      onSuccess: () => setNewFolderName(''),
      onError: (error) => toast.add({ title: 'Failed to create folder', description: String(error), type: 'error' }),
    });
  };

  const handleSelect = async (): Promise<void> => {
    if (!request) return;
    const path = breadcrumbs.map((c) => c.name).join('/');
    await request.onSelect({ id: currentFolder.id, path });
    closeDriveFolderPicker();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeDriveFolderPicker()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a Drive folder</DialogTitle>
          <DialogDescription>Browse or create a folder in your Google Drive.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center gap-1">
              {index > 0 && <ChevronRightIcon className="size-3.5" />}
              <button type="button" className="hover:text-foreground hover:underline" onClick={() => goToBreadcrumb(index)}>
                {index === 0 ? <HomeIcon className="inline size-3.5" /> : crumb.name}
              </button>
            </span>
          ))}
        </div>
        {request?.currentFolderPath && <p className="truncate text-xs text-muted-foreground">Currently selected: {request.currentFolderPath}</p>}

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : folders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No folders here yet.</p>
          ) : (
            folders.map((folder) => (
              <button key={folder.id} type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => openFolder(folder)}>
                <FolderIcon className="size-4 text-muted-foreground" />
                {folder.name}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input placeholder="New folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          <Button variant="outline" disabled={createFolderMutation.isPending || !newFolderName.trim()} onClick={handleCreateFolder}>
            <FolderPlusIcon data-icon="inline-start" />
            Create
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => closeDriveFolderPicker()}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>Select This Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
