import React from 'react';
import { useMessageProcess } from '~/hooks';
import type { TMessageProps } from '~/common';
import MessageRender from './ui/MessageRender';

const MessageContainer = React.memo(
  ({
    handleScroll,
    children,
  }: {
    handleScroll: (event?: unknown) => void;
    children: React.ReactNode;
  }) => {
    return (
      <div
        className="text-token-text-primary w-full border-0 bg-transparent dark:border-0 dark:bg-transparent"
        onWheel={handleScroll}
        onTouchMove={handleScroll}
      >
        {children}
      </div>
    );
  },
);

export default function Message(props: TMessageProps) {
  const { message, siblingCount } = props;
  const { handleScroll, siblingMessage: newSiblingMessageInCache, isSubmittingFamily } =
    useMessageProcess({ message });

  if (!message || typeof message !== 'object') {
    return null;
  }

  return (
    <>
      <MessageContainer handleScroll={handleScroll}>
        {siblingCount === 0 && newSiblingMessageInCache ? (
          <div className="m-auto my-2 flex justify-center p-4 py-2 md:gap-6">
            <MessageRender
              {...props}
              message={message}
              isSubmittingFamily={isSubmittingFamily}
              isCard
            />
            <MessageRender
              {...props}
              isMultiMessage
              isCard
              message={newSiblingMessageInCache}
              isSubmittingFamily={isSubmittingFamily}
            />
          </div>
        ) : (
          <div className="m-auto my-2 flex justify-center p-4 py-2 md:gap-6">
            <MessageRender {...props} isCard={!message.isCreatedByUser && siblingCount !== 0} />
          </div>
        )}
      </MessageContainer>
    </>
  );
}
