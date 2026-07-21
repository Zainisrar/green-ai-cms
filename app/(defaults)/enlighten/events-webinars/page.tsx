'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface EventImage {
    src: string;
    alt: string;
}

interface EventCTA {
    text: string;
    href: string;
}

interface UpcomingEvent {
    title: string;
    description: string;
    featuredImg: EventImage;
    slug: string;
    year: string;
    location: string;
    cta: EventCTA;
}

interface EventsMainPage {
    title: string;
    subHeadline: string;
    description: string;
    quote: {
        text: string;
        highlighted: string;
    };
    cta: EventCTA[];
}

interface EventsData {
    id?: number;
    upcomingEvents: UpcomingEvent[];
    mainPage: EventsMainPage;
}

const EventsWebinarsPage = () => {
    const router = useRouter();
    const [eventsData, setEventsData] = useState<EventsData | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchEventsData();
    }, []);

    const fetchEventsData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/events-webinars');
            if (result.success) {
                setEventsData(result.data);
            }
        } catch (error: any) {
            console.error('Fetch events data error:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteEvent = async (event: UpcomingEvent) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete event "${event.title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const updatedEvents = eventsData?.upcomingEvents.filter(e => e.slug !== event.slug) || [];
                
                const payload = {
                    id: eventsData?.id,
                    upcomingEvents: updatedEvents,
                    mainPage: eventsData?.mainPage
                };

                const deleteResult = await apiClient.put('/api/enlighten/events-webinars', payload);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Event has been deleted.', 'success');
                    fetchEventsData();
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete event', 'error');
                }
            } catch (error: any) {
                console.error('Delete event error:', error);
                Swal.fire('Error', error.message || 'Failed to delete event', 'error');
            }
        }
    };



    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Events & Webinars</h5>
                    <button
                        onClick={() => router.push('/enlighten/events-webinars/add')}
                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        <IconPlus className="w-5 h-5 mr-2" />
                        Add Event
                    </button>
                </div>

                {/* Main Page Info */}
                {eventsData?.mainPage && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{eventsData.mainPage.title}</h3>
                            <button
                                onClick={() => router.push('/enlighten/events-webinars/edit-main-page')}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit Main Page"
                            >
                                <IconEdit className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{eventsData.mainPage.subHeadline}</p>
                        <p className="text-sm">{eventsData.mainPage.description}</p>
                    </div>
                )}

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventsData?.upcomingEvents?.map((event, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            {event.featuredImg.src && (
                                <img 
                                    src={event.featuredImg.src} 
                                    alt={event.featuredImg.alt}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{event.title}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/enlighten/events-webinars/edit/${event.slug}`)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit Event"
                                        >
                                            <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete Event"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                                <div className="text-xs text-gray-500 mb-2">
                                    <span className="mr-4">📅 {event.year}</span>
                                    <span>📍 {event.location}</span>
                                </div>
                                {event.cta.text && (
                                    <a 
                                        href={event.cta.href}
                                        className="inline-block bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {event.cta.text}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {(!eventsData?.upcomingEvents || eventsData.upcomingEvents.length === 0) && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No events available. Add your first event!</p>
                    </div>
                )}


            </div>
        </ProtectedRoute>
    );
};

export default EventsWebinarsPage;