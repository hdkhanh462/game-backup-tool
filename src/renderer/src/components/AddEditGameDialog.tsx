import { DriveFolderPickerDialog } from '@renderer/components/DriveFolderPickerDialog';
import { Button } from '@renderer/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@renderer/components/ui/field';
import { Input } from '@renderer/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';
import { useAuthStatus } from '@renderer/hooks/useAuthStatus';
import { api } from '@renderer/lib/api';
import type { Game, GameInput } from '@shared/types';
import { FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY_FORM: GameInput = { name: '', localPath: '', driveFolderId: null, driveFolderPath: null };

interface AddEditGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game?: Game | null;
  onSubmit: (input: GameInput) => Promise<void>;
}

export function AddEditGameDialog({ open, onOpenChange, game, onSubmit }: AddEditGameDialogProps): React.JSX.Element {
  const { status } = useAuthStatus();
  const [form, setForm] = useState<GameInput>(EMPTY_FORM);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        game
          ? {
              name: game.name,
              localPath: game.localPath,
              driveFolderId: game.driveFolderId,
              driveFolderPath: game.driveFolderPath,
            }
          : EMPTY_FORM,
      );
      setSubmitted(false);
    }
  }, [open, game]);

  const nameInvalid = submitted && !form.name.trim();
  const localPathInvalid = submitted && !form.localPath.trim();

  const handleBrowseLocal = async (): Promise<void> => {
    const picked = await api.system.pickFolder();
    if (picked) setForm((prev) => ({ ...prev, localPath: picked }));
  };

  const handleSubmit = async (): Promise<void> => {
    setSubmitted(true);
    if (!form.name.trim() || !form.localPath.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const isConnected = status.state === 'connected';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{game ? 'Edit Game' : 'Add Game'}</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={nameInvalid || undefined}>
              <FieldLabel htmlFor="game-name">Name</FieldLabel>
              <FieldContent>
                <Input id="game-name" aria-invalid={nameInvalid || undefined} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Cyberpunk 2077" />
                {nameInvalid && <FieldError>Name is required.</FieldError>}
              </FieldContent>
            </Field>

            <Field data-invalid={localPathInvalid || undefined}>
              <FieldLabel htmlFor="game-local-path">Local Save Folder</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-local-path" aria-invalid={localPathInvalid || undefined} readOnly value={form.localPath} placeholder="Not selected" />
                  <Button type="button" variant="outline" onClick={handleBrowseLocal}>
                    Browse
                  </Button>
                </div>
                {localPathInvalid && <FieldError>Choose the local save folder.</FieldError>}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="game-drive-path">Drive Subfolder</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input id="game-drive-path" readOnly value={form.driveFolderPath ?? ''} placeholder="Not selected" />
                  {isConnected ? (
                    <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
                      <FolderIcon data-icon="inline-start" />
                      Choose
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger render={<span tabIndex={0} />}>
                        <Button type="button" variant="outline" disabled className="pointer-events-none">
                          <FolderIcon data-icon="inline-start" />
                          Choose
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Connect Google Drive first</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DriveFolderPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        startParentId={status.rootFolderId ?? 'root'}
        startPath={status.rootFolderPath ?? 'My Drive'}
        onSelect={async (folder) => {
          setForm((prev) => ({ ...prev, driveFolderId: folder.id, driveFolderPath: folder.path }));
          setPickerOpen(false);
        }}
      />
    </>
  );
}
