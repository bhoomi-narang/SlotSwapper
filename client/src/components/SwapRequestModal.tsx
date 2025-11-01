import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, ArrowRightLeft } from 'lucide-react';
import { Event, EventStatus } from '../types';
import { eventService } from '../services/eventService';
import { swapService } from '../services/swapService';
import { toast } from 'react-toastify';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  desiredSlot: Event;
  onSuccess: () => void;
}

const SwapRequestModal = ({ isOpen, onClose, desiredSlot, onSuccess }: SwapRequestModalProps) => {
  const [mySlots, setMySlots] = useState<Event[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMySwappableSlots();
    }
  }, [isOpen]);

  const fetchMySwappableSlots = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getMyEvents();
      const swappableSlots = response.data.events.filter(
        (event) => event.status === EventStatus.SWAPPABLE
      );
      setMySlots(swappableSlots);
    } catch (error) {
      toast.error('Failed to fetch your slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlotId) {
      toast.error('Please select a slot to offer');
      return;
    }

    setIsSubmitting(true);

    try {
      await swapService.createSwapRequest(selectedSlotId, desiredSlot._id);
      toast.success('Swap request sent successfully!');
      onClose();
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create swap request';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const owner = typeof desiredSlot.owner === 'object' ? desiredSlot.owner : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request Slot Swap</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">They offer:</h3>
          <div className="text-sm text-gray-700">
            <p className="font-medium text-lg">{desiredSlot.title}</p>
            {owner && <p className="text-gray-600">Owner: {owner.name}</p>}
            <p className="mt-2">
              <strong>Start:</strong> {format(new Date(desiredSlot.startTime), 'PPP p')}
            </p>
            <p>
              <strong>End:</strong> {format(new Date(desiredSlot.endTime), 'PPP p')}
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <ArrowRightLeft className="w-8 h-8 text-blue-600" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Select your slot to offer:</h3>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : mySlots.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  You don't have any swappable slots. Mark a slot as swappable from your dashboard
                  first.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mySlots.map((slot) => (
                  <label
                    key={slot._id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedSlotId === slot._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mySlot"
                      value={slot._id}
                      checked={selectedSlotId === slot._id}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{slot.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(slot.startTime), 'PPP p')} -{' '}
                        {format(new Date(slot.endTime), 'p')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotId || mySlots.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Sending...' : 'Send Swap Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal;