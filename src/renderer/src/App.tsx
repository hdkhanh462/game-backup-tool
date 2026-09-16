import { AddEditGameDialog } from '@renderer/components/AddEditGameDialog';
import { BackupHistoryDialog } from '@renderer/components/BackupHistoryDialog';
import { DriveFolderPickerDialog } from '@renderer/components/DriveFolderPickerDialog';
import { GameCard } from '@renderer/components/GameCard';
import { GoogleAccountBar } from '@renderer/components/GoogleAccountBar';
import { RestoreConfirmDialog } from '@renderer/components/RestoreConfirmDialog';
import { SettingsDialog } from '@renderer/components/SettingsDialog';
import { Button } from '@renderer/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty';
import { useGames } from '@renderer/hooks/useGames';
import { useTheme } from '@renderer/hooks/useTheme';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { useOperationStore } from '@renderer/store/useOperationStore';
import { PlusIcon, SettingsIcon } from 'lucide-react';
import { useEffect } from 'react';

function App(): React.JSX.Element {
  useTheme();
  const { games } = useGames();
  const openAddGameDialog = useDialogStore((state) => state.openAddGameDialog);
  const openSettingsDialog = useDialogStore((state) => state.openSettingsDialog);
  const setOperation = useOperationStore((state) => state.setOperation);

  useEffect(() => {
    api.backup.getActiveOperations().then((operations) => {
      for (const progress of operations) {
        setOperation(progress.gameId, { type: progress.op, progress });
      }
    });
  }, [setOperation]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">GameSave Backup</h1>
        <div className="flex items-center gap-2">
          <GoogleAccountBar />
          <Button size="icon" variant="ghost" onClick={() => openSettingsDialog()}>
            <SettingsIcon />
          </Button>
        </div>
      </header>

      {games.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PlusIcon />
            </EmptyMedia>
            <EmptyTitle>No games yet</EmptyTitle>
            <EmptyDescription>Add a game to start managing its save backups.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => openAddGameDialog()}>
              <PlusIcon data-icon="inline-start" />
              Add Game
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <Button className="self-start" onClick={() => openAddGameDialog()}>
            <PlusIcon data-icon="inline-start" />
            Add Game
          </Button>
        </>
      )}

      <AddEditGameDialog />
      <DriveFolderPickerDialog />
      <BackupHistoryDialog />
      <RestoreConfirmDialog />
      <SettingsDialog />
    </div>
  );
}

export default App;
