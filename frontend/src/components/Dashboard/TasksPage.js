import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Container, Row, Col, Card, Button, Table, Form, Modal, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap'; // Added ListGroup, Spinner, Alert
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import NavBar from './NavBar';
import { getTaskFiles, deleteTaskFile } from '../../api'; // Import file API functions
import api from '../../api'; // Ensure api is imported if not already

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

  // State for Comments within the View Modal
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // --- NEW STATE for Files within the View Modal ---
  const [viewAttachedFiles, setViewAttachedFiles] = useState([]);
  const [viewFilesLoading, setViewFilesLoading] = useState(false);
  const [viewFileError, setViewFileError] = useState('');
  // --- END OF NEW STATE ---


  // --- Data Fetching ---
  const fetchTasks = useCallback(async () => { // Wrap in useCallback
    try {
      const token = localStorage.getItem('access_token');
      // Consider using api.js instance: const response = await api.get('/tasks');
      const response = await axios.get('http://127.0.0.1:8000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []); // Add dependency array

  const fetchUsers = useCallback(async () => { // Wrap in useCallback
    try {
      const token = localStorage.getItem('access_token');
      // Consider using api.js instance: const response = await api.get('/users');
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure user object exists before accessing role
      if (user && user.role === 'project_manager') {
        setUsers(response.data.filter(u => u.role === 'team_member'));
      } else {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [user]); // Add user dependency

  const fetchProjects = useCallback(async () => { // Wrap in useCallback
    try {
      const token = localStorage.getItem('access_token');
      // Consider using api.js instance: const response = await api.get('/projects');
      const response = await axios.get('http://127.0.0.1:8000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []); // Add dependency array

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
  }, [fetchTasks, fetchUsers, fetchProjects]); // Use fetched functions in dependency array

  // --- Modal Handlers ---
  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // --- Task Actions ---
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('access_token');
      // Consider using api.js instance: await api.delete(`/tasks/${id}`);
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
        console.log('Task being completed via dropdown', { taskId: task.id, oldStatus: task.status, newStatus: status });
        updatedTask.end_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
      } else if (status === 'pending') {
        updatedTask.start_time = null;
        updatedTask.end_time = null;
      }

      // Consider using api.js instance: await api.put(`/tasks/${task.id}`, updatedTask);
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      fetchTasks();

      if (isCompletingTask) {
        // Notification refresh logic... (keep as is)
        setTimeout(() => {
          console.log('Forcing notification refresh after task completion via dropdown');
          axios.get('http://127.0.0.1:8000/api/notifications', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
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
        // ...task, // Spreading task might send unwanted fields, send only necessary ones
        status: 'in_progress',
        start_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      // Consider using api.js instance: await api.put(`/tasks/${task.id}`, updatedTask);
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error starting task:', error);
      alert('Failed to start task');
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      console.log('Completing task via Complete button', { taskId: task.id, oldStatus: task.status, newStatus: 'completed' });
      const token = localStorage.getItem('access_token');
      const updatedTask = {
        // ...task, // Spreading task might send unwanted fields
        status: 'completed',
        end_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      // Consider using api.js instance: await api.put(`/tasks/${task.id}`, updatedTask);
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      fetchTasks();
      // Notification refresh logic... (keep as is)
      setTimeout(() => {
        console.log('Forcing notification refresh after task completion via Complete button');
        axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).catch(error => console.error('Error refreshing notifications:', error));
      }, 1000);
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  // --- View Task Details Modal Logic ---

  // Fetch files specifically for the view modal
  const fetchViewFiles = useCallback(async (taskId) => {
    if (!taskId) return;
    setViewFilesLoading(true);
    setViewFileError('');
    try {
      const response = await getTaskFiles(taskId); // Use API function
      setViewAttachedFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching attached files for view:', error);
      setViewFileError('Failed to load files. ' + (error.response?.data?.message || error.message));
      setViewAttachedFiles([]);
    } finally {
      setViewFilesLoading(false);
    }
  }, []); // No dependencies needed if getTaskFiles doesn't rely on component state

  // Fetch comments specifically for the view modal
  const fetchComments = useCallback(async (taskId) => { // Wrap in useCallback
    if (!taskId) {
      console.error('No task ID provided for fetching comments');
      setComments([]);
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Authentication required');
      // Consider using api.js instance: const response = await api.get(`/tasks/${taskId}/comments`);
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }
      });
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  }, []); // Add dependency array


  const handleViewTaskDetails = useCallback(async (task) => {
    if (!task || !task.id) {
      console.error("handleViewTaskDetails called with invalid task:", task);
      return;
    }
    try {
      console.log(`[TasksPage] Fetching details for task ID: ${task.id}`); // Log task ID being fetched
      const response = await api.get(`/tasks/${task.id}`); // Using your api instance

      // --- ADD THIS CONSOLE LOG ---
      console.log('[TasksPage] Raw task data received from API for view modal:', response.data);
      // Specifically log the user part if it exists
      if (response.data && response.data.user) {
        console.log('[TasksPage] User object within received task data:', response.data.user);
      } else if (response.data) {
        console.log('[TasksPage] User object is MISSING or NULL in received task data. Task assigned_to was:', response.data.assigned_to);
      }
      // --- END OF CONSOLE LOG ---

      setSelectedTaskForView(response.data);
      setShowTaskDetailsModal(true);
      await fetchComments(task.id);
      await fetchViewFiles(task.id);
    } catch (error) {
      console.error('Error fetching task details for view modal:', error);
      // Log error response if available
      if (error.response) {
        console.error('[TasksPage] Error response data:', error.response.data);
        console.error('[TasksPage] Error response status:', error.response.status);
      }
      // Fallback to existing task data (which might be partial)
      setSelectedTaskForView(task);
      setShowTaskDetailsModal(true);
      // Still attempt to fetch comments and files even on error for the main task fetch
      if (task && task.id) {
        await fetchComments(task.id);
        await fetchViewFiles(task.id);
      }
    }
  }, [fetchComments, fetchViewFiles]); // Dependencies

  const closeTaskDetailsModal = () => {
    setShowTaskDetailsModal(false);
    setSelectedTaskForView(null);
    setComments([]);
    setNewComment('');
    // Reset view file state
    setViewAttachedFiles([]);
    setViewFilesLoading(false);
    setViewFileError('');
  };

  // --- Comments Logic (within View Modal) ---
  const postComment = async () => {
    if (!newComment.trim() || !selectedTaskForView) return;
    try {
      const token = localStorage.getItem('access_token');
      // Consider using api.js instance: await api.post(`/tasks/${selectedTaskForView.id}/comments`, { comment: newComment });
      await axios.post(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForView.id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } }
      );
      setNewComment('');
      await fetchComments(selectedTaskForView.id); // Refresh comments
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTaskForView) return;
    try {
      const token = localStorage.getItem('access_token');
      // Consider using api.js instance: await api.delete(`/tasks/${selectedTaskForView.id}/comments/${commentId}`);
      await axios.delete(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForView.id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } }
      );
      await fetchComments(selectedTaskForView.id); // Refresh comments
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // --- File Deletion Logic (within View Modal) ---
  const handleViewFileDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    setViewFileError('');
    try {
      await deleteTaskFile(fileId); // Use API function
      if (selectedTaskForView && selectedTaskForView.id) {
        fetchViewFiles(selectedTaskForView.id); // Refresh file list IN THIS MODAL
      }
    } catch (error) {
      console.error('Error deleting file from view:', error);
      setViewFileError('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- Amount Modal Logic ---
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

  // --- MODIFIED handleAmountSubmit ---
  const handleAmountSubmit = async () => {
    const used = parseFloat(amountUsed);
    if (isNaN(used) || used < 0) return alert('Please enter a valid non-negative amount.');

    // Ensure task data is available
    if (!selectedTaskForAmount || !selectedTaskForAmount.id || !selectedTaskForAmount.status) {
        console.error("Task data (including status) is missing for amount update.");
        alert("Error: Cannot update amount, task data is incomplete.");
        return;
    }

    // Budget check - ensure selectedTaskForAmount has budget loaded
    const taskBudget = selectedTaskForAmount?.budget;
    if (taskBudget !== null && taskBudget !== undefined && used > parseFloat(taskBudget)) {
      return alert('Amount used cannot exceed task budget.');
    }

    try {
      const token = localStorage.getItem('access_token');

      // *** THE FIX: Include the current status in the payload ***
      const payload = {
        amount_used: used,
        status: selectedTaskForAmount.status // Send the current status to satisfy backend validation
      };

      console.log(`Updating task ${selectedTaskForAmount.id} amount used with payload:`, payload); // Debug log

      // Consider using api.js instance: await api.put(`/tasks/${selectedTaskForAmount.id}`, payload);
      await axios.put(`http://127.0.0.1:8000/api/tasks/${selectedTaskForAmount.id}`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      closeAmountModal();
      fetchTasks(); // Refresh the main task list
    } catch (error) {
      console.error('Error updating amount used:', error.response || error); // Log the full error response
      // Display a more specific error if available
      const backendMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      let alertMessage = 'Failed to update amount.';
      if (backendMessage) {
          alertMessage = backendMessage; // Use the main message from backend
      }
      // Append validation error details if they exist
      if (validationErrors) {
          const errorDetails = Object.values(validationErrors).flat().join(' ');
          alertMessage += ` Details: ${errorDetails}`;
      }
      alert(alertMessage);
    }
  };
  // --- END OF MODIFIED handleAmountSubmit ---

  // --- Project Modal Logic ---
  const handleViewProject = (project) => {
    setSelectedProjectForView(project);
    setShowProjectModal(true);
  };

  // --- Formatting Helpers ---
  const formatDeadline = (deadline) => deadline ? new Date(deadline).toLocaleDateString() : 'No deadline';

  const getTaskPriorityBadge = (priority) => {
    let cls = 'bg-info text-dark';
    if (priority === 'high') cls = 'bg-danger';
    else if (priority === 'medium') cls = 'bg-warning text-dark';
    return <span className={`badge ${cls}`}>{priority ? priority.toUpperCase() : 'N/A'}</span>;
  };

  const getTaskStatusBadge = (status) => {
    const map = { completed: 'success', in_progress: 'warning', pending: 'secondary' };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status ? status.replace('_', ' ').toUpperCase() : 'N/A'}</span>;
  };

  // --- Render ---
  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Tasks</h2>
          {/* Create Task Button */}
          {user && user.role !== 'team_member' && (
            <div className="mb-3 text-end">
              <Button className="btn-purp" onClick={handleCreateTask}>+ New Task</Button>
            </div>
          )}

          {/* Task List Card */}
          <Card className="shadow-sm">
            <Card.Header className="bg-purp text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Tasks</h5>
            </Card.Header>
            <Card.Body>
              <div className="scrollable-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Ensure no whitespace directly inside Table or between thead/tbody */}
                <Table hover responsive>
                  <thead>
                    {/* Ensure no whitespace directly inside tr */}
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
                  {/* Attach the opening brace for map directly to tbody */}
                  <tbody>
                    {tasks.map(task => (
                      // The content inside map generates valid tr elements
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && <div className="text-muted small">{task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}</div>}
                        </td>
                        <td>
                          {task.project ? (task.project.project_name || task.project.title || 'N/A') : 'No Project'}
                          {task.project?.project_code && <span className="text-muted small"> ({task.project.project_code})</span>}
                        </td>
                        <td>
                          {user && user.role === 'team_member' && task.assigned_to === user.id ? (
                            <Form.Select size="sm" value={task.status} onChange={e => handleStatusChange(task, e.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </Form.Select>
                          ) : getTaskStatusBadge(task.status)}
                        </td>
                        <td>{getTaskPriorityBadge(task.priority)}</td>
                        <td>{formatDeadline(task.deadline)}</td>
                        <td>{task.budget != null ? `₱${parseFloat(task.budget).toFixed(2)}` : 'N/A'}</td>
                        <td>{task.amount_used != null ? `₱${parseFloat(task.amount_used).toFixed(2)}` : 'Not Set'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {user && user.role === 'team_member' && task.assigned_to === user.id && task.status === 'pending' && (
                              <Button size="sm" variant="outline-success" onClick={() => handleStartTask(task)} title="Start Task">Start</Button>
                            )}
                            {user && user.role === 'team_member' && task.assigned_to === user.id && task.status === 'in_progress' && (
                              <Button size="sm" variant="outline-primary" onClick={() => handleCompleteTask(task)} title="Mark as Complete">Complete</Button>
                            )}
                            <Button size="sm" variant="outline-info" onClick={() => handleViewTaskDetails(task)} title="View Details">View</Button>
                             {(user && (user.role === 'project_manager' || task.assigned_to === user.id)) && (
                                <Button size="sm" variant="outline-warning" onClick={() => openAmountModal(task)} title="Update Amount Used">Amount</Button>
                             )}
                            {user && user.role === 'project_manager' && task.project && (
                              <Button size="sm" variant="outline-secondary" onClick={() => handleViewProject(task.project)} title="View Project Details">Project</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  {/* Attach the closing brace directly to tbody */}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit/Create Task Modal */}
      <TaskModal
        show={showTaskModal}
        handleClose={() => setShowTaskModal(false)}
        task={selectedTask}
        refreshTasks={fetchTasks}
        projects={projects}
        // users={users} // TaskModal fetches its own users now
        currentUser={user} // Pass current user if needed inside TaskModal
      />

      {/* Update Amount Used Modal */}
      <Modal show={showAmountModal} onHide={closeAmountModal}>
        <Modal.Header closeButton><Modal.Title>Update Amount Used for "{selectedTaskForAmount?.title}"</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Amount Used (₱)</Form.Label>
            <Form.Control
                type="number"
                value={amountUsed}
                onChange={e => setAmountUsed(e.target.value)}
                min="0"
                step="0.01"
                placeholder={`Budget: ₱${parseFloat(selectedTaskForAmount?.budget || 0).toFixed(2)}`}
            />
             {selectedTaskForAmount?.budget != null &&
                <Form.Text className="text-muted">
                    Task Budget: ₱{parseFloat(selectedTaskForAmount.budget).toFixed(2)}
                </Form.Text>
             }
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAmountModal}>Cancel</Button>
          <Button variant="primary" onClick={handleAmountSubmit}>Save Amount</Button>
        </Modal.Footer>
      </Modal>

      {/* View Task Details Modal */}
      <Modal show={showTaskDetailsModal} onHide={closeTaskDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Task Details: {selectedTaskForView?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTaskForView && (
            <>
              {/* Tabs for Details, Attachments, Comments */}
              <ul className="nav nav-tabs" id="taskDetailsTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details-content" type="button" role="tab" aria-controls="details-content" aria-selected="true">Details</button>
                </li>
                 {/* NEW Attachments Tab */}
                 <li className="nav-item" role="presentation">
                  <button className="nav-link" id="attachments-tab" data-bs-toggle="tab" data-bs-target="#attachments-content" type="button" role="tab" aria-controls="attachments-content" aria-selected="false">
                    Attachments <Badge pill bg="secondary">{viewAttachedFiles.length}</Badge>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments-content" type="button" role="tab" aria-controls="comments-content" aria-selected="false">
                    Comments <Badge pill bg="secondary">{comments.length}</Badge>
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content p-3 border border-top-0 rounded-bottom" id="taskDetailsTabsContent">
                {/* Details Tab Pane */}
                <div className="tab-pane fade show active" id="details-content" role="tabpanel" aria-labelledby="details-tab">
                   {/* Task Details Content */}
                   <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4>{selectedTaskForView.title}</h4>
                      <p className="text-muted">{selectedTaskForView.description || 'No description.'}</p>
                    </div>
                    <div className="d-flex gap-2">
                      {/* Edit/Delete Buttons for PM */}
                      {user && user.role === 'project_manager' && (
                        <>
                          <Button variant="outline-secondary" size="sm" onClick={() => { closeTaskDetailsModal(); handleEditTask(selectedTaskForView); }} title="Edit Task">Edit</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => { if (window.confirm('Are you sure?')) { handleDeleteTask(selectedTaskForView.id); closeTaskDetailsModal(); } }} title="Delete Task">Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                  <Row>
                    <Col md={6}>
                      <div className="mb-2"><strong className="text-muted d-block">Project:</strong> {selectedTaskForView.project?.project_name || 'N/A'}</div>
                      <div className="mb-2"><strong className="text-muted d-block">Assigned To:</strong>                 {selectedTaskForView.user?.name || selectedTaskForView.user?.username || 'Unassigned'} {/* MODIFIED FOR TEST */} </div>
                      <div className="mb-2"><strong className="text-muted d-block">Priority:</strong> {getTaskPriorityBadge(selectedTaskForView.priority)}</div>
                      <div className="mb-2"><strong className="text-muted d-block">Status:</strong> {getTaskStatusBadge(selectedTaskForView.status)}</div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2"><strong className="text-muted d-block">Deadline:</strong> {selectedTaskForView.deadline ? formatDeadline(selectedTaskForView.deadline) : 'N/A'}</div>
                      <div className="mb-2"><strong className="text-muted d-block">Budget:</strong> {selectedTaskForView.budget != null ? `₱${parseFloat(selectedTaskForView.budget).toFixed(2)}` : 'N/A'}</div>
                      <div className="mb-2"><strong className="text-muted d-block">Amount Used:</strong> {selectedTaskForView.amount_used != null ? `₱${parseFloat(selectedTaskForView.amount_used).toFixed(2)}` : 'N/A'}</div>
                      <div className="mb-2"><strong className="text-muted d-block">Time Spent:</strong> {selectedTaskForView.time_spent ? `${selectedTaskForView.time_spent} secs` : 'N/A'}</div>
                      <div className="mb-2"><strong className="text-muted d-block">Time Range:</strong>
                        <p className="mb-0"><small>Start:</small> {selectedTaskForView.start_time ? new Date(selectedTaskForView.start_time).toLocaleString() : 'N/A'}</p>
                        <p className="mb-0"><small>End:</small> {selectedTaskForView.end_time ? new Date(selectedTaskForView.end_time).toLocaleString() : 'N/A'}</p>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* NEW Attachments Tab Pane */}
                <div className="tab-pane fade" id="attachments-content" role="tabpanel" aria-labelledby="attachments-tab">
                  <h5>Attachments</h5>
                   {viewFileError && <Alert variant="danger" className="mt-2 small">{viewFileError}</Alert>}
                   {viewFilesLoading ? (
                      <div className="text-center my-3">
                          <Spinner animation="border" size="sm" /> Loading files...
                      </div>
                    ) : viewAttachedFiles.length > 0 ? (
                      <ListGroup variant="flush" className="mb-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        {viewAttachedFiles.map(file => (
                          <ListGroup.Item key={file.id} className="d-flex justify-content-between align-items-center p-2">
                            <div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" title={`Download ${file.original_filename}`}>
                                <i className="fas fa-paperclip me-2"></i> {/* Optional: Add icon */}
                                {file.original_filename}
                              </a>
                              <br />
                              <small className="text-muted">
                                Uploaded by: {file.user?.username || 'Unknown'} on {new Date(file.created_at).toLocaleDateString()}
                                {' '}({(file.size / 1024).toFixed(1)} KB)
                              </small>
                            </div>
                            {/* Delete button visible to uploader or PM */}
                            {(user && (user.id === file.user_id || user.role === 'project_manager')) && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleViewFileDelete(file.id, file.original_filename)}
                                title="Delete file"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="text-muted small">No files attached to this task.</p>
                    )}
                    {/* Note: No upload form here, uploads happen via Edit Task modal */}
                </div>

                {/* Comments Tab Pane */}
                <div className="tab-pane fade" id="comments-content" role="tabpanel" aria-labelledby="comments-tab">
                  {/* Comments Content */}
                   <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                    {comments && comments.length > 0 ? (
                      comments.map((comment, index) => {
                        if (!comment) return null;
                        const commentUser = comment.user || { name: 'Unknown User' };
                        // Check if the current user is the author of the comment
                        const isCurrentUserCommentAuthor = comment.user_id === user?.id;
                        // Check if the current user is the project manager
                        const isCurrentUserProjectManager = user?.role === 'project_manager';

                        return (
                          <div key={comment.id || `comment-${index}`} className="mb-3 p-2 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong className="d-block">{commentUser.name}</strong>
                                <small className="text-muted">{comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Unknown date'}</small>
                              </div>
                              {/* Show delete button if user is comment author OR project manager */}
                              {(isCurrentUserCommentAuthor || isCurrentUserProjectManager) && (
                                <Button
                                  size="sm"
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  title="Delete Comment"
                                >
                                  <i className="fas fa-trash"></i> {/* Using Font Awesome trash icon */}
                                </Button>
                              )}
                            </div>
                            <div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{comment.comment || 'No comment content'}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-muted text-center py-3">No comments yet.</div>
                    )}
                  </div>
                  <Form.Group className="mt-3">
                    <Form.Control as="textarea" rows={3} placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="mb-2"/>
                    <div className="d-flex justify-content-end">
                      <Button variant="primary" size="sm" onClick={postComment} disabled={!newComment.trim()}>Post Comment</Button>
                    </div>
                  </Form.Group>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeTaskDetailsModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* View Project Modal */}
      <ProjectModal show={showProjectModal} handleClose={() => setShowProjectModal(false)} project={selectedProjectForView} readOnly />

    </Container>
  );
}

export default TasksPage;