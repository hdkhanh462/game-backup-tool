import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldLabel } from '@renderer/components/ui/field';
import { Spinner } from '@renderer/components/ui/spinner';
import { Switch } from '@renderer/components/ui/switch';
import { toast } from '@renderer/components/ui/toast';
import { useBackup } from '@renderer/features/backup/hooks/useBackup';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { useEffect, useState } from 'react';

export function RestoreConfirmDialog(): React.JSX.Element {
  const { open, game, version } = useDialogStore((state) => state.restoreConfirmDialog);
  const closeRestoreConfirmDialog = useDialogStore((state) => state.closeRestoreConfirmDialog);
  const { settings } = useSettings();
  const { restoreVersion, isRestorePending } = useBackup(game?.id ?? '');
  const [safetyBackup, setSafetyBackup] = useState(settings.safetyBackupBeforeRestore);

  useEffect(() => {
    if (open) setSafetyBackup(settings.safetyBackupBeforeRestore);
  }, [open, settings.safetyBackupBeforeRestore]);

  const handleConfirm = (): void => {
    if (!game || !version) return;
    restoreVersion(
      version.id,
      { safetyBackup, deleteExtraneous: true },
      {
        onSuccess: () => toast.add({ title: `${game.name} restored to ${version.name}`, type: 'success' }),
        onError: (error) => toast.add({ title: 'Restore failed', description: String(error), type: 'error' }),
      },
    );
    closeRestoreConfirmDialog();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeRestoreConfirmDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore {game?.name}?</DialogTitle>
          <DialogDescription>
            This will overwrite the save files in &quot;{game?.localPath}&quot; with the version from {version && new Date(version.createdAt).toLocaleString()}. Local files that are not part of this
            backup will be removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="safety-backup">Back up current save before restoring</FieldLabel>
          </FieldContent>
          <Switch id="safety-backup" checked={safetyBackup} onCheckedChange={setSafetyBackup} />
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => closeRestoreConfirmDialog()}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={isRestorePending} onClick={handleConfirm}>
            {isRestorePending && <Spinner data-icon="inline-start" />}
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
