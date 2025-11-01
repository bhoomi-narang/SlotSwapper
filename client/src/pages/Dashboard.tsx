import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventStatus } from '../types';
import CreateEventModal from '../components/CreateEventModal.tsx';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { events, isLoading, createEvent, makeSwappable, deleteEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.BUSY:
        return 'bg-gray-100 text-gray-800';
      case EventStatus.SWAPPABLE:
        return 'bg-green-100 text-green-800';
      case EventStatus.SWAP_PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600 mt-1">Manage your calendar and make slots swappable</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>
                        <strong>Start:</strong>{' '}
                        {format(new Date(event.startTime), 'PPP p')}
                      </p>
                      <p>
                        <strong>End:</strong> {format(new Date(event.endTime), 'PPP p')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {event.status === EventStatus.BUSY && (
                      <button
                        onClick={() => makeSwappable(event._id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Make Swappable
                      </button>
                    )}
                    {event.status !== EventStatus.SWAP_PENDING && (
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createEvent}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;