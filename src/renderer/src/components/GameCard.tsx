import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Progress } from '@renderer/components/ui/progress';
import { toast } from '@renderer/components/ui/toast';
import { backupApi } from '@renderer/features/backup/api';
import { useBackup } from '@renderer/features/backup/hooks/useBackup';
import { useGames } from '@renderer/features/games/hooks/useGames';
import type { GameCardProps } from '@renderer/features/games/types';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import { api } from '@renderer/lib/api';
import { formatBytes } from '@renderer/lib/format';
import { useDialogStore } from '@renderer/store/useDialogStore';
import type { Game } from '@shared/types';
import { FolderOpenIcon, HistoryIcon, PencilIcon, TrashIcon, UploadIcon } from 'lucide-react';

function statusBadge(game: Game): React.JSX.Element {
  if (game.lastBackupStatus === 'success') {
    return <Badge variant="secondary">Backed up</Badge>;
  }
  if (game.lastBackupStatus === 'failed') {
    return <Badge variant="destructive">Backup failed</Badge>;
  }
  return <Badge variant="outline">Never backed up</Badge>;
}

function phaseLabel(operationType: 'backup' | 'restore', phase: string): string {
  if (phase === 'safetyBackup') return 'Backing up current save';
  if (operationType === 'restore') return 'Restoring';
  return 'Backing up';
}

export function GameCard({ game }: GameCardProps): React.JSX.Element {
  const { removeGame } = useGames();
  const { settings } = useSettings();
  const openEditGameDialog = useDialogStore((state) => state.openEditGameDialog);
  const openBackupHistoryDialog = useDialogStore((state) => state.openBackupHistoryDialog);
  const openRestoreConfirmDialog = useDialogStore((state) => state.openRestoreConfirmDialog);
  const { operation, isBusy, runBackup, restoreVersion } = useBackup(game.id);

  const handleBackup = (): void => {
    runBackup({
      onSuccess: () => toast.add({ title: `${game.name} backed up`, type: 'success' }),
      onError: (error) => toast.add({ title: 'Backup failed', description: String(error), type: 'error' }),
    });
  };

  const handleRestoreClick = async (): Promise<void> => {
    const versions = await backupApi.listVersions(game.id);
    if (versions.length === 0) {
      toast.add({ title: 'No backups yet', type: 'info' });
      return;
    }
    const latest = versions[0];
    if (!settings.confirmBeforeOverwrite) {
      restoreVersion(
        latest.id,
        { safetyBackup: settings.safetyBackupBeforeRestore, deleteExtraneous: true },
        {
          onSuccess: () => toast.add({ title: `${game.name} restored`, type: 'success' }),
          onError: (error) => toast.add({ title: 'Restore failed', description: String(error), type: 'error' }),
        },
      );
      return;
    }
    openRestoreConfirmDialog(game, latest);
  };

  const handleRemove = (): void => {
    removeGame(game.id, {
      onSuccess: () => toast.add({ title: `${game.name} removed`, type: 'info' }),
      onError: (error) => toast.add({ title: 'Failed to remove game', description: String(error), type: 'error' }),
    });
  };

  const progress = operation?.progress;
  const progressPercent = progress && progress.bytesTotal > 0 ? Math.round((progress.bytesDone / progress.bytesTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{game.name}</CardTitle>
        {statusBadge(game)}
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p className="truncate">Local: {game.localPath}</p>
        <p className="truncate">Drive: {game.driveFolderPath ?? 'Not set'}</p>
      </CardContent>
      {isBusy && operation && (
        <CardContent className="flex flex-col gap-1 pt-0">
          <Progress value={progressPercent} />
          <p className="text-xs text-muted-foreground">
            {phaseLabel(operation.type, progress?.phase ?? '')}
            {progress ? `… ${progress.filesDone}/${progress.filesTotal} files, ${formatBytes(progress.bytesDone)}/${formatBytes(progress.bytesTotal)}` : '…'}
          </p>
        </CardContent>
      )}
      <CardFooter className="flex flex-wrap gap-2">
        <Button size="sm" disabled={isBusy} onClick={handleBackup}>
          <UploadIcon data-icon="inline-start" />
          Backup
        </Button>
        <Button size="sm" variant="outline" disabled={isBusy} onClick={handleRestoreClick}>
          Restore
        </Button>
        <Button size="sm" variant="outline" disabled={isBusy} onClick={() => openBackupHistoryDialog(game)}>
          <HistoryIcon data-icon="inline-start" />
          History
        </Button>
        <Button size="sm" variant="ghost" onClick={() => api.system.openPath(game.localPath)}>
          <FolderOpenIcon data-icon="inline-start" />
          Open Save Folder
        </Button>
        <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => openEditGameDialog(game)}>
          <PencilIcon data-icon="inline-start" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" disabled={isBusy} onClick={handleRemove}>
          <TrashIcon data-icon="inline-start" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
}
