import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, ListGroup, Alert, Spinner, Badge } from 'react-bootstrap'; // Added ListGroup, Alert, Spinner, Badge
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import NavBar from './NavBar';
// Assuming api.js is in ../../api and exports getTaskFiles, deleteTaskFile
// If your api.js is in the same directory, it would be './api'
// For this example, I'll assume it's in a parent 'api' folder as suggested.
// If api.js is not set up, these functions would need to be defined or imported correctly.
// For now, I'll mock them if they are not truly available for the sake of this example.

// Mock API functions if not available - replace with actual imports
const mockApi = {
  getTaskFiles: async (taskId) => {
    console.warn(`Mock getTaskFiles called for taskId: ${taskId}. Implement actual API call.`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate some files if taskId is known, e.g., from selectedTaskForView
    if (taskId === 1) { // Example task ID
        return { data: [
            { id: 1, original_filename: 'document.pdf', url: '#', user: { username: 'testuser' }, user_id: 1, created_at: new Date().toISOString(), size: 102400 },
            { id: 2, original_filename: 'image.png', url: '#', user: { username: 'anotheruser' }, user_id: 2, created_at: new Date().toISOString(), size: 204800 },
        ]};
    }
    return { data: [] };
  },
  deleteTaskFile: async (fileId) => {
    console.warn(`Mock deleteTaskFile called for fileId: ${fileId}. Implement actual API call.`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { message: 'File deleted successfully (mock)' } };
  }
};

// Use actual API functions if they exist, otherwise use mocks
// Ensure this path is correct for your project structure
// import { getTaskFiles, deleteTaskFile } from '../../api';
// For this example, let's use the mock if the import fails or is not set up
let getTaskFiles, deleteTaskFile;
try {
    const api = await import('../../api'); // Adjust path as needed
    getTaskFiles = api.getTaskFiles;
    deleteTaskFile = api.deleteTaskFile;
    if (!getTaskFiles || !deleteTaskFile) throw new Error("API functions not found, using mocks.");
} catch (e) {
    console.warn("Failed to import from '../../api'. Using mock API functions for getTaskFiles and deleteTaskFile.", e);
    getTaskFiles = mockApi.getTaskFiles;
    deleteTaskFile = mockApi.deleteTaskFile;
}


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

  // --- NEW STATE FOR ATTACHMENTS IN VIEW MODAL ---
  const [viewModalAttachedFiles, setViewModalAttachedFiles] = useState([]);
  const [viewModalFilesLoading, setViewModalFilesLoading] = useState(false);
  const [viewModalFileError, setViewModalFileError] = useState('');
  // --- END OF NEW STATE ---

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
      
      const isCompletingTask = (status === 'completed' && task.status !== 'completed');
      
      if (isCompletingTask) {
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
      
      if (isCompletingTask) {
        setTimeout(() => {
          axios.get('http://127.0.0.1:8000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(error => console.error('Error refreshing notifications:', error));
        }, 1000);
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

  const handleCompleteTask = async (task) => {
    try {
      const token = localStorage.getItem('access_token');
      const updatedTask = {
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
      
      setTimeout(() => {
        axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => console.error('Error refreshing notifications:', error));
      }, 1000);
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  // --- NEW FUNCTION TO FETCH ATTACHMENTS FOR VIEW MODAL ---
  const fetchAttachmentsForViewModal = useCallback(async (taskId) => {
    if (!taskId) return;
    setViewModalFilesLoading(true);
    setViewModalFileError('');
    try {
      const response = await getTaskFiles(taskId); // Uses imported or mocked getTaskFiles
      setViewModalAttachedFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching attachments for view modal:', error);
      setViewModalFileError('Failed to load attachments. ' + (error.response?.data?.message || error.message));
      setViewModalAttachedFiles([]);
    } finally {
      setViewModalFilesLoading(false);
    }
  }, []); // No dependencies needed if getTaskFiles is stable

  const handleViewTaskDetails = async (task) => {
    try {
      const token = localStorage.getItem('access_token');
      // Fetch full task details to ensure all fields are up-to-date
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullTaskData = response.data;
      setSelectedTaskForView(fullTaskData);
      setShowTaskDetailsModal(true);
      await fetchComments(fullTaskData.id);
      await fetchAttachmentsForViewModal(fullTaskData.id); // <-- ADDED THIS
    } catch (error) {
      console.error('Error fetching task details:', error);
      // Fallback to using the task data we already have from the list if API fails
      setSelectedTaskForView(task); 
      setShowTaskDetailsModal(true);
      await fetchComments(task.id);
      await fetchAttachmentsForViewModal(task.id); // <-- ADDED THIS (also in fallback)
    }
  };

  const closeTaskDetailsModal = () => {
    setShowTaskDetailsModal(false);
    setSelectedTaskForView(null);
    setComments([]);
    setNewComment('');
    setViewModalAttachedFiles([]); // <-- ADDED THIS
    setViewModalFileError('');   // <-- ADDED THIS
  };

  const openAmountModal = (task) => {
    setSelectedTaskForAmount(task);
    setAmountUsed(task.amount_used || ''); // Pre-fill if exists
    setShowAmountModal(true);
  };

  const closeAmountModal = () => {
    setShowAmountModal(false);
    setSelectedTaskForAmount(null);
    setAmountUsed('');
  };

  const handleAmountSubmit = async () => {
    if (!selectedTaskForAmount) return;
    const used = parseFloat(amountUsed);
    if (isNaN(used) || used < 0) return alert('Please enter a valid non-negative amount.');
    
    // Check against budget if budget is defined and not null
    if (selectedTaskForAmount.budget !== null && selectedTaskForAmount.budget !== undefined && used > parseFloat(selectedTaskForAmount.budget)) {
        return alert('Amount used cannot exceed task budget.');
    }

    try {
      const token = localStorage.getItem('access_token');
      // Only send amount_used to avoid overwriting other fields unintentionally
      await axios.put(`http://127.0.0.1:8000/api/tasks/${selectedTaskForAmount.id}`, {
        amount_used: used
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      closeAmountModal();
      fetchTasks(); // Refresh tasks to show updated amount
    } catch (error) {
      console.error('Error updating amount used:', error);
      alert(error.response?.data?.message || 'Failed to update amount.');
    }
  };

  const handleViewProject = (project) => {
    setSelectedProjectForView(project);
    setShowProjectModal(true);
  };

  const fetchComments = async (taskId) => {
    if (!taskId) {
      setComments([]);
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || !selectedTaskForView) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForView.id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      await fetchComments(selectedTaskForView.id);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTaskForView || !commentId) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForView.id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchComments(selectedTaskForView.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment.');
    }
  };

  const formatDeadline = (deadline) => deadline ? new Date(deadline).toLocaleDateString() : 'No deadline';

  const getTaskPriorityBadge = (priority) => {
    let cls = 'bg-info text-dark';
    if (priority === 'high') cls = 'bg-danger';
    else if (priority === 'medium') cls = 'bg-warning text-dark';
    return <Badge pill className={`${cls} me-1`}>{priority ? priority.toUpperCase() : 'N/A'}</Badge>;
  };

  const getTaskStatusBadge = (status) => {
    const map = { completed: 'success', in_progress: 'warning', pending: 'secondary' };
    return <Badge pill bg={map[status] || 'secondary'}>{status ? status.replace('_', ' ').toUpperCase() : 'N/A'}</Badge>;
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
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Budget</th>
                      <th>Amount Used</th>
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
                          {task.project && task.project.project_code && <span className="text-muted small"> ({task.project.project_code})</span>}
                        </td>
                        <td>{user.role === 'team_member' ? (
                          <Form.Select size="sm" value={task.status} onChange={e => handleStatusChange(task, e.target.value)} style={{minWidth: '120px'}}>
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
                            <Button 
                              size="sm" 
                              variant="outline-info" 
                              onClick={() => handleViewTaskDetails(task)}
                            >
                              View
                            </Button>
                            <Button size="sm" variant="outline-warning" onClick={() => openAmountModal(task)}>Update Amount</Button>
                            {user.role !== 'team_member' && task.project && (
                              <Button size="sm" variant="outline-secondary" onClick={() => handleViewProject(task.project)}>View Project</Button>
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

      <TaskModal show={showTaskModal} handleClose={() => setShowTaskModal(false)} task={selectedTask} refreshTasks={fetchTasks} projects={projects} users={users} user={user} />

      <Modal show={showAmountModal} onHide={closeAmountModal}>
        <Modal.Header closeButton><Modal.Title>Update Amount Used for {selectedTaskForAmount?.title}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Amount Used (₱)</Form.Label>
            <Form.Control type="number" step="0.01" value={amountUsed} onChange={e => setAmountUsed(e.target.value)} />
            {selectedTaskForAmount?.budget != null && 
              <Form.Text className="text-muted">
                Task Budget: ₱{parseFloat(selectedTaskForAmount.budget).toFixed(2)}
              </Form.Text>
            }
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAmountModal}>Cancel</Button>
          <Button variant="primary" onClick={handleAmountSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTaskDetailsModal} onHide={closeTaskDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Task Details: {selectedTaskForView?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTaskForView && (
            <>
              <ul className="nav nav-tabs mb-3" id="taskDetailsTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details-content" type="button" role="tab" aria-controls="details-content" aria-selected="true">
                    Task Details
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="attachments-tab" data-bs-toggle="tab" data-bs-target="#attachments-content" type="button" role="tab" aria-controls="attachments-content" aria-selected="false">
                    Attachments <Badge pill bg="secondary">{viewModalAttachedFiles.length}</Badge>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments-content" type="button" role="tab" aria-controls="comments-content" aria-selected="false">
                    Comments <Badge pill bg="secondary">{comments.length}</Badge>
                  </button>
                </li>
              </ul>
              <div className="tab-content" id="taskTabsContent">
                <div className="tab-pane fade show active" id="details-content" role="tabpanel" aria-labelledby="details-tab">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4>{selectedTaskForView.title}</h4>
                      <p className="text-muted" style={{whiteSpace: "pre-wrap"}}>{selectedTaskForView.description}</p>
                    </div>
                    <div className="d-flex gap-2">
                      {user.role !== 'team_member' && (
                        <>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => {
                              closeTaskDetailsModal(); // Close view modal
                              handleEditTask(selectedTaskForView); // Open edit modal
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this task?')) {
                                handleDeleteTask(selectedTaskForView.id);
                                closeTaskDetailsModal();
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="text-muted">Project</h6>
                        <p>{selectedTaskForView.project?.project_name || selectedTaskForView.project?.title || 'No Project'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Assigned To</h6>
                        <p>{selectedTaskForView.user?.name || selectedTaskForView.user?.username || 'Unassigned'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Priority</h6>
                        <p>{getTaskPriorityBadge(selectedTaskForView.priority)}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Status</h6>
                        <p>{getTaskStatusBadge(selectedTaskForView.status)}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="text-muted">Deadline</h6>
                        <p>{selectedTaskForView.deadline ? formatDeadline(selectedTaskForView.deadline) : 'No deadline set'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Budget</h6>
                        <p>{selectedTaskForView.budget != null ? `₱${parseFloat(selectedTaskForView.budget).toFixed(2)}` : 'No budget set'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Amount Used</h6>
                        <p>{selectedTaskForView.amount_used != null ? `₱${parseFloat(selectedTaskForView.amount_used).toFixed(2)}` : 'Not set'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Time Spent</h6>
                        <p>{selectedTaskForView.time_spent ? `${selectedTaskForView.time_spent} seconds` : 'No time recorded'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Time Range</h6>
                        <p className="mb-1">
                          <small>Start: </small>
                          {selectedTaskForView.start_time ? new Date(selectedTaskForView.start_time).toLocaleString() : 'Not started'}
                        </p>
                        <p className="mb-0">
                          <small>End: </small>
                          {selectedTaskForView.end_time ? new Date(selectedTaskForView.end_time).toLocaleString() : 'Not ended'}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="tab-pane fade" id="attachments-content" role="tabpanel" aria-labelledby="attachments-tab">
                  <h5>Task Attachments</h5>
                  {viewModalFileError && <Alert variant="danger" className="mt-2 small">{viewModalFileError}</Alert>}
                  {viewModalFilesLoading ? (
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm" /> Loading attachments...
                    </div>
                  ) : viewModalAttachedFiles.length > 0 ? (
                    <ListGroup variant="flush" className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {viewModalAttachedFiles.map(file => (
                        <ListGroup.Item key={file.id} className="d-flex justify-content-between align-items-center p-2">
                          <div>
                            <a href={file.file_path || file.url} target="_blank" rel="noopener noreferrer" title={`Download ${file.original_filename}`}>
                              {file.original_filename}
                            </a>
                            <br />
                            <small className="text-muted">
                              Uploaded by: {file.user?.name || file.user?.username || 'Unknown'} on {new Date(file.created_at).toLocaleDateString()}
                              {' '}({(file.size / 1024).toFixed(1)} KB)
                            </small>
                          </div>
                          {(user && (user.id === file.user_id || user.role === 'project_manager')) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={async () => {
                                if (!window.confirm(`Are you sure you want to delete "${file.original_filename}"?`)) return;
                                setViewModalFileError(''); // Clear previous errors
                                try {
                                  await deleteTaskFile(file.id); // Uses imported or mocked deleteTaskFile
                                  if (selectedTaskForView) {
                                    fetchAttachmentsForViewModal(selectedTaskForView.id); // Refresh list
                                  }
                                } catch (delError) {
                                  console.error("Error deleting file from view modal:", delError);
                                  setViewModalFileError('Delete failed: ' + (delError.response?.data?.message || delError.message));
                                }
                              }}
                              title="Delete file"
                            >
                              <i className="fas fa-trash"></i> {/* Font Awesome trash icon */}
                            </Button>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted small mt-2">No attachments for this task.</p>
                  )}
                </div>

                <div className="tab-pane fade" id="comments-content" role="tabpanel" aria-labelledby="comments-tab">
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                    {comments && comments.length > 0 ? (
                      comments.map((comment, index) => {
                        if (!comment) return null;
                        const commentUser = comment.user || { name: 'Unknown User', username: 'Unknown User' };
                        const isCurrentUserComment = comment.user_id === user?.id;
                        
                        return (
                          <div key={comment.id || `comment-${index}`} className="mb-3 p-2 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong className="d-block">
                                  {commentUser.name || commentUser.username}
                                </strong>
                                <small className="text-muted">
                                  {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Unknown date'}
                                </small>
                              </div>
                              {(isCurrentUserComment || user?.role === 'project_manager') && (
                                <Button 
                                  size="sm" 
                                  variant="link" 
                                  className="text-danger p-0"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  title="Delete comment"
                                >
                                  <i className="fas fa-trash"></i> {/* Font Awesome trash icon */}
                                </Button>
                              )}
                            </div>
                            <div className="mt-2" style={{whiteSpace: "pre-wrap"}}>{comment.comment || 'No comment content'}</div>
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