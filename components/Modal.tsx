import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out" style={{opacity: isOpen ? 1 : 0}}>
            <div 
                className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out border-t-4 border-cyan-500" 
                style={{transform: isOpen ? 'scale(1)' : 'scale(0.95)'}}
            >
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">{title}</h3>
                    <div className="text-gray-600 dark:text-gray-300 space-y-3">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;