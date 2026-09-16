import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar';
import { Button } from '@renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { ChevronDownIcon, CloudIcon, LogOutIcon, SettingsIcon } from 'lucide-react';

export function GoogleAccountBar(): React.JSX.Element {
  const { status, connect, disconnect, setRootFolder } = useAuthStatus();
  const openDriveFolderPicker = useDialogStore((state) => state.openDriveFolderPicker);
  const openSettingsDialog = useDialogStore((state) => state.openSettingsDialog);

  if (status.state === 'connecting') {
    return (
      <Button disabled variant="outline">
        <Spinner data-icon="inline-start" />
        Connecting…
      </Button>
    );
  }

  if (status.state !== 'connected') {
    return (
      <Button onClick={() => connect()}>
        <CloudIcon data-icon="inline-start" />
        Connect Google Drive
      </Button>
    );
  }

  const displayName = status.name ?? status.email ?? 'Account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Avatar className="size-6">
          {status.picture && <AvatarImage src={status.picture} alt={displayName} />}
          <AvatarFallback>{displayName[0]?.toUpperCase() ?? '?'}</AvatarFallback>
        </Avatar>
        {displayName}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
          {status.email && <span className="truncate text-xs text-muted-foreground">{status.email}</span>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            openDriveFolderPicker({
              currentFolderId: status.rootFolderId ?? undefined,
              currentFolderPath: status.rootFolderPath ?? undefined,
              onSelect: (folder) => {
                setRootFolder(folder, {
                  onSuccess: () => toast.add({ title: `Backup folder set to "${folder.path}"`, type: 'success' }),
                });
              },
            })
          }
        >
          Change backup folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openSettingsDialog()}>
          <SettingsIcon data-icon="inline-start" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => disconnect()}>
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
