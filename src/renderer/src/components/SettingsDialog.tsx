import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select';
import { Switch } from '@renderer/components/ui/switch';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import { useDialogStore } from '@renderer/store/useDialogStore';
import type { AppSettings } from '@shared/types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function SettingsDialog(): React.JSX.Element {
  const { t } = useTranslation(['common', 'settings']);
  const THEME_LABELS: Record<string, string> = { light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') };
  const LANGUAGE_LABELS: Record<string, string> = { en: t('language.en'), vi: t('language.vi') };
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

            <p className="text-sm font-medium">{t('settings:general.sectionTitle')}</p>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t('theme.label')}</FieldLabel>
                  <FieldContent>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => THEME_LABELS[value] ?? value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t('theme.light')}</SelectItem>
                        <SelectItem value="dark">{t('theme.dark')}</SelectItem>
                        <SelectItem value="system">{t('theme.system')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t('language.label')}</FieldLabel>
                  <FieldContent>
                    <Select value={field.value ?? 'en'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => LANGUAGE_LABELS[value] ?? value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('language.en')}</SelectItem>
                        <SelectItem value="vi">{t('language.vi')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
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
