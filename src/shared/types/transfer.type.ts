export type TransferOp = 'backup' | 'restore';

export type TransferPhase = 'scanning' | 'diffing' | 'uploading' | 'copying' | 'downloading' | 'finalizing' | 'safetyBackup' | 'cleanup' | 'done' | 'error';

export interface TransferProgress {
  gameId: string;
  op: TransferOp;
  phase: TransferPhase;
  currentFile?: string;
  filesDone: number;
  filesTotal: number;
  bytesDone: number;
  bytesTotal: number;
  error?: string;
}
