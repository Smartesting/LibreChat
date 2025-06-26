import React from 'react';
import type { TMessageProps } from '~/common';
import MessageRender from './ui/MessageRender';
import ContentRender from '~/components/Messages/ContentRender';
import { TMessage } from 'librechat-data-provider';
import useMessageProcess from '~/hooks/Messages/useMessageProcess';

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

export default function Message(
  props: TMessageProps & {
    hasStoredSiblingMessage: boolean;
    siblingMessageInCache?: TMessage | null;
  },
) {
  const { message, hasStoredSiblingMessage, siblingMessageInCache } = props;
  const { handleScroll, isSubmittingFamily } = useMessageProcess({ message });

  if (!message || typeof message !== 'object') {
    return null;
  }

  return (
    <>
      <MessageContainer handleScroll={handleScroll}>
        {siblingMessageInCache ? (
          <div className="m-auto my-2 flex justify-center p-4 py-2 md:gap-6">
            {message.content ? (
              <ContentRender
                {...props}
                message={message}
                isSubmittingFamily={isSubmittingFamily}
                isCard
              />
            ) : (
              <MessageRender
                {...props}
                message={message}
                isSubmittingFamily={isSubmittingFamily}
                isCard
              />
            )}
            {siblingMessageInCache.content ? (
              <ContentRender
                {...props}
                message={siblingMessageInCache}
                isSubmittingFamily={isSubmittingFamily}
                isMultiMessage
                isCard
              />
            ) : (
              <MessageRender
                {...props}
                message={siblingMessageInCache}
                isSubmittingFamily={isSubmittingFamily}
                isMultiMessage
                isCard
              />
            )}
          </div>
        ) : (
          <div className="m-auto my-2 flex justify-center p-4 py-2 md:gap-6">
            {message.content ? (
              <ContentRender
                {...props}
                isCard={
                  hasStoredSiblingMessage ||
                  siblingMessageInCache !== null
                }
              />
            ) : (
              <MessageRender
                {...props}
                isCard={
                  hasStoredSiblingMessage ||
                  siblingMessageInCache !== null
                }
              />
            )}
          </div>
        )}
      </MessageContainer>
    </>
  );
}
