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

  // New comment-related state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);

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
      if (status === 'pending') {
        updatedTask.start_time = null;
        updatedTask.end_time = null;
      }
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
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
  try {
    const token = localStorage.getItem('access_token');
    await axios.delete(`http://127.0.0.1:8000/api/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Refresh comments after deletion
    fetchComments(selectedTaskForComments.id);
  } catch (error) {
    console.error('Error deleting comment:', error);
    alert('Failed to delete comment');
  }
};


  const handleCompleteTask = async (task) => {
    try {
      const token = localStorage.getItem('access_token');
      const updatedTask = {
        ...task,
        status: 'completed',
        end_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTaskForView(task);
    setShowTaskDetailsModal(true);
  };

  const closeTaskDetailsModal = () => {
    setShowTaskDetailsModal(false);
    setSelectedTaskForView(null);
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
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`http://127.0.0.1:8000/api/tasks/${selectedTaskForComments.id}/comments`, {
        comment: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      fetchComments(selectedTaskForComments.id);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const openCommentsModal = (task) => {
    setSelectedTaskForComments(task);
    fetchComments(task.id);
    setShowCommentsModal(true);
  };

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedTaskForComments(null);
    setComments([]);
    setNewComment('');
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
                        <td>{task.project?.project_name} ({task.project?.project_code})</td>
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
                            <Button size="sm" variant="outline-info" onClick={() => handleViewTaskDetails(task)}>View</Button>
                            <Button size="sm" variant="outline-warning" onClick={() => openAmountModal(task)}>Update Amount</Button>
                            <Button size="sm" variant="outline-dark" onClick={() => openCommentsModal(task)}>Comments</Button>
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

      <Modal show={showTaskDetailsModal} onHide={closeTaskDetailsModal}>
        <Modal.Header closeButton><Modal.Title>Task Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedTaskForView && (
            <>
              <h5>{selectedTaskForView.title}</h5>
              <p>{selectedTaskForView.description}</p>
              <p><strong>Project:</strong> {selectedTaskForView.project?.project_name}</p>
              <p><strong>Assigned To:</strong> {selectedTaskForView.assigned_to?.name}</p>
              <p><strong>Time Spent:</strong> {selectedTaskForView.time_spent ? `${selectedTaskForView.time_spent} secs` : 'No time recorded'}</p>
              <p><strong>Start Time:</strong> {selectedTaskForView.start_time ? new Date(selectedTaskForView.start_time).toLocaleString() : 'Not started'}</p>
              <p><strong>End Time:</strong> {selectedTaskForView.end_time ? new Date(selectedTaskForView.end_time).toLocaleString() : 'Not ended'}</p>
              <p><strong>Status:</strong> {getTaskStatusBadge(selectedTaskForView.status)}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeTaskDetailsModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      <ProjectModal show={showProjectModal} handleClose={() => setShowProjectModal(false)} project={selectedProjectForView} readOnly />

      {/* Comment Modal */}
      <Modal show={showCommentsModal} onHide={closeCommentsModal}>
        <Modal.Header closeButton><Modal.Title>Comments for: {selectedTaskForComments?.title}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {comments.length ? comments.map((c, idx) => (
              <div key={idx} className="mb-2 p-2 bg-light rounded">
                <strong>{c.user?.name || 'User'}:</strong> {c.comment}
                <div className="text-muted small">{new Date(c.created_at).toLocaleString()}</div>
                {c.user?.id === user.id && (
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteComment(c.id)}>Delete</Button>
                  )}
                  </div>
                )) : <div className="text-muted">No comments yet.</div>}

          </div>
          <Form.Group className="mt-3">
            <Form.Label>Add a Comment</Form.Label>
            <Form.Control as="textarea" rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCommentsModal}>Close</Button>
          <Button variant="primary" onClick={postComment}>Post</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TasksPage;
