import { AddEditGameDialog } from '@renderer/components/AddEditGameDialog';
import { AddGameCard } from '@renderer/components/AddGameCard';
import { BackupHistoryDialog } from '@renderer/components/BackupHistoryDialog';
import { DriveFolderPickerDialog } from '@renderer/components/DriveFolderPickerDialog';
import { GameCard } from '@renderer/components/GameCard';
import { GoogleAccountBar } from '@renderer/components/GoogleAccountBar';
import { ImportGamesDialog } from '@renderer/components/ImportGamesDialog';
import { RestoreConfirmDialog } from '@renderer/components/RestoreConfirmDialog';
import { SettingsDialog } from '@renderer/components/SettingsDialog';
import { ThemeLanguageMenu } from '@renderer/components/ThemeLanguageMenu';
import { Button } from '@renderer/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { backupApi } from '@renderer/features/backup/api';
import { useOperationStore } from '@renderer/features/backup/operationStore';
import { useGames } from '@renderer/features/games/hooks/useGames';
import { useLocale } from '@renderer/features/settings/hooks/useLocale';
import { useTheme } from '@renderer/features/settings/hooks/useTheme';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { CloudDownloadIcon, PlusIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function App(): React.JSX.Element {
  useTheme();
  useLocale();
  const { t } = useTranslation();
  const { games } = useGames();
  const { status } = useAuthStatus();
  const openAddGameDialog = useDialogStore((state) => state.openAddGameDialog);
  const openImportGamesDialog = useDialogStore((state) => state.openImportGamesDialog);
  const setOperation = useOperationStore((state) => state.setOperation);

  useEffect(() => {
    backupApi.getActiveOperations().then((operations) => {
      for (const progress of operations) {
        setOperation(progress.gameId, { type: progress.op, progress });
      }
    });
  }, [setOperation]);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('appTitle')}</h1>
        <div className="flex items-center gap-2">
          {status.state === 'connected' && (
            <Button variant="outline" onClick={() => openImportGamesDialog()}>
              <CloudDownloadIcon data-icon="inline-start" />
              {t('actions.importFromDrive')}
            </Button>
          )}
          <ThemeLanguageMenu />
          <GoogleAccountBar />
        </div>
      </header>

      {games.length === 0 && status.state !== 'connected' ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PlusIcon />
            </EmptyMedia>
            <EmptyTitle>{t('games:empty.title')}</EmptyTitle>
            <EmptyDescription>{t('games:empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => openAddGameDialog()}>
              <PlusIcon data-icon="inline-start" />
              {t('actions.addGame')}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AddGameCard onClick={() => openAddGameDialog()} />
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      <AddEditGameDialog />
      <DriveFolderPickerDialog />
      <BackupHistoryDialog />
      <RestoreConfirmDialog />
      <SettingsDialog />
      <ImportGamesDialog />
    </div>
  );
}

export default App;
