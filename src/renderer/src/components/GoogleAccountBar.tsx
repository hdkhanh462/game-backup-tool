import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar';
import { Button } from '@renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { Spinner } from '@renderer/components/ui/spinner';
import { toast } from '@renderer/components/ui/toast';
import { useAuthStatus } from '@renderer/features/auth/hooks/useAuthStatus';
import { useDialogStore } from '@renderer/store/useDialogStore';
import { ChevronDownIcon, CloudIcon, CopyIcon, FolderIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function GoogleAccountBar(): React.JSX.Element {
  const { t } = useTranslation(['common', 'drive']);
  const { status, connect, cancelConnect, copyAuthUrl, disconnect, setRootFolder, isDisconnecting, isSettingRootFolder } = useAuthStatus();
  const openDriveFolderPicker = useDialogStore((state) => state.openDriveFolderPicker);
  const openSettingsDialog = useDialogStore((state) => state.openSettingsDialog);

  if (status.state === 'connecting') {
    return (
      <div className="flex items-center gap-2">
        <Button disabled variant="outline">
          <Spinner data-icon="inline-start" />
          {t('actions.connecting')}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            if (await copyAuthUrl()) toast.add({ title: t('actions.signInLinkCopied'), type: 'info' });
          }}
        >
          <CopyIcon data-icon="inline-start" />
          {t('actions.copySignInLink')}
        </Button>
        <Button variant="ghost" onClick={() => cancelConnect()}>
          {t('actions.cancel')}
        </Button>
      </div>
    );
  }

  if (status.state !== 'connected') {
    return (
      <Button onClick={() => connect()}>
        <CloudIcon data-icon="inline-start" />
        {t('actions.connectGoogleDrive')}
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
          disabled={isSettingRootFolder}
          onClick={() =>
            openDriveFolderPicker({
              currentFolderId: status.rootFolderId ?? undefined,
              currentFolderPath: status.rootFolderPath ?? undefined,
              onSelect: (folder) => {
                setRootFolder(folder, {
                  onSuccess: () => toast.add({ title: t('drive:picker.folderSetToast', { path: folder.path }), type: 'success' }),
                });
              },
            })
          }
        >
          {isSettingRootFolder ? <Spinner data-icon="inline-start" /> : <FolderIcon data-icon="inline-start" />}
          {t('actions.changeBackupFolder')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openSettingsDialog()}>
          <SettingsIcon data-icon="inline-start" />
          {t('actions.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isDisconnecting} onClick={() => disconnect()}>
          {isDisconnecting ? <Spinner data-icon="inline-start" /> : <LogOutIcon data-icon="inline-start" />}
          {t('actions.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
