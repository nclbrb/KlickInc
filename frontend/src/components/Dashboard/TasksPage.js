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

  // Modal state for recording amount used
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amountUsed, setAmountUsed] = useState('');
  const [selectedTaskForAmount, setSelectedTaskForAmount] = useState(null);

  // For viewing project details in read-only mode
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/tasks', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 403) alert('You do not have permission to view these tasks');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

  // Team member: change status via dropdown
  const handleStatusChange = async (task, status) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `http://127.0.0.1:8000/api/tasks/${task.id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  // Open modal to record amount used
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
      await axios.put(
        `http://127.0.0.1:8000/api/tasks/${selectedTaskForAmount.id}`,
        {
          title: selectedTaskForAmount.title,
          description: selectedTaskForAmount.description,
          project_id: selectedTaskForAmount.project_id,
          assigned_to: selectedTaskForAmount.assigned_to,
          priority: selectedTaskForAmount.priority,
          deadline: selectedTaskForAmount.deadline,
          budget: selectedTaskForAmount.budget,
          status: selectedTaskForAmount.status,
          amount_used: used, // only this field is changing
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      closeAmountModal();
      fetchTasks();
    } catch (error) {
      console.error('Error updating amount used:', error);
      alert(error.response?.data?.message || 'Failed to update amount.');
    }
  };
  
  // View project details in read-only mode
  const handleViewProject = (project) => {
    setSelectedProjectForView(project);
    setShowProjectModal(true);
  };

  const formatDeadline = (deadline) => deadline ? new Date(deadline).toLocaleDateString() : 'No deadline';

  const getTaskPriorityBadge = (priority) => {
    let cls = 'bg-info text-dark';
    let icon = '🔵 ';
    if (priority === 'high') { cls = 'bg-danger'; icon = '🔴 '; }
    else if (priority === 'medium') { cls = 'bg-warning text-dark'; icon = '🟡 '; }
    return <span className={`badge ${cls}`}>{icon}{priority.toUpperCase()}</span>;
  };

  const getTaskStatusBadge = (status) => {
    const map = { completed: 'success', in_progress: 'warning', pending: 'secondary' };
    return <span className={`badge bg-${map[status]||'secondary'}`}>{status.replace('_',' ').toUpperCase()}</span>;
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor:'#f8f9fa', minHeight:'100vh' }}>
          <h2>Tasks</h2>
          {user.role !== 'team_member' && (
            <div className="mb-3 text-end">
              <Button className="btn-purp" onClick={handleCreateTask}>+ New Task</Button>
            </div>
          )}
          <Card className="shadow-sm">
            <Card.Header className="bg-purp text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-white">My Tasks</h5>
            </Card.Header>
            <Card.Body>
              <div className="scrollable-list" style={{ maxHeight:'60vh', overflowY:'auto' }}>
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
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && <div className="text-muted small">{task.description.slice(0,50)}{task.description.length>50?'...':''}</div>}
                        </td>
                        <td>{task.project?.project_name} ({task.project?.project_code})</td>
                        <td>
                          {user.role === 'team_member' ? (
                            <Form.Select 
                              size="sm" 
                              value={task.status} 
                              onChange={e => handleStatusChange(task, e.target.value)} 
                              style={{ width: '150px' }} //Change width here
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </Form.Select>
                          ) : getTaskStatusBadge(task.status)}
                        </td>
                        <td>{getTaskPriorityBadge(task.priority)}</td>
                        <td>{formatDeadline(task.deadline)}</td>
                        <td>{task.budget != null ? `₱${parseFloat(task.budget).toFixed(2)}` : 'N/A'}</td>
                        <td>{task.amount_used != null ? `₱${parseFloat(task.amount_used).toFixed(2)}` : 'Not Set'}</td> {/* Total column */}
                        <td>
                          {user.role === 'team_member' ? (
                            <Button size="sm" variant="outline-primary" onClick={() => openAmountModal(task)}>Update Amount</Button>
                          ) : (
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-primary" onClick={() => handleViewProject(task.project)}>View</Button>
                              <Button size="sm" variant="outline-secondary" onClick={() => handleEditTask(task)}>Edit</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDeleteTask(task.id)}>Delete</Button>
                            </div>
                          )}
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

      {/* Team Member Amount Modal */}
      <Modal show={showAmountModal} onHide={closeAmountModal} centered>
        <Modal.Header closeButton><Modal.Title>Record Amount Used</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Amount Used (₱)</Form.Label>
            <Form.Control
              type="number"
              value={amountUsed}
              onChange={e=>setAmountUsed(e.target.value)}
              min="0"
              max={selectedTaskForAmount?.budget||0}
            />
            <small className="text-muted">Max: ₱{selectedTaskForAmount && selectedTaskForAmount.budget !== null
              ? `${parseFloat(selectedTaskForAmount.budget).toFixed(2)}`
              : 'N/A'}
            </small>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAmountModal}>Cancel</Button>
          <Button variant="purp" onClick={handleAmountSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Task Modal for project managers */}
      {user.role!=='team_member' && (
        <TaskModal
          show={showTaskModal}
          handleClose={()=>setShowTaskModal(false)}
          task={selectedTask}
          refreshTasks={fetchTasks}
          projects={projects}
          users={users}
        />
      )}

      {/* Project Modal for viewing project details */}
      <ProjectModal
        show={showProjectModal}
        handleClose={()=>setShowProjectModal(false)}
        project={selectedProjectForView}
        readOnly
      />
    </Container>
  );
}

export default TasksPage;
