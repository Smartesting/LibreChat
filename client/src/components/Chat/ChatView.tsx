import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetMessagesByConvoId } from 'librechat-data-provider/react-query';
import type { ChatFormValues } from '~/common';
import { AddedChatContext, ChatContext, ChatFormProvider } from '~/Providers';
import { useAddedResponse, useChatHelpers, useSSE } from '~/hooks';
import ConversationStarters from './Input/ConversationStarters';
import MessagesView from './Messages/MessagesView';
import { Spinner } from '~/components/svg';
import Presentation from './Presentation';
import ChatForm from './Input/ChatForm';
import Landing from './Landing';
import Header from './Header';
import Footer from './Footer';
import store from '~/store';

function ChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));
  const centerFormOnLanding = useRecoilValue(store.centerFormOnLanding);

  const { data: convoMessages = null, isLoading } = useGetMessagesByConvoId(conversationId ?? '');
  const chatHelpers = useChatHelpers(index, conversationId);
  const addedChatHelpers = useAddedResponse({ rootIndex: index }, conversationId);

  useSSE(rootSubmission, chatHelpers, false);
  useSSE(addedSubmission, addedChatHelpers, true);

  const methods = useForm<ChatFormValues>({
    defaultValues: { text: '' },
  });

  let content: JSX.Element | null | undefined;
  const isLandingPage = !convoMessages || convoMessages.length === 0;

  if (isLoading && conversationId !== 'new') {
    content = (
      <div className="relative flex-1 overflow-hidden overflow-y-auto">
        <div className="relative flex h-full items-center justify-center">
          <Spinner className="text-text-primary" />
        </div>
      </div>
    );
  } else if (!isLandingPage) {
    content = <MessagesView convoMessages={convoMessages} />;
  } else {
    content = <Landing centerFormOnLanding={centerFormOnLanding} />;
  }

  return (
    <ChatFormProvider {...methods}>
      <ChatContext.Provider value={chatHelpers}>
        <AddedChatContext.Provider value={addedChatHelpers}>
          <Presentation>
            <div className="flex h-full w-full flex-col">
              {!isLoading && <Header />}

              {isLandingPage ? (
                <>
                  <div className="flex flex-1 flex-col items-center justify-end sm:justify-center">
                    {content}
                    <div className="w-full max-w-3xl transition-all duration-200 xl:max-w-4xl">
                      <ChatForm index={index} />
                      <ConversationStarters />
                    </div>
                  </div>
                  <Footer />
                </>
              ) : (
                <div className="flex h-full flex-col overflow-y-auto">
                  {content}
                  <div className="w-full">
                    <ChatForm index={index} />
                    <Footer />
                  </div>
                </div>
              )}
            </div>
          </Presentation>
        </AddedChatContext.Provider>
      </ChatContext.Provider>
    </ChatFormProvider>
  );
}

export default memo(ChatView);
