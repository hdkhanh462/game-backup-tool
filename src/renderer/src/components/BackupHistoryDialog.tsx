import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useBackup } from '@renderer/features/backup/hooks/useBackup';
import { useBackupVersions } from '@renderer/features/backup/hooks/useBackupVersions';
import { formatBytes } from '@renderer/lib/format';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { TrashIcon } from 'lucide-react';

export function BackupHistoryDialog(): React.JSX.Element {
  const { open, game } = useDialogStore((state) => state.backupHistoryDialog);
  const closeBackupHistoryDialog = useDialogStore((state) => state.closeBackupHistoryDialog);
  const openRestoreConfirmDialog = useDialogStore((state) => state.openRestoreConfirmDialog);
  const gameId = game?.id ?? '';
  const { versions, isLoading, deleteVersion } = useBackupVersions(gameId, open);
  const { isBusy } = useBackup(gameId);

  const handleDelete = (versionId: string, name: string): void => {
    if (!window.confirm(`Permanently delete backup version "${name}"? This cannot be undone.`)) return;
    deleteVersion(versionId, {
      onSuccess: () => toast.add({ title: `Version ${name} deleted`, type: 'info' }),
      onError: (error) => toast.add({ title: 'Failed to delete version', description: String(error), type: 'error' }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeBackupHistoryDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backup history — {game?.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : versions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No backups yet.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {versions.map((version) => (
              <li key={version.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{version.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {version.device} · {version.fileCount} files · {formatBytes(version.totalBytes)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => {
                      if (!game) return;
                      closeBackupHistoryDialog();
                      openRestoreConfirmDialog(game, version);
                    }}
                  >
                    Restore
                  </Button>
                  <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => handleDelete(version.id, version.name)}>
                    <TrashIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
