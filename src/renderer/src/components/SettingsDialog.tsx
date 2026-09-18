import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Switch } from '@renderer/components/ui/switch';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import { useDialogStore } from '@renderer/store/useDialogStore';
import type { AppSettings } from '@shared/types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function SettingsDialog(): React.JSX.Element {
  const { t } = useTranslation(['common', 'settings']);
  const open = useDialogStore((state) => state.settingsDialog.open);
  const closeSettingsDialog = useDialogStore((state) => state.closeSettingsDialog);
  const { settings, updateSettings } = useSettings();

  const { control, handleSubmit, reset } = useForm<AppSettings>({ values: settings });

  const submit = handleSubmit((values) => {
    updateSettings(values, { onSuccess: () => closeSettingsDialog() });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset(settings);
          closeSettingsDialog();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings:title')}</DialogTitle>
        </DialogHeader>

        <form className="contents" onSubmit={submit}>
          <FieldGroup>
            <p className="text-sm font-medium">{t('settings:backup.sectionTitle')}</p>
            <Controller
              name="incrementalBackupEnabled"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="incremental-backup">{t('settings:backup.incremental')}</FieldLabel>
                  </FieldContent>
                  <Switch id="incremental-backup" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />

            <p className="text-sm font-medium">{t('settings:restore.sectionTitle')}</p>
            <Controller
              name="confirmBeforeOverwrite"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="confirm-overwrite">{t('settings:restore.confirmOverwrite')}</FieldLabel>
                  </FieldContent>
                  <Switch id="confirm-overwrite" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              name="safetyBackupBeforeRestore"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="safety-backup-default">{t('settings:restore.safetyBackupDefault')}</FieldLabel>
                  </FieldContent>
                  <Switch id="safety-backup-default" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset(settings);
                closeSettingsDialog();
              }}
            >
              {t('actions.cancel')}
            </Button>
            <Button type="submit">{t('actions.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
