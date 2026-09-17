import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddGameCardProps {
  onClick: () => void;
}

export function AddGameCard({ onClick }: AddGameCardProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/card flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/15 py-(--card-spacing) text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary [--card-spacing:--spacing(6)]"
    >
      <PlusIcon className="size-6" />
      <span className="font-medium">{t('actions.addGame')}</span>
    </button>
  );
}
