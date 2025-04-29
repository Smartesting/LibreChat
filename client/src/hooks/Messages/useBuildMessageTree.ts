import type { TMessage } from 'librechat-data-provider';

export default function useBuildMessageTree() {
  // return an object or an array based on branches and recursive option
  // messageId is used to get siblindIdx from recoil snapshot
  const buildMessageTree = async ({
    message,
    messages,
    branches = false,
    recursive = false,
  }: {
    messageId: string | null | undefined;
    message: Partial<TMessage> | null;
    messages: Array<Partial<TMessage> | undefined> | null;
    branches?: boolean;
    recursive?: boolean;
  }): Promise<TMessage | Array<Partial<TMessage> | undefined>> => {
    const children: Array<Partial<TMessage> | undefined> = [];
    if (messages?.length != null && messages.length > 0) {
      if (branches) {
        for (const message of messages) {
          children.push(
            (await buildMessageTree({
              messageId: message?.messageId,
              message: message as TMessage,
              messages: message?.children || [],
              branches,
              recursive,
            })) as TMessage,
          );
        }
      } else {
        for (const message of messages) {
          children.push(
            (await buildMessageTree({
              messageId: message?.messageId,
              message: message as TMessage,
              messages: message?.children || [],
              branches,
              recursive,
            })) as TMessage,
          );
        }
      }
    }

    if (recursive && message) {
      return { ...(message as TMessage), children: children as TMessage[] };
    } else {
      let ret: TMessage[] = [];
      if (message) {
        const _message = { ...message };
        delete _message.children;
        ret = [_message as TMessage];
      }
      for (const child of children) {
        ret = ret.concat(child as TMessage);
      }
      return ret;
    }
  };

  return buildMessageTree;
}
