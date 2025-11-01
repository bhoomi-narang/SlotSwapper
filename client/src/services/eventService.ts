import api from './api';
import { Event, ApiResponse, EventStatus } from '../types';

export const eventService = {
  getMyEvents: async () => {
    const response = await api.get<ApiResponse<{ events: Event[]; count: number }>>('/events');
    return response.data;
  },

  createEvent: async (data: {
    title: string;
    startTime: string;
    endTime: string;
    status?: EventStatus;
  }) => {
    const response = await api.post<ApiResponse<{ event: Event }>>('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<Event>) => {
    const response = await api.put<ApiResponse<{ event: Event }>>(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/events/${id}`);
    return response.data;
  },

  getSwappableSlots: async () => {
    const response = await api.get<ApiResponse<{ slots: Event[]; count: number }>>(
      '/events/swappable-slots'
    );
    return response.data;
  },

  makeSwappable: async (id: string) => {
    return eventService.updateEvent(id, { status: EventStatus.SWAPPABLE });
  },
};