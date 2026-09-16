import { GameForm } from '@renderer/components/GameForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/useAuthStatus';
import type { GameFormValues } from '@renderer/features/games/types';
import { useGames } from '@renderer/features/games/useGames';
import { useDialogStore } from '@renderer/store/useDialogStore';

export function AddEditGameDialog(): React.JSX.Element {
  const { open, game } = useDialogStore((state) => state.gameDialog);
  const closeGameDialog = useDialogStore((state) => state.closeGameDialog);
  const { status } = useAuthStatus();
  const { addGame, updateGame } = useGames();

  const handleSubmit = async (values: GameFormValues): Promise<void> => {
    if (game) {
      await updateGame(game.id, values);
      toast.add({ title: `${values.name} updated`, type: 'success' });
    } else {
      await addGame(values);
      toast.add({ title: `${values.name} added`, type: 'success' });
    }
    closeGameDialog();
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
