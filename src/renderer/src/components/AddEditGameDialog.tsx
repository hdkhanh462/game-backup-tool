import { GameForm } from '@renderer/components/GameForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { useGames } from '@renderer/features/games/hooks/useGames';
import type { GameFormValues } from '@renderer/features/games/types';
import { useDialogStore } from '@renderer/store/useDialogStore';

export function AddEditGameDialog(): React.JSX.Element {
  const { open, game } = useDialogStore((state) => state.gameDialog);
  const closeGameDialog = useDialogStore((state) => state.closeGameDialog);
  const { status } = useAuthStatus();
  const { addGame, updateGame, isAdding, isUpdating } = useGames();

  const handleSubmit = (values: GameFormValues): void => {
    const onSuccess = (): void => {
      toast.add({ title: `${values.name} ${game ? 'updated' : 'added'}`, type: 'success' });
      closeGameDialog();
    };
    const onError = (error: Error): void => {
      toast.add({ title: game ? 'Failed to update game' : 'Failed to add game', description: String(error), type: 'error' });
    };

    if (game) {
      updateGame({ id: game.id, patch: values }, { onSuccess, onError });
    } else {
      addGame(values, { onSuccess, onError });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeGameDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : 'Add Game'}</DialogTitle>
        </DialogHeader>

        {open && (
          <GameForm
            key={game?.id ?? 'new'}
            defaultValues={game ? { name: game.name, localPath: game.localPath, driveFolderId: game.driveFolderId, driveFolderPath: game.driveFolderPath } : undefined}
            isConnected={status.state === 'connected'}
            isPending={isAdding || isUpdating}
            rootFolderId={status.rootFolderId}
            rootFolderPath={status.rootFolderPath}
            onSubmit={handleSubmit}
            onCancel={closeGameDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
