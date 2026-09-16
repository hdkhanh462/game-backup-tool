import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { api } from '@renderer/lib/api';
import type { DriveFolder } from '@shared/types';
import { ChevronRightIcon, FolderIcon, FolderPlusIcon, HomeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Crumb {
  id: string;
  name: string;
}

interface DriveFolderPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (folder: { id: string; path: string }) => void | Promise<void>;
  startParentId?: string;
  startPath?: string;
}

export function DriveFolderPickerDialog({ open, onOpenChange, onSelect, startParentId = 'root', startPath = 'My Drive' }: DriveFolderPickerDialogProps): React.JSX.Element {
  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([{ id: startParentId, name: startPath }]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  const loadFolders = async (parentId: string): Promise<void> => {
    setLoading(true);
    try {
      const result = await api.drive.listFolders(parentId);
      setFolders(result.folders);
    } catch (error) {
      toast.add({ title: 'Failed to load Drive folders', description: String(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setBreadcrumbs([{ id: startParentId, name: startPath }]);
    void loadFolders(startParentId);
  }, [open, startParentId, startPath]);

  const openFolder = (folder: DriveFolder): void => {
    setBreadcrumbs((prev) => [...prev, folder]);
    void loadFolders(folder.id);
  };

  const goToBreadcrumb = (index: number): void => {
    const next = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(next);
    void loadFolders(next[next.length - 1].id);
  };

  const handleCreateFolder = async (): Promise<void> => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    try {
      await api.drive.createFolder(newFolderName.trim(), currentFolder.id);
      setNewFolderName('');
      await loadFolders(currentFolder.id);
    } catch (error) {
      toast.add({ title: 'Failed to create folder', description: String(error), type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = async (): Promise<void> => {
    const path = breadcrumbs.map((c) => c.name).join('/');
    await onSelect({ id: currentFolder.id, path });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {loading ? (
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>Select This Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
