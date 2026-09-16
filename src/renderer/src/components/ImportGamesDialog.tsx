import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty';
import { Input } from '@renderer/components/ui/input';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { useGames } from '@renderer/features/games/hooks/useGames';
import { gamesQueries } from '@renderer/features/games/queries';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { useQuery } from '@tanstack/react-query';
import { CloudDownloadIcon, FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ImportGamesDialog(): React.JSX.Element {
  const { open } = useDialogStore((state) => state.importGamesDialog);
  const closeImportGamesDialog = useDialogStore((state) => state.closeImportGamesDialog);
  const { status } = useAuthStatus();
  const { importGame, isImporting } = useGames();

  const [localPaths, setLocalPaths] = useState<Record<string, string>>({});
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLocalPaths({});
      setImportingId(null);
    }
  }, [open]);

  const { data: candidates = [], isLoading } = useQuery(gamesQueries.importCandidates(open && status.state === 'connected'));

  const handleBrowse = async (candidateId: string): Promise<void> => {
    const picked = await api.system.pickFolder();
    if (picked) setLocalPaths((prev) => ({ ...prev, [candidateId]: picked }));
  };

  const handleImport = (candidate: { id: string; name: string; path: string }): void => {
    const localPath = localPaths[candidate.id];
    if (!localPath) return;
    setImportingId(candidate.id);
    importGame(
      { name: candidate.name, localPath, driveFolderId: candidate.id, driveFolderPath: candidate.path },
      {
        onSuccess: () => {
          toast.add({ title: `${candidate.name} imported`, type: 'success' });
        },
        onError: (error) => {
          toast.add({ title: 'Failed to import game', description: String(error), type: 'error' });
        },
        onSettled: () => setImportingId(null),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeImportGamesDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import games from Drive</DialogTitle>
          <DialogDescription>Games backed up from another device show up here. Pick a local save folder to link each one on this device.</DialogDescription>
        </DialogHeader>

        {status.state !== 'connected' ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Connect Google Drive first.</p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : candidates.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <CloudDownloadIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing to import</EmptyTitle>
            <EmptyDescription>Every backup folder in your Drive is already linked to a game here.</EmptyDescription>
          </Empty>
        ) : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex flex-col gap-2 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{candidate.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{candidate.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input readOnly value={localPaths[candidate.id] ?? ''} placeholder="Not selected" className="min-w-0 flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={() => handleBrowse(candidate.id)}>
                    <FolderIcon data-icon="inline-start" />
                    Browse
                  </Button>
                  <Button type="button" size="sm" disabled={!localPaths[candidate.id] || (isImporting && importingId === candidate.id)} onClick={() => handleImport(candidate)}>
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
