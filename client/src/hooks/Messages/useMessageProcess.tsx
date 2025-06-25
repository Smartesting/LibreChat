import throttle from 'lodash/throttle';
import { useRecoilValue } from 'recoil';
import { Constants, QueryKeys, TMessage } from 'librechat-data-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAddedChatContext, useChatContext } from '~/Providers';
import { getTextKey, logger } from '~/utils';
import store from '~/store';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function useMessageProcess({ message }: { message?: TMessage | null }) {
  const latestText = useRef<string | number>('');
  const [siblingMessage, setSiblingMessage] = useState<TMessage | null>(null);
  const hasNoChildren = useMemo(() => (message?.children?.length ?? 0) === 0, [message]);

  const {
    index,
    conversation,
    setAbortScroll,
    setLatestMessage,
    isSubmitting: isSubmittingRoot,
  } = useChatContext();
  const { isSubmitting: isSubmittingAdditional } = useAddedChatContext();
  const latestMultiMessage = useRecoilValue(store.latestMessageFamily(index + 1));
  const isSubmittingFamily = useMemo(
    () => isSubmittingRoot || isSubmittingAdditional,
    [isSubmittingRoot, isSubmittingAdditional],
  );

  const { conversationId: paramId } = useParams();
  const queryClient = useQueryClient();
  const queryParam = paramId === 'new' ? paramId : (conversation?.conversationId ?? paramId ?? '');
  const addedMessages = queryClient.getQueryData<TMessage[]>([
    QueryKeys.messages,
    queryParam,
    index + 1,
  ]);

  useEffect(() => {
    const convoId = conversation?.conversationId;
    if (convoId === Constants.NEW_CONVO) {
      return;
    }
    if (!message) {
      return;
    }
    if (!hasNoChildren) {
      return;
    }

    const textKey = getTextKey(message, convoId);

    // Check for text/conversation change
    const logInfo = {
      textKey,
      'latestText.current': latestText.current,
      messageId: message.messageId,
      convoId,
    };
    if (
      textKey !== latestText.current ||
      (convoId != null &&
        latestText.current &&
        convoId !== latestText.current.split(Constants.COMMON_DIVIDER)[2])
    ) {
      logger.log('latest_message', '[useMessageProcess] Setting latest message; logInfo:', logInfo);
      latestText.current = textKey;
      setLatestMessage({ ...message });
    } else {
      logger.log('latest_message', 'No change in latest message; logInfo', logInfo);
    }
  }, [hasNoChildren, message, setLatestMessage, conversation?.conversationId]);

  const handleScroll = useCallback(
    (event: unknown | TouchEvent | WheelEvent) => {
      throttle(() => {
        logger.log(
          'message_scrolling',
          `useMessageProcess: setting abort scroll to ${isSubmittingFamily}, handleScroll event`,
          event,
        );
        if (isSubmittingFamily) {
          setAbortScroll(true);
        } else {
          setAbortScroll(false);
        }
      }, 500)();
    },
    [isSubmittingFamily, setAbortScroll],
  );

  useEffect(() => {
    if (message?.model && hasNoChildren) {
      setSiblingMessage(
        addedMessages
          ? (addedMessages.find((m) => m.parentMessageId === message.parentMessageId) ?? null)
          : null,
      );
    }
  }, [message, setSiblingMessage, addedMessages, hasNoChildren]);

  return {
    handleScroll,
    conversation,
    siblingMessage,
    setSiblingMessage,
    isSubmittingFamily,
    latestMultiMessage,
  };
}
