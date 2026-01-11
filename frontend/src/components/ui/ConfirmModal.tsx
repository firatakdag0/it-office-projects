'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    variant = 'danger',
    isLoading = false
}: ConfirmModalProps) {
    const colors = {
        danger: 'text-red-600 bg-red-100',
        warning: 'text-yellow-600 bg-yellow-100',
        info: 'text-blue-600 bg-blue-100'
    };

    const buttonVariants = {
        danger: 'orange', // Using orange as it's the theme's primary action color, but we'll style it for danger below
        warning: 'orange',
        info: 'orange'
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-slate-100">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${colors[variant]}`}>
                                        <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900">
                                        {title}
                                    </Dialog.Title>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                <div className="mt-8 flex space-x-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onClose}
                                        className="flex-1 rounded-2xl h-12 font-bold bg-slate-50 border-none text-slate-600 hover:bg-slate-100"
                                    >
                                        {cancelText}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="orange"
                                        onClick={onConfirm}
                                        isLoading={isLoading}
                                        className={`flex-1 rounded-2xl h-12 font-bold shadow-lg ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'shadow-orange-100'}`}
                                    >
                                        {confirmText}
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
