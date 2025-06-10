import type { MouseEvent } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import DeleteButton from './DeleteButton';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';
import { Button } from '~/components';

function ConvoOptions({
  conversationId,
  title,
  retainView,
}: {
  conversationId: string | null;
  title: string | null;
  retainView: () => void;
  renameHandler: (e: MouseEvent) => void;
  isPopoverActive: boolean;
  setIsPopoverActive: React.Dispatch<React.SetStateAction<boolean>>;
  isActiveConvo: boolean;
}) {
  const localize = useLocalize();
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  return (
    <>
      <Button
        id={`conversation-delete-${conversationId}`}
        aria-label={localize('com_ui_delete')}
        className={cn(
          'z-30 inline-flex h-7 w-7 items-center justify-center gap-2 rounded-md border-none p-0 text-sm font-medium ring-ring-primary transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'opacity-0 focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteClick();
        }}
        variant={'destructive'}
      >
        <Trash2 className="icon-md text-text-secondary" aria-hidden={true} />
      </Button>
      {showDeleteDialog && (
        <DeleteButton
          title={title ?? ''}
          retainView={retainView}
          conversationId={conversationId ?? ''}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          triggerRef={deleteButtonRef}
        />
      )}
    </>
  );
}

export default memo(ConvoOptions, (prevProps, nextProps) => {
  return (
    prevProps.conversationId === nextProps.conversationId &&
    prevProps.title === nextProps.title &&
    prevProps.isPopoverActive === nextProps.isPopoverActive &&
    prevProps.isActiveConvo === nextProps.isActiveConvo
  );
});
