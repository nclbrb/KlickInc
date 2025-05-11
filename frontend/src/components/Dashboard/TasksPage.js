import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import NavBar from './NavBar';

function TasksPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amountUsed, setAmountUsed] = useState('');
  const [selectedTaskForAmount, setSelectedTaskForAmount] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [selectedProjectForView, setSelectedProjectForView] = useState(null);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (user.role === 'project_manager') {
        setUsers(response.data.filter(u => u.role === 'team_member'));
      } else {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const token = localStorage.getItem('access_token');
      let updatedTask = { status };
      
      // Check if we're completing a task
      const isCompletingTask = (status === 'completed' && task.status !== 'completed');
      
      if (isCompletingTask) {
        console.log('Task being completed via dropdown', {
          taskId: task.id,
          oldStatus: task.status,
          newStatus: status
        });
        // Add end time for completed tasks
        updatedTask.end_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
      } else if (status === 'pending') {
        updatedTask.start_time = null;
        updatedTask.end_time = null;
      }
      
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      fetchTasks();
      
      // If completing a task, force refresh notifications for project manager
      if (isCompletingTask) {
        setTimeout(() => {
          console.log('Forcing notification refresh after task completion via dropdown');
          // Call notification endpoint directly to ensure notifications are refreshed
          axios.get('http://127.0.0.1:8000/api/notifications', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }).catch(error => console.error('Error refreshing notifications:', error));
        }, 1000); // Wait 1 second to ensure backend has processed the notification
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleStartTask = async (task) => {
    try {
      const token = localStorage.getItem('access_token');
      const updatedTask = {
        ...task,
        status: 'in_progress',
        start_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error starting task:', error);
      alert('Failed to start task');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTaskForView) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForView.id}/comments/${commentId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      // Refresh comments after deletion
      await fetchComments(selectedTaskForView.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };


  const handleCompleteTask = async (task) => {
    try {
      console.log('Completing task via Complete button', {
        taskId: task.id,
        oldStatus: task.status,
        newStatus: 'completed'
      });
      
      const token = localStorage.getItem('access_token');
      const updatedTask = {
        ...task,
        status: 'completed',
        end_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      fetchTasks();
      
      // Force refresh notifications to ensure project manager gets the notification
      setTimeout(() => {
        console.log('Forcing notification refresh after task completion via Complete button');
        // Call notification endpoint directly to ensure notifications are refreshed
        axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).catch(error => console.error('Error refreshing notifications:', error));
      }, 1000); // Wait 1 second to ensure backend has processed the notification
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  const handleViewTaskDetails = async (task) => {
    try {
      // Fetch the full task details to ensure we have all fields including budget
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Set the task with complete data from the API
      setSelectedTaskForView(response.data);
      setShowTaskDetailsModal(true);
      
      // Fetch comments for the selected task
      await fetchComments(task.id);
    } catch (error) {
      console.error('Error fetching task details:', error);
      // Fallback to using the task data we already have
      setSelectedTaskForView(task);
      setShowTaskDetailsModal(true);
      await fetchComments(task.id);
    }
  };

  const closeTaskDetailsModal = () => {
    setShowTaskDetailsModal(false);
    setSelectedTaskForView(null);
    setComments([]);
    setNewComment('');
  };

  const openAmountModal = (task) => {
    setSelectedTaskForAmount(task);
    setAmountUsed('');
    setShowAmountModal(true);
  };

  const closeAmountModal = () => {
    setShowAmountModal(false);
    setSelectedTaskForAmount(null);
    setAmountUsed('');
  };

  const handleAmountSubmit = async () => {
    const used = parseFloat(amountUsed);
    if (isNaN(used)) return alert('Please enter a valid amount.');
    if (used > (selectedTaskForAmount.budget || 0)) return alert('Cannot exceed task budget.');
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(`http://127.0.0.1:8000/api/tasks/${selectedTaskForAmount.id}`, {
        ...selectedTaskForAmount,
        amount_used: used
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      closeAmountModal();
      fetchTasks();
    } catch (error) {
      console.error('Error updating amount used:', error);
      alert(error.response?.data?.message || 'Failed to update amount.');
    }
  };

  const handleViewProject = (project) => {
    setSelectedProjectForView(project);
    setShowProjectModal(true);
  };

  // === Comments functions ===
  const fetchComments = async (taskId) => {
    if (!taskId) {
      console.error('No task ID provided for fetching comments');
      setComments([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }
      
      console.log('Fetching comments for task ID:', taskId);
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Comments API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching comments:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      setComments([]);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || !selectedTaskForView) return;
    try {
      const token = localStorage.getItem('access_token');
      console.log('Posting comment with data:', {
        taskId: selectedTaskForView.id,
        comment: newComment,
        token: token ? 'Token exists' : 'No token found'
      });
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForView.id}/comments`,
        { comment: newComment },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Comment posted successfully:', response.data);
      setNewComment('');
      // Refresh comments after posting
      await fetchComments(selectedTaskForView.id);
    } catch (error) {
      console.error('Error posting comment:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      alert('Failed to post comment. Please try again.');
    }
  };



  const formatDeadline = (deadline) => deadline ? new Date(deadline).toLocaleDateString() : 'No deadline';

  const getTaskPriorityBadge = (priority) => {
    let cls = 'bg-info text-dark';
    if (priority === 'high') cls = 'bg-danger';
    else if (priority === 'medium') cls = 'bg-warning text-dark';
    return <span className={`badge ${cls}`}>{priority.toUpperCase()}</span>;
  };

  const getTaskStatusBadge = (status) => {
    const map = { completed: 'success', in_progress: 'warning', pending: 'secondary' };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Tasks</h2>
          {user.role !== 'team_member' && (
            <div className="mb-3 text-end">
              <Button className="btn-purp" onClick={handleCreateTask}>+ New Task</Button>
            </div>
          )}
          <Card className="shadow-sm">
            <Card.Header className="bg-purp text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Tasks</h5>
            </Card.Header>
            <Card.Body>
              <div className="scrollable-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Budget</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td><strong>{task.title}</strong>
                          {task.description && <div className="text-muted small">{task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}</div>}
                        </td>
                        <td>
                          {task.project ? (task.project.project_name || task.project.title) : 'No Project'}
                          {task.project && task.project.project_code && <span className="text-muted"> ({task.project.project_code})</span>}
                        </td>
                        <td>{user.role === 'team_member' ? (
                          <Form.Select size="sm" value={task.status} onChange={e => handleStatusChange(task, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </Form.Select>
                        ) : getTaskStatusBadge(task.status)}</td>
                        <td>{getTaskPriorityBadge(task.priority)}</td>
                        <td>{formatDeadline(task.deadline)}</td>
                        <td>{task.budget != null ? `₱${parseFloat(task.budget).toFixed(2)}` : 'N/A'}</td>
                        <td>{task.amount_used != null ? `₱${parseFloat(task.amount_used).toFixed(2)}` : 'Not Set'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {task.status === 'pending' && user.role === 'team_member' && (
                              <Button size="sm" variant="outline-success" onClick={() => handleStartTask(task)}>Start</Button>
                            )}
                            {task.status === 'in_progress' && user.role === 'team_member' && (
                              <Button size="sm" variant="outline-primary" onClick={() => handleCompleteTask(task)}>Complete</Button>
                            )}
                            <Button size="sm" variant="outline-info" onClick={() => {
                              setSelectedTaskForView(task);
                              fetchComments(task.id);
                              setShowTaskDetailsModal(true);
                            }}>View</Button>
                            <Button size="sm" variant="outline-warning" onClick={() => openAmountModal(task)}>Update Amount</Button>
                            {user.role !== 'team_member' && (
                              <>
                                <Button size="sm" variant="outline-secondary" onClick={() => handleEditTask(task)}>Edit</Button>
                                <Button size="sm" variant="outline-danger" onClick={() => handleDeleteTask(task.id)}>Delete</Button>
                                <Button size="sm" variant="outline-primary" onClick={() => handleViewProject(task.project)}>View Project</Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <TaskModal show={showTaskModal} handleClose={() => setShowTaskModal(false)} task={selectedTask} refreshTasks={fetchTasks} projects={projects} users={users} />

      <Modal show={showAmountModal} onHide={closeAmountModal}>
        <Modal.Header closeButton><Modal.Title>Update Amount Used</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Amount Used (₱)</Form.Label>
            <Form.Control type="number" value={amountUsed} onChange={e => setAmountUsed(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAmountModal}>Cancel</Button>
          <Button variant="primary" onClick={handleAmountSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTaskDetailsModal} onHide={closeTaskDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTaskForView && (
            <>
              <ul className="nav nav-tabs" id="taskTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="details-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#details"
                    type="button"
                    role="tab"
                    aria-controls="details"
                    aria-selected="true"
                  >
                    Task Details
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="comments-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#comments"
                    type="button"
                    role="tab"
                    aria-controls="comments"
                    aria-selected="false"
                  >
                    Comments
                  </button>
                </li>
              </ul>
              <div className="tab-content p-3 border border-top-0 rounded-bottom" id="taskTabsContent">
                <div
                  className="tab-pane fade show active"
                  id="details"
                  role="tabpanel"
                  aria-labelledby="details-tab"
                >
                  <h5>{selectedTaskForView.title}</h5>
                  <p>{selectedTaskForView.description}</p>
                  <p><strong>Project:</strong> {selectedTaskForView.project?.project_name || selectedTaskForView.project?.title || 'No Project'}</p>
                  <p><strong>Assigned To:</strong> {selectedTaskForView.assigned_to?.name || 'Unassigned'}</p>
                  <p><strong>Priority:</strong> {getTaskPriorityBadge(selectedTaskForView.priority)}</p>
                  <p><strong>Deadline:</strong> {selectedTaskForView.deadline ? formatDeadline(selectedTaskForView.deadline) : 'No deadline set'}</p>
                  <p><strong>Budget:</strong> {selectedTaskForView.budget ? `₱${parseFloat(selectedTaskForView.budget).toFixed(2)}` : 'No budget set'}</p>
                  <p><strong>Time Spent:</strong> {selectedTaskForView.time_spent ? `${selectedTaskForView.time_spent} secs` : 'No time recorded'}</p>
                  <p><strong>Start Time:</strong> {selectedTaskForView.start_time ? new Date(selectedTaskForView.start_time).toLocaleString() : 'Not started'}</p>
                  <p><strong>End Time:</strong> {selectedTaskForView.end_time ? new Date(selectedTaskForView.end_time).toLocaleString() : 'Not ended'}</p>
                  <p><strong>Status:</strong> {getTaskStatusBadge(selectedTaskForView.status)}</p>
                </div>
                <div
                  className="tab-pane fade"
                  id="comments"
                  role="tabpanel"
                  aria-labelledby="comments-tab"
                >
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                    {comments && comments.length > 0 ? (
                      comments.map((comment, index) => {
                        if (!comment) return null;
                        
                        const commentUser = comment.user || { name: 'Unknown User' };
                        const isCurrentUser = comment.user_id === user?.id;
                        
                        return (
                          <div key={comment.id || `comment-${index}`} className="mb-3 p-2 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong className="d-block">
                                  {commentUser.name}
                                </strong>
                                <small className="text-muted">
                                  {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Unknown date'}
                                </small>
                              </div>
                              {isCurrentUser && (
                                <Button 
                                  size="sm" 
                                  variant="link" 
                                  className="text-danger p-0"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              )}
                            </div>
                            <div className="mt-2">{comment.comment || 'No comment content'}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-muted text-center py-3">No comments yet. Be the first to comment!</div>
                    )}
                  </div>
                  <Form.Group className="mt-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-2"
                    />
                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={postComment}
                        disabled={!newComment.trim()}
                      >
                        Post Comment
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeTaskDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ProjectModal show={showProjectModal} handleClose={() => setShowProjectModal(false)} project={selectedProjectForView} readOnly />
    </Container>
  );
}

export default TasksPage;
