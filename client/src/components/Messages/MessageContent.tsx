import React from 'react';
import { useMessageProcess } from '~/hooks';
import type { TMessageProps } from '~/common';
// eslint-disable-next-line import/no-cycle
import ContentRender from './ContentRender';

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

export default function MessageContent(props: TMessageProps) {
  const { showSibling, handleScroll, siblingMessage, latestMultiMessage, isSubmittingFamily } =
    useMessageProcess({ message: props.message });
  const { message } = props;

  if (!message || typeof message !== 'object') {
    return null;
  }

  return (
    <>
      <MessageContainer handleScroll={handleScroll}>
        {showSibling ? (
          <div className="m-auto my-2 flex justify-center p-4 py-2 md:gap-6">
            <div className="flex w-full flex-row flex-wrap justify-between gap-1 md:max-w-5xl md:flex-nowrap md:gap-2 lg:max-w-5xl xl:max-w-6xl">
              <ContentRender
                {...props}
                message={message}
                isSubmittingFamily={isSubmittingFamily}
                isCard
              />
              <ContentRender
                {...props}
                isMultiMessage
                isCard
                message={siblingMessage ?? latestMultiMessage ?? undefined}
                isSubmittingFamily={isSubmittingFamily}
              />
            </div>
          </div>
        ) : (
          <div className="m-auto flex justify-center p-4 py-2 md:gap-6">
            <ContentRender {...props} />
          </div>
        )}
      </MessageContainer>
    </>
  );
}
