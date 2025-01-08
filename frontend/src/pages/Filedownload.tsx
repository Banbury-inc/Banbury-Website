import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';

const steps = [
  { name: 'Initiating', description: 'Starting the download process', status: 'idle' },
  { name: 'Preparing File', description: 'Getting your file ready', status: 'idle' },
  { name: 'Ready for Download', description: 'Your file is ready to download', status: 'idle' },
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function FileDownload() {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');

  const getStepStatus = (stepIdx: number) => {
    if (downloadStatus === 'error') return 'error';
    if (downloadStatus === 'idle') return 'upcoming';
    if (downloadStatus === 'preparing' && stepIdx === 0) return 'complete';
    if (downloadStatus === 'preparing' && stepIdx === 1) return 'current';
    if (downloadStatus === 'ready' && stepIdx <= 1) return 'complete';
    if (downloadStatus === 'ready' && stepIdx === 2) return 'current';
    return 'upcoming';
  };

  const handleDownload = async () => {
    try {
      setDownloadStatus('preparing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDownloadStatus('ready');
    } catch (error) {
      setDownloadStatus('error');
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <nav aria-label="Progress" className="w-full max-w-xl">
        <ol role="list" className="overflow-hidden">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
              {stepIdx !== steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={classNames(
                    'absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5',
                    getStepStatus(stepIdx) === 'complete' ? 'bg-indigo-600' : 'bg-gray-300'
                  )}
                />
              )}
              <div className="group relative flex items-start">
                <span className="flex h-9 items-center">
                  {getStepStatus(stepIdx) === 'complete' ? (
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-indigo-600">
                      <CheckIcon className="size-5 text-white" />
                    </span>
                  ) : getStepStatus(stepIdx) === 'current' ? (
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                      <span className="size-2.5 rounded-full bg-indigo-600" />
                    </span>
                  ) : (
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="size-2.5 rounded-full bg-transparent" />
                    </span>
                  )}
                </span>
                <span className="ml-4 flex min-w-0 flex-col">
                  <span
                    className={classNames(
                      'text-sm font-medium',
                      getStepStatus(stepIdx) === 'current' ? 'text-indigo-600' : 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </span>
                  <span className="text-sm text-gray-500">{step.description}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      <div className="text-sm text-gray-600">
        {downloadStatus === 'preparing' && 'Preparing your file...'}
        {downloadStatus === 'ready' && 'Your file is ready!'}
        {downloadStatus === 'error' && 'An error occurred. Please try again.'}
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloadStatus === 'preparing'}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
      >
        {downloadStatus === 'preparing' ? 'Preparing...' : 'Download File'}
      </button>
    </div>
  );
}