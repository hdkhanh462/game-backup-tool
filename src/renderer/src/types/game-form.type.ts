export interface GameFormValues {
  name: string;
  localPath: string;
  driveFolderId: string | null;
  driveFolderPath: string | null;
}

export interface GameFormProps {
  defaultValues?: GameFormValues;
  isConnected: boolean;
  rootFolderId: string | null;
  rootFolderPath: string | null;
  onSubmit: (values: GameFormValues) => Promise<void> | void;
  onCancel: () => void;
}
