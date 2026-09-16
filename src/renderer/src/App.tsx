import { AddEditGameDialog } from '@renderer/components/AddEditGameDialog';
import { GameCard } from '@renderer/components/GameCard';
import { GoogleAccountBar } from '@renderer/components/GoogleAccountBar';
import { Button } from '@renderer/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty';
import { toast } from '@renderer/components/ui/toast';
import { AuthProvider } from '@renderer/hooks/useAuthStatus';
import { useGames } from '@renderer/hooks/useGames';
import type { Game, GameInput } from '@shared/types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

function Dashboard(): React.JSX.Element {
  const { games, addGame, updateGame, removeGame } = useGames();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const openAddDialog = (): void => {
    setEditingGame(null);
    setDialogOpen(true);
  };

  const openEditDialog = (game: Game): void => {
    setEditingGame(game);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: GameInput): Promise<void> => {
    if (editingGame) {
      await updateGame(editingGame.id, input);
      toast.add({ title: `${input.name} updated`, type: 'success' });
    } else {
      await addGame(input);
      toast.add({ title: `${input.name} added`, type: 'success' });
    }
  };

  const handleRemove = async (game: Game): Promise<void> => {
    await removeGame(game.id);
    toast.add({ title: `${game.name} removed`, type: 'info' });
  };

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
            <Button onClick={openAddDialog}>
              <PlusIcon data-icon="inline-start" />
              Add Game
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onEdit={openEditDialog} onRemove={handleRemove} />
            ))}
          </div>
          <Button className="self-start" onClick={openAddDialog}>
            <PlusIcon data-icon="inline-start" />
            Add Game
          </Button>
        </>
      )}

      <AddEditGameDialog open={dialogOpen} onOpenChange={setDialogOpen} game={editingGame} onSubmit={handleSubmit} />
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
