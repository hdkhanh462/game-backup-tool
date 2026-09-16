import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar';
import { Button } from '@renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { ChevronDownIcon, CloudIcon, LogOutIcon } from 'lucide-react';

export function GoogleAccountBar(): React.JSX.Element {
  const { status, connect, disconnect, setRootFolder } = useAuthStatus();
  const openDriveFolderPicker = useDialogStore((state) => state.openDriveFolderPicker);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Avatar className="size-6">
          <AvatarFallback>{status.email?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
        </Avatar>
        {status.email}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
        <DropdownMenuItem variant="destructive" onClick={() => disconnect()}>
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
