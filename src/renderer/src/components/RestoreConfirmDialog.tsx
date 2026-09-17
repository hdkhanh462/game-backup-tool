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
import { useTranslation } from 'react-i18next';

export function RestoreConfirmDialog(): React.JSX.Element {
  const { t } = useTranslation(['common', 'backup']);
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
        onSuccess: () => toast.add({ title: t('backup:restoreConfirm.restoredToast', { name: game.name, version: version.name }), type: 'success' }),
        onError: (error) => toast.add({ title: t('backup:restoreConfirm.restoreFailedToast'), description: String(error), type: 'error' }),
      },
    );
    closeRestoreConfirmDialog();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeRestoreConfirmDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('backup:restoreConfirm.title', { name: game?.name })}</DialogTitle>
          <DialogDescription>{t('backup:restoreConfirm.description', { path: game?.localPath, date: version && new Date(version.createdAt).toLocaleString() })}</DialogDescription>
        </DialogHeader>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="safety-backup">{t('backup:restoreConfirm.safetyBackupLabel')}</FieldLabel>
          </FieldContent>
          <Switch id="safety-backup" checked={safetyBackup} onCheckedChange={setSafetyBackup} />
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => closeRestoreConfirmDialog()}>
            {t('actions.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={isRestorePending} onClick={handleConfirm}>
            {isRestorePending && <Spinner data-icon="inline-start" />}
            {t('actions.restore')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
