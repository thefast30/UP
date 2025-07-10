import React, { useState, useEffect } from 'react';
import { getStoredUTMParams } from '../utils/utm';

// Debug component to show UTM parameters and tracked events (for development)
export const TrackingDebug: React.FC = () => {
  const [utmParams, setUtmParams] = useState(getStoredUTMParams());
  const [trackedEvents, setTrackedEvents] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const events = JSON.parse(localStorage.getItem('tracked_events') || '[]');
    setTrackedEvents(events);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-blue-700"
      >
        UTM Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-white text-black p-4 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto border">
          <h3 className="font-bold text-sm mb-2">UTM Parameters:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded mb-3 overflow-x-auto">
            {JSON.stringify(utmParams, null, 2)}
          </pre>
          
          <h3 className="font-bold text-sm mb-2">Recent Events:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trackedEvents.slice(-10).reverse().map((event, index) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                <div className="font-semibold">{event.event}</div>
                <div className="text-gray-600">{new Date(event.timestamp).toLocaleTimeString()}</div>
                {event.utm_source && (
                  <div className="text-blue-600">Source: {event.utm_source}</div>
                )}
                {event.utm_campaign && (
                  <div className="text-green-600">Campaign: {event.utm_campaign}</div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem('tracked_events');
              localStorage.removeItem('utm_params');
              setTrackedEvents([]);
              setUtmParams({});
            }}
            className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear Data
          </button>
        </div>
      )}
    </div>
  );
};