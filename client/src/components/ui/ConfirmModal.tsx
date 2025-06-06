import React, { FC } from 'react';
import { useSmaLocalize } from '~/hooks';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { cn } from '~/utils';
import { Button } from '~/components';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  confirmTitle: string;
  confirmDescription: string;
  confirmButton: string;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  confirmTitle,
  confirmDescription,
  confirmButton,
}) => {
  const smaLocalize = useSmaLocalize();

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-50 dark:opacity-80" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className={cn('fixed inset-0 flex w-screen items-center justify-center p-4')}>
            <DialogPanel
              className={cn(
                'overflow-hidden rounded-xl rounded-b-lg bg-background pb-6 shadow-2xl backdrop-blur-2xl animate-in sm:rounded-2xl md:w-[500px]',
              )}
            >
              <DialogTitle
                className="mb-1 flex items-center justify-between p-6 pb-5 text-left"
                as="div"
              >
                <h2 className="text-lg font-medium leading-6 text-text-primary">{confirmTitle}</h2>
                <button
                  type="button"
                  className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-border-xheavy focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-surface-primary dark:focus:ring-offset-surface-primary"
                  onClick={onClose}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-text-primary"
                  >
                    <line x1="18" x2="6" y1="6" y2="18"></line>
                    <line x1="6" x2="18" y1="6" y2="18"></line>
                  </svg>
                  <span className="sr-only">{smaLocalize('com_ui_cancel')}</span>
                </button>
              </DialogTitle>

              <div className="px-6">
                <p className="mb-4 text-text-primary">{confirmDescription}</p>

                <div className="flex gap-4">
                  <Button
                    size={'sm'}
                    variant={'outline'}
                    className="btn btn-neutral border-token-border-light relative h-9 w-full gap-1 rounded-lg font-medium"
                    type="button"
                    onClick={onClose}
                  >
                    {smaLocalize('com_ui_cancel')}
                  </Button>
                  <button
                    className="btn btn-danger focus:shadow-outline flex h-9 w-full items-center justify-center bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 focus:border-red-500"
                    type="button"
                    onClick={onConfirm}
                  >
                    {confirmButton}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
