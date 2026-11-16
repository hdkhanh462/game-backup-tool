import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@renderer/components/ui/button';
import { DialogFooter } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Input } from '@renderer/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';
import type { GameFormProps, GameFormValues } from '@renderer/features/games/types';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { DEFAULT_GAME_FILTER, parseExtensions } from '@shared/gameFilter';
import type { GameFilterMode } from '@shared/types';
import { FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const EMPTY_VALUES: GameFormValues = { name: '', localPath: '', driveFolderId: null, driveFolderPath: null, filter: DEFAULT_GAME_FILTER };
const FILTER_MODES: GameFilterMode[] = ['none', 'blacklist', 'whitelist'];

export function GameForm({ defaultValues, isConnected, isPending, rootFolderId, rootFolderPath, onSubmit, onCancel }: GameFormProps): React.JSX.Element {
  const { t } = useTranslation(['common', 'games']);
  const openDriveFolderPicker = useDialogStore((state) => state.openDriveFolderPicker);

  const gameFormSchema = z.object({
    name: z.string().trim().min(1, t('games:form.nameRequired')),
    localPath: z.string().trim().min(1, t('games:form.localPathRequired')),
    driveFolderId: z.string().nullable(),
    driveFolderPath: z.string().nullable(),
    filter: z.object({ mode: z.enum(['none', 'blacklist', 'whitelist']), extensions: z.array(z.string()) }),
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  });

  const [extensionsText, setExtensionsText] = useState((defaultValues?.filter.extensions ?? []).map((e) => `.${e}`).join(', '));
  const [extensionsError, setExtensionsError] = useState(false);
  const [resolved, setResolved] = useState<{ ok: true; path: string } | { ok: false; error: string } | null>(null);
  const localPath = useWatch({ control, name: 'localPath' });
  const filterMode = useWatch({ control, name: 'filter.mode' });

  useEffect(() => {
    if (!localPath.trim()) {
      setResolved(null);
      return;
    }
    let cancelled = false;
    void api.system.expandPath(localPath).then((result) => {
      if (!cancelled) setResolved(result);
    });
    return () => {
      cancelled = true;
    };
  }, [localPath]);

  const handleBrowseLocal = async (onChange: (value: string) => void): Promise<void> => {
    const picked = await api.system.pickFolder();
    if (picked) onChange(await api.system.collapsePath(picked));
  };

  const submit = handleSubmit((values) => {
    const extensions = values.filter.mode === 'none' ? [] : parseExtensions(extensionsText);
    if (values.filter.mode === 'whitelist' && extensions.length === 0) {
      setExtensionsError(true);
      return;
    }
    setExtensionsError(false);
    onSubmit({ ...values, localPath: values.localPath.trim(), filter: { mode: values.filter.mode, extensions } });
  });

  return (
    <form className="contents" onSubmit={submit}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error || undefined}>
              <FieldLabel htmlFor="game-name">{t('games:form.nameLabel')}</FieldLabel>
              <FieldContent>
                <Input id="game-name" aria-invalid={!!fieldState.error || undefined} placeholder={t('games:form.namePlaceholder')} {...field} />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="localPath"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error || undefined}>
              <FieldLabel htmlFor="game-local-path">{t('games:form.localPathLabel')}</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-local-path" aria-invalid={!!fieldState.error || undefined} placeholder="%APPDATA%\\Game\\Saves" {...field} />
                  <Button type="button" variant="outline" onClick={() => handleBrowseLocal(field.onChange)}>
                    {t('actions.browse')}
                  </Button>
                </div>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                {resolved &&
                  (resolved.ok ? <p className="truncate text-xs text-muted-foreground">{t('games:form.resolvedPath', { path: resolved.path })}</p> : <FieldError>{resolved.error}</FieldError>)}
                <p className="text-xs text-muted-foreground">{t('games:form.localPathHint')}</p>
              </FieldContent>
            </Field>
          )}
        />

        <Field>
          <FieldLabel>{t('games:form.filterLabel')}</FieldLabel>
          <FieldContent>
            <Controller
              name="filter.mode"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {FILTER_MODES.map((mode) => (
                    <Button key={mode} type="button" size="sm" variant={field.value === mode ? 'default' : 'outline'} onClick={() => field.onChange(mode)}>
                      {t(`games:form.filterMode.${mode}`)}
                    </Button>
                  ))}
                </div>
              )}
            />
            {filterMode !== 'none' && (
              <>
                <Input
                  aria-invalid={extensionsError || undefined}
                  value={extensionsText}
                  placeholder=".log, .tmp, .bak"
                  onChange={(event) => {
                    setExtensionsText(event.target.value);
                    setExtensionsError(false);
                  }}
                />
                {extensionsError && <FieldError>{t('games:form.filterWhitelistRequired')}</FieldError>}
                <p className="text-xs text-muted-foreground">{t(`games:form.filterHint.${filterMode}`)}</p>
              </>
            )}
          </FieldContent>
        </Field>

        <Controller
          name="driveFolderPath"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="game-drive-path">{t('games:form.driveSubfolderLabel')}</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-drive-path" readOnly value={field.value ?? ''} placeholder={t('games:form.localPathPlaceholder')} />
                  {isConnected ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openDriveFolderPicker({
                          startParentId: rootFolderId ?? 'root',
                          startPath: rootFolderPath ?? 'My Drive',
                          currentFolderId: getValues('driveFolderId') ?? undefined,
                          currentFolderPath: getValues('driveFolderPath') ?? undefined,
                          onSelect: (folder) => {
                            setValue('driveFolderId', folder.id);
                            field.onChange(folder.path);
                          },
                        })
                      }
                    >
                      <FolderIcon data-icon="inline-start" />
                      {t('actions.choose')}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger render={<span tabIndex={0} />}>
                        <Button type="button" variant="outline" disabled className="pointer-events-none">
                          <FolderIcon data-icon="inline-start" />
                          {t('actions.choose')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('games:form.connectDriveFirst')}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('actions.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {t('actions.save')}
        </Button>
      </DialogFooter>
    </form>
  );
}
