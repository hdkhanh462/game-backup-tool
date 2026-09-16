import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRightIcon, FolderIcon, FolderPlusIcon, HomeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Crumb {
  id: string;
  name: string;
}

export function DriveFolderPickerDialog(): React.JSX.Element {
  const request = useDialogStore((state) => state.driveFolderPicker);
  const closeDriveFolderPicker = useDialogStore((state) => state.closeDriveFolderPicker);
  const queryClient = useQueryClient();

  const startParentId = request?.startParentId ?? 'root';
  const startPath = request?.startPath ?? 'My Drive';

  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([{ id: startParentId, name: startPath }]);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  const open = request !== null;
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  useEffect(() => {
    if (open) setBreadcrumbs([{ id: startParentId, name: startPath }]);
  }, [open, startParentId, startPath]);

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['drive', 'folders', currentFolder.id],
    queryFn: () => api.drive.listFolders(currentFolder.id).then((res) => res.folders),
    enabled: open,
  });

  const openFolder = (folder: Crumb): void => {
    setBreadcrumbs((prev) => [...prev, folder]);
  };

  const goToBreadcrumb = (index: number): void => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = async (): Promise<void> => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    try {
      await api.drive.createFolder(newFolderName.trim(), currentFolder.id);
      setNewFolderName('');
      await queryClient.invalidateQueries({ queryKey: ['drive', 'folders', currentFolder.id] });
    } catch (error) {
      toast.add({ title: 'Failed to create folder', description: String(error), type: 'error' });
    } finally {
      setCreating(false);
    }
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
          <Button variant="outline" disabled={creating || !newFolderName.trim()} onClick={handleCreateFolder}>
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
