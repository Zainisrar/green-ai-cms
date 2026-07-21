import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

type DeleteModalProps = {
    isOpen: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onDelete: () => void;
};

const DeleteModal = ({
    isOpen,
    title = 'Delete Item',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onClose,
    onDelete,
}: DeleteModalProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
                <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-[#121c2c] p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start justify-between">
                                    <Dialog.Title className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                                        {title}
                                    </Dialog.Title>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose} aria-label="Close">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                                            <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-4 text-gray-600 dark:text-white-dark">
                                    {description}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" className="btn btn-outline-danger" onClick={onClose}>
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            onDelete();
                                            onClose();
                                        }}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DeleteModal;
