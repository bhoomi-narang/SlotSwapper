import { useState, useEffect, useCallback } from 'react';
import { Event } from '../types';
import { eventService } from '../services/eventService.ts';
import { toast } from 'react-toastify';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getMyEvents();
      setEvents(response.data.events);
    } catch (error: any) {
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (data: {
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      await eventService.createEvent(data);
      toast.success('Event created successfully!');
      await fetchEvents();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create event';
      toast.error(message);
      throw error;
    }
  };

  const makeSwappable = async (id: string) => {
    try {
      await eventService.makeSwappable(id);
      toast.success('Event marked as swappable!');
      await fetchEvents();
    } catch (error: any) {
      toast.error('Failed to update event');
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted successfully!');
      await fetchEvents();
    } catch (error: any) {
      toast.error('Failed to delete event');
      throw error;
    }
  };

  return {
    events,
    isLoading,
    fetchEvents,
    createEvent,
    makeSwappable,
    deleteEvent,
  };
};