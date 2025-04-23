import React, { FC, useCallback } from 'react';
import { cn, defaultTextProps, removeFocusOutlines } from '~/utils';
import { Controller, FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { useLocalize, useSmaLocalize } from '~/hooks';
import { OrgForm } from '~/common';
import { defaultOrgFormValues } from 'librechat-data-provider';
import { Button } from '~/components';
import { useCreateTrainingOrganizationMutation } from '~/data-provider/TrainingOrganizations';
import { X, Plus } from 'lucide-react';

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
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'administrators' as never,
  });

  const create = useCreateTrainingOrganizationMutation();

  const onFormSubmit = useCallback(
    (data: OrgForm) => {
      const { name, administrators } = data;

      // Ensure name is not empty after trimming
      if (!name || !name.trim()) {
        return;
      }

      create.mutate({
        name: name.trim(),
        administrators,
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
              rules={{
                required: smaLocalize('com_superadmin_error_name_required'),
                validate: (value) =>
                  (value && value.trim().length > 0) ||
                  smaLocalize('com_superadmin_error_name_not_empty'),
              }}
              render={({ field }) => (
                <>
                  <input
                    {...field}
                    value={field.value ?? ''}
                    maxLength={512}
                    className={inputClass}
                    type="text"
                    placeholder={smaLocalize('com_superadmin_give_org_name')}
                    aria-label="Organization name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              {smaLocalize('com_superadmin_administrators')}
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    name={`administrators.${index}`}
                    control={control}
                    rules={{
                      required: smaLocalize('com_superadmin_error_email_required'),
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: smaLocalize('com_superadmin_error_email_invalid'),
                      },
                    }}
                    render={({ field }) => (
                      <>
                        <input
                          {...field}
                          className={inputClass}
                          type="email"
                          placeholder={smaLocalize('com_superadmin_admin_email_placeholder')}
                          aria-label="Administrator email"
                        />
                        {errors.administrators?.[index] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.administrators[index]?.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border-light bg-surface-secondary text-token-text-secondary hover:bg-surface-tertiary"
                    aria-label="Remove administrator"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append('')}
                className="flex items-center gap-2 rounded-md border border-border-light bg-surface-secondary px-3 py-2 text-sm text-token-text-secondary hover:bg-surface-tertiary"
              >
                <Plus className="h-4 w-4" />
                {smaLocalize('com_superadmin_add_administrator')}
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              size={'sm'}
              variant={'outline'}
              className="btn btn-neutral border-token-border-light relative h-9 w-full gap-1 rounded-lg font-medium"
              type="button"
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
