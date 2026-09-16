export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveListFoldersResult {
  parentId: string;
  folders: DriveFolder[];
}
