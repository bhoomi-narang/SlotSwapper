import api from './api';
import { SwapRequest, ApiResponse } from '../types';

export const swapService = {
  createSwapRequest: async (mySlotId: string, theirSlotId: string) => {
    const response = await api.post<ApiResponse<{ swapRequest: SwapRequest }>>(
      '/swap-request',
      {
        mySlotId,
        theirSlotId,
      }
    );
    return response.data;
  },

  getMySwapRequests: async () => {
    const response = await api.get<
      ApiResponse<{
        incoming: { requests: SwapRequest[]; count: number };
        outgoing: { requests: SwapRequest[]; count: number };
        total: number;
      }>
    >('/swap-request/requests');
    return response.data;
  },

  respondToSwapRequest: async (requestId: string, accept: boolean) => {
    const response = await api.post<ApiResponse<{ swapRequest: SwapRequest }>>(
      `/swap-request/response/${requestId}`,
      { accept }
    );
    return response.data;
  },
};