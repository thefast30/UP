// UTM parameter utilities for tracking
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Get UTM parameters from URL
export const getUTMParams = (): UTMParams => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_term: urlParams.get('utm_term') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
  };
};

// Build UTM query string
export const buildUTMString = (params: UTMParams): string => {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`);
  
  return filteredParams.length > 0 ? `&${filteredParams.join('&')}` : '';
};

// Store UTM parameters in localStorage for persistence
export const storeUTMParams = (params: UTMParams): void => {
  localStorage.setItem('utm_params', JSON.stringify(params));
};

// Get stored UTM parameters
export const getStoredUTMParams = (): UTMParams => {
  try {
    const stored = localStorage.getItem('utm_params');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Track events with UTM parameters
export const trackEvent = (eventName: string, additionalData?: Record<string, any>): void => {
  const utmParams = getStoredUTMParams();
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    ...utmParams,
    ...additionalData
  };
  
  // Log to console for development (replace with your analytics service)
  console.log('Event tracked:', eventData);
  
  // Here you would send to your analytics service
  // Example: analytics.track(eventName, eventData);
  
  // Store in localStorage for debugging
  const events = JSON.parse(localStorage.getItem('tracked_events') || '[]');
  events.push(eventData);
  localStorage.setItem('tracked_events', JSON.stringify(events.slice(-50))); // Keep last 50 events
};