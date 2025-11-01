import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Store, RefreshCw } from 'lucide-react';
import { Event } from '../types';
import { eventService } from '../services/eventService.ts';
import { toast } from 'react-toastify';
import Layout from '../components/Layout.tsx';
import SwapRequestModal from '../components/SwapRequestModal';

const Marketplace = () => {
  const [slots, setSlots] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSwappableSlots = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getSwappableSlots();
      setSlots(response.data.slots);
    } catch (error: any) {
      toast.error('Failed to fetch swappable slots');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSwappableSlots();
  }, []);

  const handleRequestSwap = (slot: Event) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-1">Browse and request swappable slots</p>
          </div>
          <button
            onClick={fetchSwappableSlots}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No swappable slots available</h3>
            <p className="text-gray-600">Check back later for available slots to swap</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {slots.map((slot) => {
              const owner = typeof slot.owner === 'object' ? slot.owner : null;
              return (
                <div
                  key={slot._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{slot.title}</h3>
                    {owner && (
                      <p className="text-sm text-gray-600">
                        <strong>Owner:</strong> {owner.name}
                      </p>
                    )}
                  </div>

                  <div className="text-gray-600 space-y-2 mb-4">
                    <p>
                      <strong>Start:</strong> {format(new Date(slot.startTime), 'PPP p')}
                    </p>
                    <p>
                      <strong>End:</strong> {format(new Date(slot.endTime), 'PPP p')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRequestSwap(slot)}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Request Swap
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedSlot && (
          <SwapRequestModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            desiredSlot={selectedSlot}
            onSuccess={fetchSwappableSlots}
          />
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;