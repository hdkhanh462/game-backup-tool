import { DriveFolderPickerDialog } from '@renderer/components/DriveFolderPickerDialog';
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar';
import { Button } from '@renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/hooks/useAuthStatus';
import { ChevronDownIcon, CloudIcon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';

export function GoogleAccountBar(): React.JSX.Element {
  const { status, connect, disconnect, setRootFolder } = useAuthStatus();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleConnect = async (): Promise<void> => {
    await connect();
  };

  const handleDisconnect = async (): Promise<void> => {
    await disconnect();
    toast.add({ title: 'Disconnected from Google Drive', type: 'info' });
  };

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
      <Button onClick={handleConnect}>
        <CloudIcon data-icon="inline-start" />
        Connect Google Drive
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          <Avatar className="size-6">
            <AvatarFallback>{status.email?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>
          {status.email}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPickerOpen(true)}>Change backup folder</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDisconnect}>
            <LogOutIcon data-icon="inline-start" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DriveFolderPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={async (folder) => {
          await setRootFolder(folder);
          setPickerOpen(false);
          toast.add({ title: `Backup folder set to "${folder.path}"`, type: 'success' });
        }}
      />
    </>
  );
}
