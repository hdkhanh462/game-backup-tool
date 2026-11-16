import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty';
import { Input } from '@renderer/components/ui/input';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { useGames } from '@renderer/features/games/hooks/useGames';
import { gamesQueries } from '@renderer/features/games/queries';
import { api } from '@renderer/lib/api';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { DEFAULT_GAME_FILTER } from '@shared/gameFilter';
import type { DriveGameCandidate } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { CloudDownloadIcon, FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ImportGamesDialog(): React.JSX.Element {
  const { t } = useTranslation(['common', 'games']);
  const { open } = useDialogStore((state) => state.importGamesDialog);
  const closeImportGamesDialog = useDialogStore((state) => state.closeImportGamesDialog);
  const { status } = useAuthStatus();
  const { importGame, isImporting } = useGames();

  const [localPaths, setLocalPaths] = useState<Record<string, string>>({});
  const [prefilled, setPrefilled] = useState<Set<string>>(new Set());
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLocalPaths({});
      setPrefilled(new Set());
      setImportingId(null);
    }
  }, [open]);

  const { data: candidates = [], isLoading } = useQuery(gamesQueries.importCandidates(open && status.state === 'connected'));

  // Pre-fill with the path template another device saved to Drive (e.g. %APPDATA%\Game\Saves).
  useEffect(() => {
    const fresh = candidates.filter((c) => c.localPath && !prefilled.has(c.id));
    if (fresh.length === 0) return;
    setPrefilled((prev) => new Set([...prev, ...fresh.map((c) => c.id)]));
    setLocalPaths((prev) => {
      const next = { ...prev };
      for (const c of fresh) if (c.localPath && next[c.id] === undefined) next[c.id] = c.localPath;
      return next;
    });
  }, [candidates, prefilled]);

  const handleBrowse = async (candidateId: string): Promise<void> => {
    const picked = await api.system.pickFolder();
    if (!picked) return;
    const collapsed = await api.system.collapsePath(picked);
    setLocalPaths((prev) => ({ ...prev, [candidateId]: collapsed }));
  };

  const handleImport = (candidate: DriveGameCandidate): void => {
    const localPath = localPaths[candidate.id]?.trim();
    if (!localPath) return;
    setImportingId(candidate.id);
    importGame(
      { name: candidate.name, localPath, driveFolderId: candidate.id, driveFolderPath: candidate.path, filter: candidate.filter ?? DEFAULT_GAME_FILTER },
      {
        onSuccess: () => {
          toast.add({ title: t('games:import.importedToast', { name: candidate.name }), type: 'success' });
        },
        onError: (error) => {
          toast.add({ title: t('games:import.importFailedToast'), description: String(error), type: 'error' });
        },
        onSettled: () => setImportingId(null),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeImportGamesDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('games:import.title')}</DialogTitle>
          <DialogDescription>{t('games:import.description')}</DialogDescription>
        </DialogHeader>

        {status.state !== 'connected' ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('games:import.connectFirst')}</p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : candidates.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <CloudDownloadIcon />
            </EmptyMedia>
            <EmptyTitle>{t('games:import.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('games:import.emptyDescription')}</EmptyDescription>
          </Empty>
        ) : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex flex-col gap-2 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{candidate.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{candidate.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={localPaths[candidate.id] ?? ''}
                    onChange={(event) => setLocalPaths((prev) => ({ ...prev, [candidate.id]: event.target.value }))}
                    placeholder={t('games:form.localPathPlaceholder')}
                    className="min-w-0 flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => handleBrowse(candidate.id)}>
                    <FolderIcon data-icon="inline-start" />
                    {t('actions.browse')}
                  </Button>
                  <Button type="button" size="sm" disabled={!localPaths[candidate.id] || (isImporting && importingId === candidate.id)} onClick={() => handleImport(candidate)}>
                    {t('actions.import')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
