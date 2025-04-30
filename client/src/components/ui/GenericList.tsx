import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useLocalize } from '~/hooks';

type ListProps<T> = {
  title: string;
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  handleRemoveItem?: (item: T) => void;
  handleAddItem?: (value: string) => void;
  onAddButtonClick?: () => void;
};

const GenericList = <T,>({
  title,
  items,
  getKey,
  renderItem,
  handleRemoveItem,
  handleAddItem,
  onAddButtonClick,
}: ListProps<T>) => {
  const localize = useLocalize();
  const [showNewItemInput, setShowNewItemInput] = useState(false);
  const [isUpdatingItems, setIsUpdatingItems] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {(handleAddItem || onAddButtonClick) && (
          <button
            onClick={() => {
              setShowNewItemInput(true);
              onAddButtonClick && onAddButtonClick();
            }}
            className="rounded-full bg-surface-primary p-1 hover:bg-surface-secondary"
            aria-label={localize('com_ui_add')}
            disabled={isUpdatingItems}
          >
            <Plus size={16} className="text-text-primary" />
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={getKey(item)}
            className="flex items-center justify-between rounded bg-surface-tertiary p-2"
          >
            <span className="text-text-primary">{renderItem(item)}</span>
            {handleRemoveItem && (
              <button
                onClick={() => {
                  setIsUpdatingItems(true);
                  handleRemoveItem(item);
                  setNewItemValue('');
                  setIsUpdatingItems(false);
                }}
                className="rounded-full p-1 hover:bg-surface-secondary"
                aria-label={localize('com_ui_delete')}
                disabled={isUpdatingItems}
              >
                <X size={16} className="text-text-primary" />
              </button>
            )}
          </li>
        ))}

        {handleAddItem && showNewItemInput && (
          <li className="flex items-center rounded bg-surface-tertiary p-2">
            <input
              type="text"
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              placeholder="Value"
              className="flex-1 border-none bg-surface-tertiary text-text-primary placeholder:text-text-secondary focus:outline-none"
              disabled={isUpdatingItems}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isUpdatingItems) {
                  setIsUpdatingItems(true);
                  handleAddItem(newItemValue);
                  setNewItemValue('');
                  setIsUpdatingItems(false);
                }
              }}
            />
            <button
              onClick={() => {
                setIsUpdatingItems(true);
                handleAddItem(newItemValue);
                setNewItemValue('');
                setIsUpdatingItems(false);
              }}
              className="ml-2 rounded-full p-1 hover:bg-surface-secondary"
              aria-label={localize('com_ui_confirm') + ' ' + localize('com_ui_add')}
              disabled={isUpdatingItems}
            >
              {isUpdatingItems ? '...' : <Plus size={16} className="text-text-primary" />}
            </button>
            <button
              onClick={() => {
                setShowNewItemInput(false);
                setNewItemValue('');
              }}
              className="ml-1 rounded-full p-1 hover:bg-surface-secondary"
              aria-label={localize('com_ui_cancel') + ' ' + localize('com_ui_add')}
              disabled={isUpdatingItems}
            >
              <X size={16} className="text-text-primary" />
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default GenericList;
