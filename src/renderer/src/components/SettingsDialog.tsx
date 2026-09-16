import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select';
import { Switch } from '@renderer/components/ui/switch';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import { useDialogStore } from '@renderer/store/useDialogStore';
import type { AppSettings } from '@shared/types';
import { Controller, useForm } from 'react-hook-form';

const THEME_LABELS: Record<string, string> = { light: 'Light', dark: 'Dark', system: 'System' };
const LANGUAGE_LABELS: Record<string, string> = { en: 'English' };

export function SettingsDialog(): React.JSX.Element {
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
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <form className="contents" onSubmit={submit}>
          <FieldGroup>
            <p className="text-sm font-medium">Backup</p>
            <Controller
              name="incrementalBackupEnabled"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="incremental-backup">Incremental backups</FieldLabel>
                  </FieldContent>
                  <Switch id="incremental-backup" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />

            <p className="text-sm font-medium">Restore</p>
            <Controller
              name="confirmBeforeOverwrite"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="confirm-overwrite">Confirm before overwriting saves</FieldLabel>
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
                    <FieldLabel htmlFor="safety-backup-default">Back up current save before restoring</FieldLabel>
                  </FieldContent>
                  <Switch id="safety-backup-default" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />

            <p className="text-sm font-medium">General</p>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Theme</FieldLabel>
                  <FieldContent>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => THEME_LABELS[value] ?? value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
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
                  <FieldLabel>Language</FieldLabel>
                  <FieldContent>
                    <Select value={field.value ?? 'en'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => LANGUAGE_LABELS[value] ?? value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
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
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
