'use client';

import { useState } from 'react';
import { FaTrash } from "react-icons/fa";

interface DeleteButtonProps {
  eventId: string;
  eventName: string;
}

export default function DeleteButton({ eventId, eventName }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center bg-red-500 text-white font-medium py-2 px-6 rounded-md transition-all shadow"
        type="button"
      >
        <FaTrash className="mr-2" /> Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Event</h3>
            <p className="mb-6">
              Are you sure you want to delete "{eventName}"? This action cannot be undone.
            </p>
            
            <div className="flex flex-col gap-4">
              {/* Direct form submission - most reliable approach */}
              <form 
                action={`/api/events/${eventId}/delete`} 
                method="POST"
                className="flex gap-2"
              >
                <input type="hidden" name="_method" value="DELETE" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                >
                  Delete Event
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 