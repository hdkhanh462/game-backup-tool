import { AddEditGameDialog } from '@renderer/components/AddEditGameDialog';
import { DriveFolderPickerDialog } from '@renderer/components/DriveFolderPickerDialog';
import { GameCard } from '@renderer/components/GameCard';
import { GoogleAccountBar } from '@renderer/components/GoogleAccountBar';
import { Button } from '@renderer/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty';
import { useGames } from '@renderer/hooks/useGames';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { PlusIcon } from 'lucide-react';

function App(): React.JSX.Element {
  const { games } = useGames();
  const openAddGameDialog = useDialogStore((state) => state.openAddGameDialog);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">GameSave Backup</h1>
        <GoogleAccountBar />
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
    </div>
  );
}

export default App;
