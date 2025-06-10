import { useOutletContext } from 'react-router-dom';
import { Permissions, PermissionTypes } from 'librechat-data-provider';
import type { ContextType } from '~/common';
import ModelSelector from './Menus/Endpoints/ModelSelector';
import { HeaderNewChat } from './Menus';
import { useGetStartupConfig } from '~/data-provider';
import ExportAndShareMenu from './ExportAndShareMenu';
import { useHasAccess, useMediaQuery } from '~/hooks';
import BookmarkMenu from './Menus/BookmarkMenu';
import { TemporaryChat } from './TemporaryChat';

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible } = useOutletContext<ContextType>();

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  /*const hasAccessToMultiConvo = useHasAccess({
    permissionType: PermissionTypes.MULTI_CONVO,
    permission: Permissions.USE,
  });*/

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-white p-2 font-semibold text-text-primary dark:bg-gray-800">
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div className="mx-2 flex items-center gap-2">
          {!navVisible && <HeaderNewChat />}
          {<ModelSelector startupConfig={startupConfig} />}
          {hasAccessToBookmarks && <BookmarkMenu />}
          {/*hasAccessToMultiConvo && <AddMultiConvo />*/}
          {isSmallScreen && (
            <>
              <ExportAndShareMenu
                isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
              />
              <TemporaryChat />
            </>
          )}
        </div>
        {!isSmallScreen && (
          <div className="flex items-center gap-2">
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
            <TemporaryChat />
          </div>
        )}
      </div>
      {/* Empty div for spacing */}
      <div />
    </div>
  );
}
