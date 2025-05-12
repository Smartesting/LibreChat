import React, { FC, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Moon, Sun, Globe } from 'lucide-react';
import { SystemRoles } from 'librechat-data-provider';
import { ThemeContext } from '~/hooks/ThemeContext';
import { useAuthContext } from '~/hooks/AuthContext';
import { TooltipAnchor, Dropdown } from '~/components';
import { useLocalize } from '~/hooks';
import { useRecoilState } from 'recoil';
import Cookies from 'js-cookie';
import store from '~/store';

const UtilityButtons: FC = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const localize = useLocalize();
  const [langcode, setLangcode] = useRecoilState(store.lang);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

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

  const changeLang = (value: string) => {
    let userLang = value;
    if (value === 'auto') {
      userLang = navigator.language || navigator.languages[0];
    }

    requestAnimationFrame(() => {
      document.documentElement.lang = userLang;
    });
    setLangcode(userLang);
    Cookies.set('lang', userLang, { expires: 365 });
    setShowLangDropdown(false);
  };

  const languageOptions = [
    { value: 'auto', label: localize('com_nav_lang_auto') },
    { value: 'en-US', label: localize('com_nav_lang_english') },
    { value: 'de-DE', label: localize('com_nav_lang_german') },
    { value: 'fr-FR', label: localize('com_nav_lang_french') },
  ];

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

      <div className="relative">
        <TooltipAnchor
          aria-label={localize('com_nav_language')}
          description={localize('com_nav_language')}
          role="button"
          onClick={() => setShowLangDropdown(!showLangDropdown)}
          className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
        >
          <Globe size={24} />
        </TooltipAnchor>

        {showLangDropdown && (
          <div className="absolute right-0 top-12 z-50">
            <Dropdown
              value={langcode}
              onChange={changeLang}
              options={languageOptions}
              sizeClasses="[--anchor-max-height:256px]"
              className="rounded-xl"
            />
          </div>
        )}
      </div>

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
