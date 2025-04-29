import React, { useMemo } from 'react';
import type { TMessage } from 'librechat-data-provider';
import { isAssistantsEndpoint } from 'librechat-data-provider';
import type { TMessageProps } from '~/common';
import MessageContent from '~/components/Messages/MessageContent';
import MessageParts from './MessageParts';
import Message from './Message';

const flattenMessageTree = (
  messagesTree: TMessage[] | null | undefined,
  depth = 0,
  parentId: string | null = null,
): TMessage[][] => {
  if (!messagesTree || !messagesTree.length) {
    return [];
  }

  const messagesByDepth: TMessage[][] = [];
  const currentLevelMessages: TMessage[] = [];

  for (const message of messagesTree) {
    if (!message) continue;

    const messageWithDepth = { ...message, depth, parentId };
    currentLevelMessages.push(messageWithDepth);
  }

  if (currentLevelMessages.length > 0) {
    messagesByDepth.push(currentLevelMessages);
  }
  for (const message of messagesTree) {
    if (!message || !message.children || !message.children.length) continue;

    const childrenGroups = flattenMessageTree(message.children, depth + 1, message.messageId);
    messagesByDepth.push(...childrenGroups);
  }

  return messagesByDepth;
};

export default function MultiMessage({
  messagesTree,
  currentEditId,
  setCurrentEditId,
}: TMessageProps) {
  const messageGroups = useMemo(() => {
    return flattenMessageTree(messagesTree);
  }, [messagesTree]);

  if (!messageGroups.length) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-0">
      {messageGroups.map((messageGroup, groupIndex) => {
        if (!messageGroup.length) {
          return null;
        }

        return (
          <div key={`group-${groupIndex}`} className="w-full">
            <div className="flex flex-row flex-wrap justify-center gap-0">
              {messageGroup.map((message) => {
                if (!message) {
                  return null;
                }

                const messageWidth = messageGroup.length > 1 ? 'mx-auto flex flex-1' : 'w-full';

                if (isAssistantsEndpoint(message.endpoint) && message.content) {
                  return (
                    <div key={message.messageId} className={messageWidth}>
                      <MessageParts
                        message={message as TMessage}
                        currentEditId={currentEditId}
                        setCurrentEditId={setCurrentEditId}
                        isCard={!message.isCreatedByUser && messageGroup.length > 1}
                      />
                    </div>
                  );
                } else if (message.content) {
                  return (
                    <div key={message.messageId} className={messageWidth}>
                      <MessageContent
                        message={message as TMessage}
                        currentEditId={currentEditId}
                        setCurrentEditId={setCurrentEditId}
                        isCard={!message.isCreatedByUser && messageGroup.length > 1}
                      />
                    </div>
                  );
                }

                return (
                  <div key={message.messageId} className={messageWidth}>
                    <Message
                      message={message as TMessage}
                      currentEditId={currentEditId}
                      setCurrentEditId={setCurrentEditId}
                      isCard={!message.isCreatedByUser && messageGroup.length > 1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
