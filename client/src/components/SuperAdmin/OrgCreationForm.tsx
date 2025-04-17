import React, { FC, useCallback } from 'react';
import { cn, defaultTextProps, removeFocusOutlines } from '~/utils';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useLocalize, useSmaLocalize } from '~/hooks';
import { OrgForm } from '~/common';
import { defaultOrgFormValues } from 'librechat-data-provider';
import { Button } from '~/components';
import { useCreateTrainingOrganizationMutation } from '~/data-provider/TrainingOrganizations';

const labelClass = 'mb-2 text-token-text-primary block font-medium';
const inputClass = cn(
  defaultTextProps,
  'flex w-full px-3 py-2 border-border-light bg-surface-secondary focus-visible:ring-2 focus-visible:ring-ring-primary',
  removeFocusOutlines,
);

const OrgCreationForm: FC<{ onSubmit: () => void; onCancel: () => void }> = ({
  onSubmit,
  onCancel,
}) => {
  const smaLocalize = useSmaLocalize();
  const localize = useLocalize();
  const methods = useForm<OrgForm>({
    defaultValues: defaultOrgFormValues,
  });

  const { control, handleSubmit } = methods;

  const create = useCreateTrainingOrganizationMutation();

  const onFormSubmit = useCallback(
    (data: OrgForm) => {
      const { name } = data;

      create.mutate({
        name,
      });

      onSubmit();
    },
    [create, onSubmit],
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="scrollbar-gutter-stable h-auto w-full flex-shrink-0 overflow-x-hidden"
        aria-label="Agent configuration form"
      >
        <div className="max-h-[550px] overflow-auto px-6 md:max-h-[400px] md:min-h-[400px] md:w-[680px]">
          <div className="mb-4">
            <label className={labelClass} htmlFor="name">
              {smaLocalize('com_superadmin_organization_name')}
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ''}
                  maxLength={512}
                  className={inputClass}
                  type="text"
                  placeholder={smaLocalize('com_superadmin_give_org_name')}
                  aria-label="Organization name"
                />
              )}
            />
          </div>
          <div className="flex gap-4">
            <Button
              size={'sm'}
              variant={'outline'}
              className="btn btn-neutral border-token-border-light relative h-9 w-full gap-1 rounded-lg font-medium"
              type='button'
              onClick={onCancel}
            >
              {localize('com_ui_cancel')}
            </Button>
            <button
              className="btn btn-primary focus:shadow-outline flex h-9 w-full items-center justify-center px-4 py-2 font-semibold text-white hover:bg-green-600 focus:border-green-500"
              type="submit"
            >
              {localize('com_ui_create')}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default OrgCreationForm;
