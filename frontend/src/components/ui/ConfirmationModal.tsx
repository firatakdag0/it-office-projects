'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Onayla',
    cancelText = 'Vazgeç',
    variant = 'info',
    isLoading = false
}: ConfirmationModalProps) {
    const variantConfig = {
        danger: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonVariant: 'secondary' as const, // We use secondary with custom red if needed, or stick to our standard buttons
            confirmClass: 'bg-red-600 hover:bg-red-700 text-white border-transparent'
        },
        warning: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonVariant: 'orange' as const,
            confirmClass: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
        },
        info: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            buttonVariant: 'orange' as const,
            confirmClass: 'bg-slate-800 hover:bg-slate-900 text-white border-transparent'
        }
    };

    const config = variantConfig[variant];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
                                {/* Close Button */}
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Kapat</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className={`mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                                            <config.icon className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-base font-bold leading-6 text-slate-900">
                                                {title}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-slate-500">
                                                    {message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                    <Button
                                        onClick={onConfirm}
                                        isLoading={isLoading}
                                        className={`w-full sm:w-auto ${config.confirmClass} font-bold h-10 px-6 rounded-lg`}
                                    >
                                        {confirmText}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={onClose}
                                        className="mt-3 w-full sm:mt-0 sm:w-auto font-bold h-10 px-6 rounded-lg bg-white"
                                    >
                                        {cancelText}
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
