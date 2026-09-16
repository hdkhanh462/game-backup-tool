import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@renderer/components/ui/button';
import { DialogFooter } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Input } from '@renderer/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';
import type { GameFormProps, GameFormValues } from '@renderer/features/games/types';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { FolderIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const gameFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  localPath: z.string().trim().min(1, 'Choose the local save folder.'),
  driveFolderId: z.string().nullable(),
  driveFolderPath: z.string().nullable(),
});

const EMPTY_VALUES: GameFormValues = { name: '', localPath: '', driveFolderId: null, driveFolderPath: null };

export function GameForm({ defaultValues, isConnected, isPending, rootFolderId, rootFolderPath, onSubmit, onCancel }: GameFormProps): React.JSX.Element {
  const openDriveFolderPicker = useDialogStore((state) => state.openDriveFolderPicker);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  });

  const handleBrowseLocal = async (onChange: (value: string) => void): Promise<void> => {
    const picked = await api.system.pickFolder();
    if (picked) onChange(picked);
  };

  const submit = handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form className="contents" onSubmit={submit}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error || undefined}>
              <FieldLabel htmlFor="game-name">Name</FieldLabel>
              <FieldContent>
                <Input id="game-name" aria-invalid={!!fieldState.error || undefined} placeholder="Cyberpunk 2077" {...field} />
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
              <FieldLabel htmlFor="game-local-path">Local Save Folder</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-local-path" aria-invalid={!!fieldState.error || undefined} readOnly placeholder="Not selected" {...field} />
                  <Button type="button" variant="outline" onClick={() => handleBrowseLocal(field.onChange)}>
                    Browse
                  </Button>
                </div>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="driveFolderPath"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="game-drive-path">Drive Subfolder</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-drive-path" readOnly value={field.value ?? ''} placeholder="Not selected" />
                  {isConnected ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openDriveFolderPicker({
                          startParentId: rootFolderId ?? 'root',
                          startPath: rootFolderPath ?? 'My Drive',
                          onSelect: (folder) => {
                            setValue('driveFolderId', folder.id);
                            field.onChange(folder.path);
                          },
                        })
                      }
                    >
                      <FolderIcon data-icon="inline-start" />
                      Choose
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger render={<span tabIndex={0} />}>
                        <Button type="button" variant="outline" disabled className="pointer-events-none">
                          <FolderIcon data-icon="inline-start" />
                          Choose
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Connect Google Drive first</TooltipContent>
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
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
