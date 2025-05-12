import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, ListGroup, Badge } from 'react-bootstrap';
import api from '../../api';
import NavBar from './NavBar';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const ActivityFeed = ({ user, onLogout }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch projects activities
      const projectsResponse = await axios.get('http://127.0.0.1:8000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch tasks activities
      const tasksResponse = await axios.get('http://127.0.0.1:8000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform projects into activities
      const projectActivities = projectsResponse.data.map(project => ({
        id: `project-${project.id}`,
        type: 'project_created',
        message: `Project "${project.project_name}" was created`,
        user: project.created_by || 'System',
        created_at: project.created_at,
        details: {
          project_code: project.project_code,
          budget: project.budget,
          status: project.status
        }
      }));

      // Transform tasks into activities
      const taskActivities = tasksResponse.data.map(task => ({
        id: `task-${task.id}`,
        type: 'task_created',
        message: `Task "${task.title}" was created`,
        user: task.assigned_to || 'System',
        created_at: task.created_at,
        details: {
          project: task.project?.project_name,
          status: task.status,
          priority: task.priority
        }
      }));

      // Enhanced task status change activities
      const taskStatusActivities = tasksResponse.data.map(task => {
        const statusActivities = [];
        
        // Handle task start
        if (task.status === 'in_progress' && task.start_time) {
          statusActivities.push({
            id: `task-status-${task.id}-start`,
            type: 'task_status_changed',
            message: `Task "${task.title}" was started`,
            user: task.assigned_to || 'System',
            created_at: task.start_time,
            details: {
              task: task.title,
              previous_status: 'pending',
              new_status: 'in_progress',
              project: task.project?.project_name,
              start_time: task.start_time
            }
          });
        }

        // Handle task completion
        if (task.status === 'completed' && task.end_time) {
          statusActivities.push({
            id: `task-status-${task.id}-complete`,
            type: 'task_status_changed',
            message: `Task "${task.title}" was completed`,
            user: task.assigned_to || 'System',
            created_at: task.end_time,
            details: {
              task: task.title,
              previous_status: 'in_progress',
              new_status: 'completed',
              project: task.project?.project_name,
              end_time: task.end_time
            }
          });
        }

        // Handle status changes back to pending
        if (task.status === 'pending' && task.start_time === null) {
          statusActivities.push({
            id: `task-status-${task.id}-reset`,
            type: 'task_status_changed',
            message: `Task "${task.title}" was reset to pending`,
            user: task.assigned_to || 'System',
            created_at: new Date().toISOString(),
            details: {
              task: task.title,
              previous_status: task.previous_status || 'in_progress',
              new_status: 'pending',
              project: task.project?.project_name
            }
          });
        }

        return statusActivities;
      }).flat();

      // Add task comments activities
      const taskCommentActivities = await Promise.all(
        tasksResponse.data.map(async task => {
          try {
            const commentsResponse = await axios.get(
              `http://127.0.0.1:8000/api/tasks/${task.id}/comments`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            return commentsResponse.data.map(comment => ({
              id: `comment-${comment.id}`,
              type: 'task_comment_added',
              message: `New comment on task "${task.title}"`,
              user: comment.user?.username || 'System',
              created_at: comment.created_at,
              details: {
                task: task.title,
                comment: comment.comment,
                project: task.project?.project_name,
                comment_id: comment.id
              }
            }));
          } catch (error) {
            console.error(`Error fetching comments for task ${task.id}:`, error);
            return [];
          }
        })
      );

      // Combine and sort all activities by date
      const allActivities = [
        ...projectActivities,
        ...taskActivities,
        ...taskStatusActivities,
        ...taskCommentActivities.flat()
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/activities/');
    
    ws.onmessage = (event) => {
      const activity = JSON.parse(event.data);
      setActivities(prev => [activity, ...prev].slice(0, 50));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_created':
        return '📁';
      case 'project_updated':
        return '📂';
      case 'project_status_changed':
        return '🔄';
      case 'project_budget_updated':
        return '💰';
      case 'task_created':
        return '📝';
      case 'task_updated':
        return '✏️';
      case 'task_completed':
        return '✅';
      case 'task_status_changed':
        return '🔄';
      case 'task_comment_added':
        return '💬';
      case 'task_budget_updated':
        return '💵';
      default:
        return '🔔';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'project_created':
      case 'project_updated':
        return 'primary';
      case 'project_status_changed':
        return 'warning';
      case 'project_budget_updated':
        return 'success';
      case 'task_created':
        return 'info';
      case 'task_updated':
        return 'warning';
      case 'task_completed':
        return 'success';
      case 'task_status_changed':
        return 'warning';
      case 'task_comment_added':
        return 'info';
      case 'task_budget_updated':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar via shared NavBar component */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Activity Feed</h3>
          </div>

          {/* Display loading indicator while fetching */}
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  No recent activities
                </div>
              ) : (
                <ListGroup variant="flush">
                  {activities.map((activity) => (
                    <ListGroup.Item 
                      key={activity.id} 
                      className="border-0"
                      onClick={() => handleActivityClick(activity)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-2" style={{ fontSize: '1.2rem' }}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <p className="mb-1" style={{ wordBreak: 'break-word' }}>
                              {activity.message}
                            </p>
                            <Badge bg={getActivityColor(activity.type)} className="ms-2">
                              {activity.type.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <small className="text-muted">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Activity Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Activity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedActivity ? (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>User:</strong> {selectedActivity.user}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Action:</strong> {selectedActivity.message}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Type:</strong> {selectedActivity.type.replace(/_/g, ' ').toUpperCase()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Time:</strong> {formatDistanceToNow(new Date(selectedActivity.created_at), { addSuffix: true })}
              </ListGroup.Item>
              {selectedActivity.details && (
                <ListGroup.Item>
                  <strong>Details:</strong>
                  <div className="mt-2">
                    {selectedActivity.type === 'task_status_changed' ? (
                      <>
                        <div className="mb-1">TASK: {selectedActivity.details.task}</div>
                        <div className="mb-1">PREVIOUS STATUS: {selectedActivity.details.previous_status.replace('_', ' ').toUpperCase()}</div>
                        <div className="mb-1">NEW STATUS: {selectedActivity.details.new_status.replace('_', ' ').toUpperCase()}</div>
                        <div className="mb-1">PROJECT: {selectedActivity.details.project}</div>
                        {selectedActivity.details.start_time && (
                          <div className="mb-1">START TIME: {new Date(selectedActivity.details.start_time).toLocaleString()}</div>
                        )}
                        {selectedActivity.details.end_time && (
                          <div className="mb-1">END TIME: {new Date(selectedActivity.details.end_time).toLocaleString()}</div>
                        )}
                      </>
                    ) : selectedActivity.type === 'task_comment_added' ? (
                      <>
                        <div className="mb-1">TASK: {selectedActivity.details.task}</div>
                        <div className="mb-1">COMMENT: {selectedActivity.details.comment}</div>
                        <div className="mb-1">PROJECT: {selectedActivity.details.project}</div>
                        <div className="mb-1">COMMENT ID: {selectedActivity.details.comment_id}</div>
                      </>
                    ) : (
                      Object.entries(selectedActivity.details).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          {key.replace(/_/g, ' ').toUpperCase()}: {value}
                        </div>
                      ))
                    )}
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ActivityFeed;

