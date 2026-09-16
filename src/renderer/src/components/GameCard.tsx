import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';
import { api } from '@renderer/lib/api';
import type { Game } from '@shared/types';
import { FolderOpenIcon, HistoryIcon, PencilIcon, TrashIcon, UploadIcon } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onEdit: (game: Game) => void;
  onRemove: (game: Game) => void;
}

function statusBadge(game: Game): React.JSX.Element {
  if (game.lastBackupStatus === 'success') {
    return <Badge variant="secondary">Backed up</Badge>;
  }
  if (game.lastBackupStatus === 'failed') {
    return <Badge variant="destructive">Backup failed</Badge>;
  }
  return <Badge variant="outline">Never backed up</Badge>;
}

export function GameCard({ game, onEdit, onRemove }: GameCardProps): React.JSX.Element {
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
      <CardFooter className="flex flex-wrap gap-2">
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0} />}>
            <Button size="sm" disabled className="pointer-events-none">
              <UploadIcon data-icon="inline-start" />
              Backup
            </Button>
          </TooltipTrigger>
          <TooltipContent>Available in a future update</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0} />}>
            <Button size="sm" variant="outline" disabled className="pointer-events-none">
              Restore
            </Button>
          </TooltipTrigger>
          <TooltipContent>Available in a future update</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0} />}>
            <Button size="sm" variant="outline" disabled className="pointer-events-none">
              <HistoryIcon data-icon="inline-start" />
              History
            </Button>
          </TooltipTrigger>
          <TooltipContent>Available in a future update</TooltipContent>
        </Tooltip>
        <Button size="sm" variant="ghost" onClick={() => api.system.openPath(game.localPath)}>
          <FolderOpenIcon data-icon="inline-start" />
          Open Save Folder
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(game)}>
          <PencilIcon data-icon="inline-start" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onRemove(game)}>
          <TrashIcon data-icon="inline-start" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
}
