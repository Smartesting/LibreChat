import React, { FC, useCallback, useMemo, useState } from 'react';
import useSmaLocalize from '../../../hooks/useSmaLocalize';
import { useGetAllUsersQuery } from '~/data-provider/Users/queries';
import { SystemRoles } from 'librechat-data-provider';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/Table';

const UserList: FC = () => {
  const { data: users = [] } = useGetAllUsersQuery();
  const smaLocalize = useSmaLocalize();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getRoleName = useCallback((role) => {
    switch (role) {
      case SystemRoles.ADMIN:
        return smaLocalize('com_userlist_role_admin');
      case SystemRoles.ORGADMIN:
        return smaLocalize('com_userlist_role_org_admin');
      case SystemRoles.TRAINER:
        return smaLocalize('com_userlist_role_trainer');
      case SystemRoles.USER:
        return smaLocalize('com_userlist_role_user');
      case SystemRoles.TRAINEE:
        return smaLocalize('com_userlist_role_trainee');
      default:
        return role;
    }
  }, [smaLocalize]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      if (!searchTerm) {
        return true;
      }
      const searchTermLower = searchTerm.toLowerCase();
      return (
        user.email?.toLowerCase().includes(searchTermLower) ||
        user.username?.toLowerCase().includes(searchTermLower) ||
        getRoleName(user.role)?.toLowerCase().includes(searchTermLower)
      );
    });

    if (!sortColumn) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'username':
          aValue = a.username || '';
          bValue = b.username || '';
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortColumn, searchTerm, getRoleName, sortDirection]);

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{smaLocalize('com_userlist_users')}</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={smaLocalize('com_userlist_search')}
            className="rounded-md border border-border-light bg-surface-primary px-3 py-2 pl-10 text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort('email')}
                className="cursor-pointer hover:bg-surface-tertiary"
              >
                <div className="flex items-center">
                  {smaLocalize('com_userlist_email')}
                  {sortColumn === 'email' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('username')}
                className="cursor-pointer hover:bg-surface-tertiary"
              >
                <div className="flex items-center">
                  {smaLocalize('com_userlist_username')}
                  {sortColumn === 'username' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('role')}
                className="cursor-pointer hover:bg-surface-tertiary"
              >
                <div className="flex items-center">
                  {smaLocalize('com_userlist_role')}
                  {sortColumn === 'role' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{getRoleName(user.role)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserList;
