import React, { useMemo } from 'react';
import { isAssistantsEndpoint, QueryKeys, TMessage } from 'librechat-data-provider';
import type { TMessageProps } from '~/common';
import MessageParts from './MessageParts';
import Message from './Message';
import { useChatContext } from '~/Providers';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export default function MultiMessage({
  convoMessages,
  currentEditId,
  setCurrentEditId,
}: TMessageProps) {
  const { conversation } = useChatContext();
  const { conversationId: paramId } = useParams();
  const queryClient = useQueryClient();
  const queryParam = paramId === 'new' ? paramId : (conversation?.conversationId ?? paramId ?? '');
  const addedMessages = queryClient.getQueryData<TMessage[]>([QueryKeys.messages, queryParam, 1]);

  const messageGroups = useMemo(() => {
    return createMessageGroups(convoMessages, conversation?.model);
  }, [convoMessages, conversation?.model]);

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
                }

                return (
                  <div key={message.messageId} className={messageWidth}>
                    <Message
                      message={message as TMessage}
                      currentEditId={currentEditId}
                      setCurrentEditId={setCurrentEditId}
                      hasStoredSiblingMessage={messageGroup.length - 1 > 0}
                      siblingMessageInCache={findSiblingMessage(message, addedMessages)}
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

function findSiblingMessage(currentMessage: TMessage, addedMessages?: TMessage[]): TMessage | null {
  if (!addedMessages || currentMessage.sender === 'User') {
    return null;
  }

  return addedMessages.find((m) => m.parentMessageId === currentMessage.parentMessageId) ?? null;
}

function createMessageGroups(
  convoMessages: TMessage[] | null | undefined,
  mainChatModel?: string | null,
): TMessage[][] {
  if (!convoMessages || !convoMessages.length) {
    return [];
  }

  const messageGroups: TMessage[][] = [];
  const currentGroup: TMessage[] = [];

  for (let i = 0; i < convoMessages.length; i++) {
    const convoMessage = convoMessages[i];
    const isLastMessage = i === convoMessages.length - 1;

    if (convoMessage.model === null || convoMessage.model === undefined) {
      if (currentGroup.length > 0) {
        messageGroups.push(currentGroup.slice());
        currentGroup.length = 0;
      }

      messageGroups.push([convoMessage]);
    } else {
      if (convoMessage.model === mainChatModel) {
        currentGroup.unshift(convoMessage);
      } else {
        currentGroup.push(convoMessage);
      }

      if (isLastMessage) {
        messageGroups.push(currentGroup.slice());
      }
    }
  }

  return messageGroups;
}
