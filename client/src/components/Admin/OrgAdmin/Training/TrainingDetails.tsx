import React, { FC } from 'react';
import { useSmaLocalize } from '~/hooks';
import { TrainingWithStatus } from 'librechat-data-provider';

const TrainingDetails: FC<{
  training: TrainingWithStatus;
  expandedTrainingId: string | null;
}> = ({ training, expandedTrainingId }) => {
  const smaLocalize = useSmaLocalize();
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expandedTrainingId === training._id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="border-l-4 border-t border-border-light p-3 pb-4 pl-8 pt-4">
        <div className="flex flex-col gap-1 text-sm">
          <div className="text-text-primary">
            <span className="font-bold">{smaLocalize('com_orgadmin_description')} :</span>{' '}
            {training.description}
          </div>
          <div className="text-text-primary">
            <span className="font-bold">{smaLocalize('com_orgadmin_location')} : </span>{' '}
            {training.location}
          </div>
          <div className="text-text-primary">
            <span className="font-bold">{smaLocalize('com_orgadmin_timezone')} : </span>{' '}
            {training.timezone}
          </div>
          <div className="text-text-primary">
            <span className="font-bold">{smaLocalize('com_orgadmin_start_date')} : </span>{' '}
            {new Date(training.startDateTime).toLocaleString()}
          </div>
          <div className="text-text-primary">
            <span className="font-bold">{smaLocalize('com_orgadmin_end_date')} : </span>{' '}
            {new Date(training.endDateTime).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetails;
