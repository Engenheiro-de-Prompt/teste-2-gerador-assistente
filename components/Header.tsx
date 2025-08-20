
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { BotIcon, LogoutIcon } from './icons';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <BotIcon className="w-8 h-8 text-indigo-400" />
                        <span className="ml-3 font-bold text-xl text-white">AI Assistant Manager</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-300 mr-4">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                            <LogoutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
