import { Plus, X } from 'lucide-react';
import { FC, useState } from 'react';
import { useLocalize } from '~/hooks';

const UsersList: FC<{
  title: string;
  users: { email: string; name?: string }[];
  handleRemoveUser?: (email: string) => void;
  handleAddUser?: (email: string) => void;
}> = ({ title, users, handleRemoveUser, handleAddUser }) => {
  const localize = useLocalize();

  const [showNewUserInput, setShowNewUserInput] = useState(false);
  const [isUpdatingUsers, setIsUpdatingUsers] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {handleAddUser && (
          <button
            onClick={() => setShowNewUserInput(true)}
            className="rounded-full bg-surface-primary p-1 hover:bg-surface-secondary"
            aria-label={localize('com_ui_add')}
            disabled={isUpdatingUsers}
          >
            <Plus size={16} className="text-text-primary" />
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.email}
            className="flex items-center justify-between rounded bg-surface-tertiary p-2"
          >
            <span className="text-text-primary">
              {user.email}
              {user.name ? ` (${user.name})` : ''}
            </span>
            {handleRemoveUser && (
              <button
                onClick={() => {
                  setIsUpdatingUsers(true);
                  handleRemoveUser(user.email);
                  setNewUserEmail('');
                  setIsUpdatingUsers(false);
                }}
                className="rounded-full p-1 hover:bg-surface-secondary"
                aria-label={localize('com_ui_delete')}
                disabled={isUpdatingUsers}
              >
                <X size={16} className="text-text-primary" />
              </button>
            )}
          </li>
        ))}

        {handleAddUser && showNewUserInput && (
          <li className="flex items-center rounded bg-surface-tertiary p-2">
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 border-none bg-surface-tertiary text-text-primary placeholder:text-text-secondary focus:outline-none"
              disabled={isUpdatingUsers}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isUpdatingUsers) {
                  setIsUpdatingUsers(true);
                  handleAddUser(newUserEmail);
                  setNewUserEmail('');
                  setIsUpdatingUsers(false);
                }
              }}
            />
            <button
              onClick={() => {
                setIsUpdatingUsers(true);
                handleAddUser(newUserEmail);
                setNewUserEmail('');
                setIsUpdatingUsers(false);
              }}
              className="ml-2 rounded-full p-1 hover:bg-surface-secondary"
              aria-label={localize('com_ui_confirm') + ' ' + localize('com_ui_add')}
              disabled={isUpdatingUsers}
            >
              {isUpdatingUsers ? '...' : <Plus size={16} className="text-text-primary" />}
            </button>
            <button
              onClick={() => {
                setShowNewUserInput(false);
                setNewUserEmail('');
              }}
              className="ml-1 rounded-full p-1 hover:bg-surface-secondary"
              aria-label={localize('com_ui_cancel') + ' ' + localize('com_ui_add')}
              disabled={isUpdatingUsers}
            >
              <X size={16} className="text-text-primary" />
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default UsersList;
