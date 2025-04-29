import React, { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Moon, Sun } from 'lucide-react';
import { SystemRoles } from 'librechat-data-provider';
import { ThemeContext } from '~/hooks/ThemeContext';
import { useAuthContext } from '~/hooks/AuthContext';
import { TooltipAnchor } from '~/components';
import { useLocalize } from '~/hooks';

const UtilityButtons: FC = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const localize = useLocalize();

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const goToNewChat = () => {
    navigate('/c/new');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="absolute right-4 top-4 flex space-x-2">
      {user?.role === SystemRoles.ADMIN && (
        <TooltipAnchor
          aria-label={localize('com_ui_new_chat')}
          description={localize('com_ui_new_chat')}
          role="button"
          onClick={goToNewChat}
          className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
        >
          <MessageSquare size={24} />
        </TooltipAnchor>
      )}

      <TooltipAnchor
        aria-label={localize('com_nav_theme')}
        description={localize('com_nav_theme')}
        role="button"
        onClick={toggleTheme}
        className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </TooltipAnchor>

      <TooltipAnchor
        aria-label={localize('com_nav_log_out')}
        description={localize('com_nav_log_out')}
        role="button"
        onClick={handleLogout}
        className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
      >
        <LogOut size={24} />
      </TooltipAnchor>
    </div>
  );
};

export default UtilityButtons;
