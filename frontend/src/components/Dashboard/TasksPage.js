import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, ButtonGroup, Table, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from './TaskModal';

function TasksPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    if (user.role === 'project_manager') {
      fetchProjects();
    }
  }, [user.role]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to view these tasks');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (user.role === 'project_manager') {
        const teamMembers = response.data.filter(user => user.role === 'team_member');
        setUsers(teamMembers);
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const sidebarStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
  };

  // Function to format deadline
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString(); // Formats as 'MM/DD/YYYY'
  };

  // Handle status update
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(`http://127.0.0.1:8000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }}
      );
      fetchTasks();  // Refresh task list after update
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row noGutters="true">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2} className="bg-dark text-white d-flex flex-column" style={sidebarStyle}>
          <div>
            <h3 className="mb-4 text-center">My App</h3>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/dashboard" className="text-white mb-2 d-flex align-items-center">
                <i className="material-icons me-2">dashboard</i> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/projects" className="text-white mb-2 d-flex align-items-center">
                <i className="material-icons me-2">folder</i> Projects
              </Nav.Link>
              <Nav.Link as={Link} to="/tasks" className="text-white mb-2 d-flex align-items-center">
                <i className="material-icons me-2">assignment</i> Tasks
              </Nav.Link>
            </Nav>
          </div>
          <div>
            <Button variant="outline-light" onClick={handleLogout} className="d-flex align-items-center">
              <i className="material-icons me-2">logout</i> Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          {user.role === 'project_manager' && (
           <Card className="mb-4 shadow-sm">
           <Card.Header className="bg-primary text-white">
             <h5 className="mb-0">Create New Task</h5>
           </Card.Header>
           <Card.Body>
             <p>Welcome, Project Manager {user.username}! Do you want to create a new task?</p>
             <Button variant="primary" onClick={handleCreateTask}>
               Create New Task
             </Button>
           </Card.Body>
         </Card>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Tasks</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Deadline</th> {/* New column for Deadline */}
                      {user.role !== 'team_member' && <th>Actions</th>}
                      {user.role === 'team_member' && <th>Update Status</th>} {/* Add new column for Update Status */}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && (
                            <div className="text-muted small">{task.description}</div>
                          )}
                        </td>
                        <td>{task.project?.project_name} ({task.project?.project_code})</td>
                        <td>
                          <span className={`badge bg-${task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            task.priority === 'high' 
                              ? 'bg-danger' 
                              : task.priority === 'medium'
                              ? 'bg-warning text-dark'
                              : 'bg-info text-dark'
                          }`}>
                            {task.priority === 'high' && '🔴 '}
                            {task.priority === 'medium' && '🟡 '}
                            {task.priority === 'low' && '🔵 '}
                            {task.priority.toUpperCase()}
                          </span>
                        </td>
                        <td>{task.user ? `${task.user.username}` : 'Unassigned'}</td>
                        <td>{formatDeadline(task.deadline)}</td> {/* Display the formatted deadline */}
                        {user.role === 'team_member' && task.user?.id === user.id && (
                          <td>
                            {/* Update Status Dropdown for Team Member */}
                            <DropdownButton
                              variant="outline-secondary"
                              title="Update Status"
                              onSelect={(status) => handleStatusChange(task.id, status)}
                            >
                              <Dropdown.Item eventKey="not_started">Not Started</Dropdown.Item>
                              <Dropdown.Item eventKey="in_progress">In Progress</Dropdown.Item>
                              <Dropdown.Item eventKey="completed">Completed</Dropdown.Item>
                            </DropdownButton>
                          </td>
                        )}
                        {user.role === 'project_manager' && (
                          <td>
                            <ButtonGroup size="sm">
                              <Button
                                variant="outline-warning"
                                onClick={() => handleEditTask(task)}
                              >
                                Update
                              </Button>
                              <Button
                                variant="outline-danger"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete
                              </Button>
                            </ButtonGroup>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {tasks.length === 0 && (
                  <div className="text-center text-muted p-4">
                    No tasks found
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Task Modal */}
      <TaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        task={selectedTask}
        refreshTasks={fetchTasks}
        projects={projects}
        users={users}
      />
    </Container>
  );
}

export default TasksPage;
