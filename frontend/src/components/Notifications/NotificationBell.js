import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, Dropdown, ListGroup, Button, Spinner, Tabs, Tab } from 'react-bootstrap';
import { Bell, CheckCircle, ClockHistory } from 'react-bootstrap-icons';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Current access token:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('No access token found, cannot fetch notifications');
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Only show loading spinner on initial load or when not appending
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get comprehensive user info from localStorage
      const userId = localStorage.getItem('user_id');
      const userRole = localStorage.getItem('user_role');
      const userName = localStorage.getItem('user_name');
      const userEmail = localStorage.getItem('user_email');
      
      console.log('User information from localStorage:', {
        userId: userId || 'Not found',
        userRole: userRole || 'Not found',
        userName: userName || 'Not found',
        userEmail: userEmail || 'Not found'
      });
      
      // Add user info to the request headers for better server-side debugging
      const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${token}`,
        'X-User-Role': userRole || 'unknown',
        'X-User-Id': userId || 'unknown'
      };

      // Log the API base URL
      const apiBaseUrl = 'http://127.0.0.1:8000';
      console.log('Using API base URL:', apiBaseUrl);
      
      // Create axios instance with default config including custom user headers
      const api = axios.create({
        baseURL: apiBaseUrl,
        headers: requestHeaders,
        withCredentials: true,
        validateStatus: (status) => status >= 200 && status < 300 || status === 204
      });

      console.log('Fetching notifications and unread count...');
      
      // Fetch unread count first
      console.log('1. Fetching unread count...');
      const unreadRes = await api.get('/api/notifications/unread-count');
      console.log('Unread count response:', {
        status: unreadRes.status,
        statusText: unreadRes.statusText,
        data: unreadRes.data,
        headers: unreadRes.headers
      });
      
      // Add detailed debug info for notification count
      if (unreadRes.data && unreadRes.data.debug) {
        console.log('Backend notification debug info:', unreadRes.data.debug);
      }

      // Fetch notifications with pagination
      console.log('2. Fetching notifications...');
      const notificationsRes = await api.get('/api/notifications', {
        params: {
          page: pageNum,
          per_page: 10 // Show 10 notifications per page
        }
      });
      
      console.log('Notifications response:', {
        status: notificationsRes.status,
        statusText: notificationsRes.statusText,
        data: notificationsRes.data,
        headers: notificationsRes.headers
      });

      // Process notifications
      let notificationsData = [];
      let totalPages = 1;
      
      if (notificationsRes.status === 200) {
        if (notificationsRes.data && notificationsRes.data.data) {
          console.log('Found notifications in data.data');
          notificationsData = notificationsRes.data.data;
          totalPages = notificationsRes.data.last_page || 1;
        } else if (Array.isArray(notificationsRes.data)) {
          console.log('Found notifications in root data array');
          notificationsData = notificationsRes.data;
        } else {
          console.log('Unexpected notifications response format:', notificationsRes.data);
        }
      } else if (notificationsRes.status === 204) {
        console.log('No notifications found (204)');
      } else {
        console.warn('Unexpected status code for notifications:', notificationsRes.status);
      }

      // Log the notification data for debugging
      console.log('Notification data details:', {
        count: notificationsData.length,
        first_item: notificationsData[0] ? {
          id: notificationsData[0].id,
          type: notificationsData[0].type,
          read_at: notificationsData[0].read_at,
          created_at: notificationsData[0].created_at
        } : 'no items',
        notifiable_types: [...new Set(notificationsData.map(n => n.notifiable_type))]
      });

      // Update notifications state
      if (append) {
        setNotifications(prev => [...prev, ...notificationsData]);
      } else {
        setNotifications(notificationsData);
      }
      
      // Update pagination state
      setPage(pageNum);
      setHasMore(pageNum < totalPages);

      // Process unread count
      let count = 0;
      if (unreadRes.status === 200) {
        if (unreadRes.data && typeof unreadRes.data.count !== 'undefined') {
          console.log('Found unread count in data.count');
          count = parseInt(unreadRes.data.count) || 0;
        } else if (typeof unreadRes.data === 'number') {
          console.log('Found unread count as direct number');
          count = unreadRes.data;
        } else {
          console.log('Unexpected unread count format:', unreadRes.data);
        }
      } else if (unreadRes.status === 204) {
        console.log('No unread notifications (204)');
      } else {
        console.warn('Unexpected status code for unread count:', unreadRes.status);
      }
      
      console.log('Setting unread count to:', count);
      setUnreadCount(count);
      
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.status === 401) {
          console.log('Authentication error, removing token and reloading...');
          localStorage.removeItem('access_token');
          window.location.reload();
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
      }
      
      // Ensure we have empty state rather than partially populated state
      if (!append) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      console.log('Finished fetchNotifications');
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset to first page and fetch notifications when dropdown is opened
  useEffect(() => {
    if (show) {
      setPage(1);
      fetchNotifications(1, false);
    }
  }, [show, fetchNotifications]);
  
  // Initial fetch when component mounts
  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!show) { // Only poll when dropdown is closed to avoid UI flicker
        fetchNotifications(1, false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, show]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (notificationId, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      // Find the notification to check if it's already read
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && notification.read_at) {
        return; // Already read, no need to update
      }
      
      // Optimistically update the UI
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() } 
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await axios.post(
        `http://127.0.0.1:8000/api/notifications/${notificationId}/mark-as-read`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        }
      );
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: null } 
            : n
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAllAsRead = async (e) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(n => !n.read_at)
        .map(n => n.id);
      
      if (unreadIds.length === 0) return; // Nothing to mark as read
      
      // Optimistically update the UI
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({
          ...n,
          read_at: n.read_at || new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      await axios.post(
        'http://127.0.0.1:8000/api/notifications/mark-all-as-read',
        {},
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        }
      );
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({
          ...n,
          read_at: n.read_at // Keep existing read_at values
        }))
      );
      // Recalculate unread count
      setUnreadCount(notifications.filter(n => !n.read_at).length);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <span className="text-primary">📋</span>;
      case 'task_completed':
        return <span className="text-success">✅</span>;
      case 'new_comment':
        return <span className="text-info">💬</span>;
      case 'task_updated':
        return <span className="text-warning">✏️</span>;
      case 'project_updated':
        return <span className="text-purple">📂</span>;
      default:
        return <span className="text-secondary">🔔</span>;
    }
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <Dropdown show={show} onToggle={setShow}>
        <Dropdown.Toggle 
          variant="link"
          id="notification-dropdown"
          className="position-relative p-0 border-0 bg-transparent shadow-none"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            boxShadow: 'none',
            outline: 'none'
          }}
        >
          <div className="position-relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge 
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{
                  fontSize: '0.65rem',
                  padding: '0.2rem 0.4rem',
                  minWidth: '1.2rem',
                  height: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translate(-50%, -50%)',
                  top: '5px',
                  left: '15px',
                  border: '2px solid #fff'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu 
          align="end" 
          className="shadow-sm"
          style={{
            minWidth: '350px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid rgba(0,0,0,.15)',
            borderRadius: '0.5rem',
            padding: 0
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="w-100 border-0"
            >
              <Tab 
                eventKey="unread" 
                title={
                  <div className="d-flex align-items-center">
                    <Bell className="me-1" size={14} />
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <Badge bg="danger" className="ms-2" style={{ fontSize: '0.6rem' }}>
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                }
                className="border-0"
              />
              <Tab 
                eventKey="all" 
                title={
                  <div className="d-flex align-items-center">
                    <ClockHistory className="me-1" size={14} />
                    <span>All</span>
                  </div>
                }
                className="border-0"
              />
            </Tabs>
            
            {unreadCount > 0 && activeTab === 'unread' && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-decoration-none position-absolute"
                style={{ right: '1rem', top: '0.75rem' }}
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="tab-content" style={{ minHeight: '200px' }}>
            <Tab.Content>
              <Tab.Pane eventKey="unread" active={activeTab === 'unread'}>
                {loading ? (
                  <div className="text-center p-4">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading unread notifications...
                  </div>
                ) : notifications.filter(n => !n.read_at).length === 0 ? (
                  <div className="text-center p-4">
                    <div className="mb-2">📭</div>
                    <p className="text-muted mb-0">No unread notifications</p>
                    <small className="text-muted">You're all caught up!</small>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {notifications
                      .filter(n => !n.read_at)
                      .map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                          onMarkAsRead={markAsRead}
                          formatTime={formatTime}
                          getNotificationIcon={getNotificationIcon}
                        />
                      ))
                    }
                  </ListGroup>
                )}
              </Tab.Pane>
              
              <Tab.Pane eventKey="all" active={activeTab === 'all'}>
                {loading ? (
                  <div className="text-center p-4">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading all notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center p-4">
                    <div className="mb-2">📭</div>
                    <p className="text-muted mb-0">No notifications yet</p>
                    <small className="text-muted">We'll notify you when there's something new</small>
                  </div>
                ) : (
                  <>
                    <ListGroup variant="flush">
                      {notifications.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                          onMarkAsRead={markAsRead}
                          formatTime={formatTime}
                          getNotificationIcon={getNotificationIcon}
                        />
                      ))}
                    </ListGroup>
                    
                    {hasMore && (
                      <div className="text-center p-2 border-top">
                        <Button 
                          variant="link" 
                          size="sm"
                          className="text-decoration-none"
                          disabled={loadingMore}
                          onClick={() => fetchNotifications(page + 1, true)}
                        >
                          {loadingMore ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Loading...
                            </>
                          ) : (
                            'Load more notifications'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-center p-2 border-top small text-muted">
                      Showing {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                    </div>
                  </>
                )}
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

// Separate component for notification item to improve performance
const NotificationItem = React.memo(({ notification, onMarkAsRead, formatTime, getNotificationIcon }) => (
  <ListGroup.Item 
    action
    className={`p-3 ${!notification.read_at ? 'bg-light' : ''}`}
    onClick={(e) => onMarkAsRead(notification.id, e)}
  >
    <div className="d-flex align-items-start">
      <div className="me-2" style={{ fontSize: '1.2rem' }}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <p className="mb-1" style={{ wordBreak: 'break-word' }}>
            {notification.message}
          </p>
          {!notification.read_at && (
            <span 
              className="badge bg-primary rounded-pill ms-2 flex-shrink-0"
              style={{
                fontSize: '0.6rem',
                padding: '0.15rem 0.35rem',
                lineHeight: '1',
                fontWeight: '500',
                alignSelf: 'flex-start'
              }}
            >
              New
            </span>
          )}
        </div>
        <small className="text-muted d-block mt-1">
          {formatTime(notification.created_at)}
        </small>
      </div>
    </div>
  </ListGroup.Item>
));

NotificationItem.displayName = 'NotificationItem';

export default NotificationBell;
