import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useBackup } from '@renderer/features/backup/hooks/useBackup';
import { useBackupVersions } from '@renderer/features/backup/hooks/useBackupVersions';
import { formatBytes } from '@renderer/lib/format';
import { useDialogStore } from '@renderer/store/useDialogStore';
import type { BackupVersion } from '@shared/types';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function BackupHistoryDialog(): React.JSX.Element {
  const { t } = useTranslation(['common', 'backup']);
  const { open, game } = useDialogStore((state) => state.backupHistoryDialog);
  const closeBackupHistoryDialog = useDialogStore((state) => state.closeBackupHistoryDialog);
  const openRestoreConfirmDialog = useDialogStore((state) => state.openRestoreConfirmDialog);
  const gameId = game?.id ?? '';
  const { versions, isLoading, deleteVersion, isDeleting } = useBackupVersions(gameId, open);
  const { isBusy } = useBackup(gameId);
  const [pendingDelete, setPendingDelete] = useState<BackupVersion | null>(null);

  const handleConfirmDelete = (): void => {
    if (!pendingDelete) return;
    const { id, name } = pendingDelete;
    deleteVersion(id, {
      onSuccess: () => toast.add({ title: t('backup:history.deletedToast', { name }), type: 'info' }),
      onError: (error) => toast.add({ title: t('backup:history.deleteFailedToast'), description: String(error), type: 'error' }),
      onSettled: () => setPendingDelete(null),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && closeBackupHistoryDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backup:history.title', { name: game?.name })}</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : versions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('backup:history.empty')}</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {versions.map((version) => (
                <li key={version.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{version.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t('backup:history.summary', { device: version.device, fileCount: version.fileCount, size: formatBytes(version.totalBytes) })}
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
                      {t('actions.restore')}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isBusy || isDeleting} onClick={() => setPendingDelete(version)}>
                      {isDeleting && pendingDelete?.id === version.id ? <Spinner /> : <TrashIcon />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(next) => !next && !isDeleting && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backup:history.deleteTitle')}</DialogTitle>
            <DialogDescription>{pendingDelete && t('backup:history.deleteConfirm', { name: pendingDelete.name })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setPendingDelete(null)}>
              {t('actions.cancel')}
            </Button>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleConfirmDelete}>
              {isDeleting && <Spinner data-icon="inline-start" />}
              {t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
