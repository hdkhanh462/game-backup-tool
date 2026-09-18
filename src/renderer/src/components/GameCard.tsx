import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { Progress } from '@renderer/components/ui/progress';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { backupApi } from '@renderer/features/backup/api';
import { useBackup } from '@renderer/features/backup/hooks/useBackup';
import { useGames } from '@renderer/features/games/hooks/useGames';
import type { GameCardProps } from '@renderer/features/games/types';
import { useSettings } from '@renderer/features/settings/hooks/useSettings';
import { api } from '@renderer/lib/api';
import { formatBytes } from '@renderer/lib/format';
import { useDialogStore } from '@renderer/store/useDialogStore';
import type { Game } from '@shared/types';
import type { TFunction } from 'i18next';
import { DownloadIcon, FolderOpenIcon, HistoryIcon, MoreVerticalIcon, PencilIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function statusBadge(game: Game, t: TFunction): React.JSX.Element {
  if (game.lastBackupStatus === 'success') {
    return <Badge variant="secondary">{t('games:card.statusBackedUp')}</Badge>;
  }
  if (game.lastBackupStatus === 'failed') {
    return <Badge variant="destructive">{t('games:card.statusFailed')}</Badge>;
  }
  return <Badge variant="outline">{t('games:card.statusNever')}</Badge>;
}

function phaseLabel(operationType: 'backup' | 'restore', phase: string, t: TFunction): string {
  if (phase === 'safetyBackup') return t('games:card.phaseBackingUpCurrent');
  if (operationType === 'restore') return t('games:card.phaseRestoring');
  return t('games:card.phaseBackingUp');
}

export function GameCard({ game }: GameCardProps): React.JSX.Element {
  const { t } = useTranslation(['common', 'games']);
  const { removeGame } = useGames();
  const { settings } = useSettings();
  const { status } = useAuthStatus();
  const isDriveConnected = status.state === 'connected';
  const openEditGameDialog = useDialogStore((state) => state.openEditGameDialog);
  const openBackupHistoryDialog = useDialogStore((state) => state.openBackupHistoryDialog);
  const openRestoreConfirmDialog = useDialogStore((state) => state.openRestoreConfirmDialog);
  const { operation, isBusy, runBackup, restoreVersion } = useBackup(game.id);
  const [isCheckingRestore, setIsCheckingRestore] = useState(false);

  const handleBackup = (): void => {
    runBackup({
      onSuccess: () => toast.add({ title: t('games:card.backedUpToast', { name: game.name }), type: 'success' }),
      onError: (error) => toast.add({ title: t('games:card.backupFailedToast'), description: String(error), type: 'error' }),
    });
  };

  const handleRestoreClick = async (): Promise<void> => {
    setIsCheckingRestore(true);
    try {
      const versions = await backupApi.listVersions(game.id);
      if (versions.length === 0) {
        toast.add({ title: t('games:card.noBackupsYet'), type: 'info' });
        return;
      }
      const latest = versions[0];
      if (!settings.confirmBeforeOverwrite) {
        restoreVersion(
          latest.id,
          { safetyBackup: settings.safetyBackupBeforeRestore, deleteExtraneous: true },
          {
            onSuccess: () => toast.add({ title: t('games:card.restoredToast', { name: game.name }), type: 'success' }),
            onError: (error) => toast.add({ title: t('games:card.restoreFailedToast'), description: String(error), type: 'error' }),
          },
        );
        return;
      }
      openRestoreConfirmDialog(game, latest);
    } finally {
      setIsCheckingRestore(false);
    }
  };

  const handleRemove = (): void => {
    removeGame(game.id, {
      onSuccess: () => toast.add({ title: t('games:card.removedToast', { name: game.name }), type: 'info' }),
      onError: (error) => toast.add({ title: t('games:card.removeFailedToast'), description: String(error), type: 'error' }),
    });
  };

  const progress = operation?.progress;
  const isPreTransfer = progress?.phase === 'scanning' || progress?.phase === 'diffing';
  const progressPercent = progress && !isPreTransfer && progress.bytesTotal > 0 ? Math.min(100, Math.round((progress.bytesDone / progress.bytesTotal) * 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{game.name}</CardTitle>
        {statusBadge(game, t)}
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p className="truncate">{t('games:card.local', { path: game.localPath })}</p>
        <p className="truncate">{t('games:card.drive', { path: game.driveFolderPath ?? t('games:card.driveNotSet') })}</p>
      </CardContent>
      {isBusy && operation && (
        <CardContent className="flex flex-col gap-1 pt-0">
          <Progress value={progressPercent} />
          <p className="text-xs text-muted-foreground">
            {phaseLabel(operation.type, progress?.phase ?? '', t)}
            {progress
              ? `… ${t('games:card.progressSummary', { filesDone: progress.filesDone, filesTotal: progress.filesTotal, bytesDone: formatBytes(progress.bytesDone), bytesTotal: formatBytes(progress.bytesTotal) })}`
              : '…'}
          </p>
        </CardContent>
      )}
      <CardFooter className="flex flex-wrap gap-2">
        <Button size="sm" disabled={isBusy || !isDriveConnected} onClick={handleBackup}>
          <UploadIcon data-icon="inline-start" />
          {t('actions.backup')}
        </Button>
        <Button size="sm" variant="outline" disabled={isBusy || isCheckingRestore || !isDriveConnected} onClick={handleRestoreClick}>
          {isCheckingRestore ? <Spinner data-icon="inline-start" /> : <DownloadIcon data-icon="inline-start" />}
          {t('actions.restore')}
        </Button>
        <Button size="sm" variant="outline" disabled={isBusy || !isDriveConnected} onClick={() => openBackupHistoryDialog(game)}>
          <HistoryIcon data-icon="inline-start" />
          {t('actions.history')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="ml-auto" />}>
            <MoreVerticalIcon />
            <span className="sr-only">{t('actions.moreActions')}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-48">
            <DropdownMenuItem onClick={() => api.system.openPath(game.localPath)}>
              <FolderOpenIcon data-icon="inline-start" />
              {t('actions.openSaveFolder')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isBusy} onClick={() => openEditGameDialog(game)}>
              <PencilIcon data-icon="inline-start" />
              {t('actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled={isBusy} onClick={handleRemove}>
              <TrashIcon data-icon="inline-start" />
              {t('actions.remove')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
