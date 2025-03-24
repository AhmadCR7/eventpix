// Define the Event interface
export interface Event {
  id: string;
  name: string;
  date: string;
  welcomeMessage: string;
}

// Storage key constant
const STORAGE_KEY = 'guestpix-events';

// In-memory storage for events - this will be shared across components
export let eventsArray: Event[] = [];

// Helper function to get events from localStorage
export const getEventsFromLocalStorage = (): Event[] => {
  // Only access localStorage in browser environment
  if (typeof window !== 'undefined') {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    if (storedEvents) {
      try {
        return JSON.parse(storedEvents);
      } catch (error) {
        console.error('Error parsing events from localStorage:', error);
      }
    }
  }
  return [];
};

// Helper function to save events to localStorage
export const saveEventsToLocalStorage = (events: Event[]): void => {
  // Only access localStorage in browser environment
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }
};

// Initialize the events array from localStorage if available
if (typeof window !== 'undefined') {
  eventsArray = getEventsFromLocalStorage();
}

// Helper function to add a new event
export const addEvent = (event: Event): void => {
  eventsArray.push(event);
  saveEventsToLocalStorage(eventsArray);
};

// Helper function to get all events
export const getAllEvents = (): Event[] => {
  // Ensure we have the latest events from localStorage
  if (typeof window !== 'undefined' && eventsArray.length === 0) {
    eventsArray = getEventsFromLocalStorage();
  }
  return eventsArray;
};

// Helper function to get a single event by ID
export const getEventById = (id: string): Event | undefined => {
  // Ensure we have the latest events from localStorage
  if (typeof window !== 'undefined' && eventsArray.length === 0) {
    eventsArray = getEventsFromLocalStorage();
  }
  return eventsArray.find(event => event.id === id);
};

// Helper function to update an existing event
export const updateEvent = (id: string, updatedEvent: Omit<Event, 'id'>): Event | undefined => {
  const index = eventsArray.findIndex(event => event.id === id);
  
  if (index === -1) {
    return undefined; // Event not found
  }
  
  // Update the event, preserving the original ID
  eventsArray[index] = {
    id,
    ...updatedEvent
  };
  
  // Save to localStorage
  saveEventsToLocalStorage(eventsArray);
  
  return eventsArray[index];
};

// Helper function to delete an event by ID
export const deleteEventById = (id: string | number): boolean => {
  const stringId = id.toString(); // Convert to string in case a number is passed
  const initialLength = eventsArray.length;
  
  // Filter out the event with the matching ID
  const filteredEvents = eventsArray.filter(event => event.id !== stringId);
  
  // Update the array with the filtered results
  eventsArray.length = 0; // Clear the array
  eventsArray.push(...filteredEvents); // Add the filtered events back
  
  // Save to localStorage
  saveEventsToLocalStorage(eventsArray);
  
  // Return true if an event was removed, false otherwise
  return eventsArray.length < initialLength;
}; 