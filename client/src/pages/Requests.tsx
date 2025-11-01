import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Inbox, Send, Check, X, RefreshCw } from 'lucide-react';
import { SwapRequest, SwapRequestStatus } from '../types';
import { swapService } from '../services/swapService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout.tsx';
import { useEvents } from '../hooks/useEvents';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchEvents } = useEvents();

  const fetchSwapRequests = async () => {
    try {
      setIsLoading(true);
      const response = await swapService.getMySwapRequests();
      setIncomingRequests(response.data.incoming.requests);
      setOutgoingRequests(response.data.outgoing.requests);
    } catch (error: any) {
      toast.error('Failed to fetch swap requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  const handleRespond = async (requestId: string, accept: boolean) => {
    const action = accept ? 'accept' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this swap request?`)) {
      return;
    }

    try {
      await swapService.respondToSwapRequest(requestId, accept);
      toast.success(
        accept ? 'Swap accepted! Slots have been swapped.' : 'Swap request rejected'
      );
      
      await Promise.all([fetchSwapRequests(), fetchEvents()]);
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to ${action} swap request`;
      toast.error(message);
    }
  };

  const getStatusBadge = (status: SwapRequestStatus) => {
    switch (status) {
      case SwapRequestStatus.PENDING:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Pending</span>;
      case SwapRequestStatus.ACCEPTED:
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Accepted</span>;
      case SwapRequestStatus.REJECTED:
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Rejected</span>;
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
            <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
            <p className="text-gray-600 mt-1">Manage incoming and outgoing swap requests</p>
          </div>
          <button
            onClick={fetchSwapRequests}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Incoming Requests */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Inbox className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Incoming Requests ({incomingRequests.length})
            </h2>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No incoming swap requests</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {incomingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>{request.requesterId.name}</strong> wants to swap
                      </p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(request.createdAt), 'PPP')}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">They offer:</h4>
                      <p className="font-medium">{request.requesterSlotId.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(request.requesterSlotId.startTime), 'PPP p')}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">For your:</h4>
                      <p className="font-medium">{request.desiredSlotId.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(request.desiredSlotId.startTime), 'PPP p')}
                      </p>
                    </div>
                  </div>

                  {request.status === SwapRequestStatus.PENDING && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRespond(request._id, true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        <Check className="w-5 h-5" />
                        Accept Swap
                      </button>
                      <button
                        onClick={() => handleRespond(request._id, false)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        <X className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Outgoing Requests ({outgoingRequests.length})
            </h2>
          </div>

          {outgoingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No outgoing swap requests</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {outgoingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Sent to <strong>{request.ownerId.name}</strong>
                      </p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(request.createdAt), 'PPP')}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">You offered:</h4>
                      <p className="font-medium">{request.requesterSlotId.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(request.requesterSlotId.startTime), 'PPP p')}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">For their:</h4>
                      <p className="font-medium">{request.desiredSlotId.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(request.desiredSlotId.startTime), 'PPP p')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Requests;
