'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaTrash, FaEdit } from "react-icons/fa";
import { deleteEventById } from '@/app/lib/events';
import toast from 'react-hot-toast';
import ConfirmModal from '@/app/components/ConfirmModal';

interface EventActionsProps {
  eventId: string;
  eventName: string;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export default function EventActions({ 
  eventId, 
  eventName, 
  isOwner = false, 
  isAdmin = false 
}: EventActionsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteEvent = async () => {
    setIsProcessing(true);
    try {
      const success = await deleteEventById(eventId, undefined, isAdmin);
      if (success) {
        toast.success('Event deleted successfully');
        router.push('/events');
        router.refresh();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  const openDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteModal(false);
  };

  const getConfirmMessage = () => {
    if (isAdmin && !isOwner) {
      return `You are about to delete the event "${eventName}" as an administrator. This action cannot be undone.`;
    }
    return `Are you sure you want to delete "${eventName}"? This action cannot be undone.`;
  };

  // Only render the action buttons if the user is either admin or the owner
  if (!isAdmin && !isOwner) {
    return null;
  }

  return (
    <div className="flex gap-2 mt-4">
      {isOwner && (
        <button
          onClick={() => router.push(`/events/${eventId}/edit`)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <FaEdit className="mr-2" /> Edit Event
        </button>
      )}
      
      <button
        onClick={openDeleteConfirmation}
        className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        disabled={isProcessing}
      >
        <FaTrash className="mr-2" /> {isAdmin && !isOwner ? 'Delete as Admin' : 'Delete Event'}
      </button>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Event"
        message={getConfirmMessage()}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteEvent}
        onCancel={closeDeleteConfirmation}
        isProcessing={isProcessing}
      />
    </div>
  );
} 