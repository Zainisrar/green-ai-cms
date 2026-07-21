'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: string;
}

const NotificationsPage = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                setNotifications(result.data);
            } else {
                if (response.status === 401) {
                    router.push('/auth/login');
                }
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return 'ℹ️';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-l-green-500 bg-green-50';
            case 'warning':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'error':
                return 'border-l-red-500 bg-red-50';
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    if (loading) {
        return <div className="panel">Loading notifications...</div>;
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Notifications</h5>
                <span className="badge badge-outline-primary">
                    {notifications.filter(n => !n.isRead).length} Unread
                </span>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No notifications found</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`border-l-4 p-4 rounded-r-lg ${getTypeColor(notification.type)} ${
                                !notification.isRead ? 'font-semibold' : 'opacity-75'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <span className="text-xl">
                                        {getTypeIcon(notification.type)}
                                    </span>
                                    <div>
                                        <h6 className="font-semibold text-gray-900">
                                            {notification.title}
                                        </h6>
                                        <p className="text-gray-700 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;