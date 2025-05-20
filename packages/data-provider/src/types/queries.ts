import type { InfiniteData } from '@tanstack/react-query';
import type * as a from '../types/agents';
import type * as s from '../schemas';
import type * as t from '../types';

export type Conversation = {
  id: string;
  createdAt: number;
  participants: string[];
  lastMessage: string;
  conversations: s.TConversation[];
};

export type ConversationListParams = {
  cursor?: string;
  isArchived?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
  tags?: string[];
  search?: string;
};

export type MinimalConversation = Pick<
  s.TConversation,
  'conversationId' | 'endpoint' | 'title' | 'createdAt' | 'updatedAt' | 'user'
>;

export type ConversationListResponse = {
  conversations: MinimalConversation[];
  mwssages?: s.TMessage[];
  nextCursor: string | null;
};

export type SearchConversationListParams = {
  nextCursor?: string | null;
  pageSize?: number;
  search: string;
};

export type SearchConversation = Pick<s.TConversation, 'conversationId' | 'title' | 'user'>;

export type SearchConversationListResponse = {
  conversations: SearchConversation[];
  messages: s.TMessage[];
  nextCursor: string | null;
};

export type ConversationData = InfiniteData<ConversationListResponse>;
export type ConversationUpdater = (
  data: ConversationData,
  conversation: s.TConversation,
) => ConversationData;

export type SharedMessagesResponse = Omit<s.TSharedLink, 'messages'> & {
  messages: s.TMessage[];
};

export interface SharedLinksListParams {
  pageSize: number;
  isPublic: boolean;
  sortBy: 'title' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  search?: string;
  cursor?: string;
}

export type SharedLinkItem = {
  shareId: string;
  title: string;
  isPublic: boolean;
  createdAt: Date;
  conversationId: string;
};

export interface SharedLinksResponse {
  links: SharedLinkItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface SharedLinkQueryData {
  pages: SharedLinksResponse[];
  pageParams: (string | null)[];
}

export type AllPromptGroupsFilterRequest = {
  category: string;
  pageNumber: string;
  pageSize: string | number;
  before?: string | null;
  after?: string | null;
  order?: 'asc' | 'desc';
  name?: string;
  author?: string;
};

export type AllPromptGroupsResponse = t.TPromptGroup[];

export type ConversationTagsResponse = s.TConversationTag[];

export type VerifyToolAuthParams = { toolId: string };
export type VerifyToolAuthResponse = { authenticated: boolean; message?: string | s.AuthType };

export type GetToolCallParams = { conversationId: string };
export type ToolCallResults = a.ToolCallResult[];

export type User = {
  userId?: string;
  email: string;
  invitationToken?: string;
  invitationExpires?: Date;
  invitedAt?: Date;
  activatedAt?: Date;
};

export type TrainingOrganization = {
  _id: string;
  name: string;
  administrators: User[];
  trainers: User[];
};

export type Training = {
  _id: string;
  name: string;
  description?: string;
  timezone: string;
  startDateTime: Date;
  endDateTime: Date;
  participantCount: number;
  location: string;
  trainers: string[];
  trainees: Array<{
    username: string;
    password: string;
    hasLoggedIn: boolean;
  }>;
  trainingOrganizationId: string;
};

export type TrainingWithStatus = Training & { status: TrainingStatus };

export enum TrainingStatus {
  PAST = 'past',
  IN_PROGRESS = 'in_progress',
  UPCOMING = 'upcoming',
}

export type TrainingOrganizationCreateParams = TrainingOrganization;

export type TrainingCreateParams = Omit<Training, '_id'>;

export type Invitation = {
  email: string;
  invitationTokens: string[];
  roles: {
    superAdmin: boolean;
    orgAdmin: string[];
    orgTrainer: string[];
  };
};
