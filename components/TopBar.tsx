import { useLogout } from '@/hooks/useAuth';
import React, { useState } from 'react'
import { FiUser } from 'react-icons/fi';

const TopBar = () => {

    const logout = useLogout();
    const [showLogout, setShowLogout] = useState(false);
  return (
    <div className="flex justify-between items-center bg-white px-2 py-2 border-b border-gray-300 h-15 sticky top-0">
        <input
        type="text"
        placeholder="Search patients, appointments, bills..."
        className="flex w-96 border border-gray-300 rounded-lg px-4 py-2 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <div className="border rounded-full border-gray-400 p-1 mr-2 cursor-pointer hover:shadow-md"
            onClick={() => setShowLogout((prev) => !prev)}
        >
            <FiUser size={30} />
        </div>

        {showLogout && (
            <div className="absolute right-2 top-10 mt-2 w-32 bg-white border rounded-lg shadow-md z-10">
                <button
                onClick={() => logout.mutate()}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                >
                Logout
                </button>
            </div>
        )}
    </div>
  )
}

export default TopBar
