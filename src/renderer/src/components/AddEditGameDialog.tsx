import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Input } from '@renderer/components/ui/input';
import { toast } from '@renderer/components/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';
import { useAuthStatus } from '@renderer/hooks/useAuthStatus';
import { useGames } from '@renderer/hooks/useGames';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { FolderIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const gameFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  localPath: z.string().trim().min(1, 'Choose the local save folder.'),
  driveFolderId: z.string().nullable(),
  driveFolderPath: z.string().nullable(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

const EMPTY_VALUES: GameFormValues = { name: '', localPath: '', driveFolderId: null, driveFolderPath: null };

export function AddEditGameDialog(): React.JSX.Element {
  const { open, game } = useDialogStore((state) => state.gameDialog);
  const closeGameDialog = useDialogStore((state) => state.closeGameDialog);
  const openDriveFolderPicker = useDialogStore((state) => state.openDriveFolderPicker);
  const { status } = useAuthStatus();
  const { addGame, updateGame } = useGames();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(game ? { name: game.name, localPath: game.localPath, driveFolderId: game.driveFolderId, driveFolderPath: game.driveFolderPath } : EMPTY_VALUES);
  }, [open, game, reset]);

  const driveFolderPath = watch('driveFolderPath');
  const isConnected = status.state === 'connected';

  const handleBrowseLocal = async (): Promise<void> => {
    const picked = await api.system.pickFolder();
    if (picked) setValue('localPath', picked, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (game) {
      await updateGame(game.id, values);
      toast.add({ title: `${values.name} updated`, type: 'success' });
    } else {
      await addGame(values);
      toast.add({ title: `${values.name} added`, type: 'success' });
    }
    closeGameDialog();
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeGameDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : 'Add Game'}</DialogTitle>
        </DialogHeader>

        <form className="contents" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="game-name">Name</FieldLabel>
              <FieldContent>
                <Input id="game-name" aria-invalid={!!errors.name || undefined} placeholder="Cyberpunk 2077" {...register('name')} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.localPath || undefined}>
              <FieldLabel htmlFor="game-local-path">Local Save Folder</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-local-path" aria-invalid={!!errors.localPath || undefined} readOnly placeholder="Not selected" {...register('localPath')} />
                  <Button type="button" variant="outline" onClick={handleBrowseLocal}>
                    Browse
                  </Button>
                </div>
                {errors.localPath && <FieldError>{errors.localPath.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="game-drive-path">Drive Subfolder</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-drive-path" readOnly value={driveFolderPath ?? ''} placeholder="Not selected" />
                  {isConnected ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openDriveFolderPicker({
                          startParentId: status.rootFolderId ?? 'root',
                          startPath: status.rootFolderPath ?? 'My Drive',
                          onSelect: (folder) => {
                            setValue('driveFolderId', folder.id);
                            setValue('driveFolderPath', folder.path);
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
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeGameDialog()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
