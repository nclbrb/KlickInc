import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap'; // Added Spinner, Alert
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // Use the centralized api instance
import NavBar from './NavBar';
import NotificationBell from '../Notifications/NotificationBell';

function DashboardTeamMember({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);

  // --- NEW State for loading/error handling ---
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorTasks, setErrorTasks] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errorProjects, setErrorProjects] = useState('');
  // ---

  // Fetch assigned tasks
  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setErrorTasks('');
    try {
      const response = await api.get('/tasks'); // Use api instance
      // The backend /api/tasks for team_member should already return only assigned tasks
      // If not, the filter is still needed:
      // const myTasks = response.data.filter((task) => task.assigned_to === user.id);
      const myTasks = response.data; // Assuming backend filters correctly
      myTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setTasks(myTasks);
      // --- REMOVED project derivation logic ---
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setErrorTasks('Failed to load assigned tasks.');
      setTasks([]); // Clear tasks on error
    } finally {
      setLoadingTasks(false);
    }
  }, [user.id]); // Dependency on user.id if filtering frontend, empty if backend filters

  // --- NEW function to fetch assigned projects directly ---
  const fetchAssignedProjects = useCallback(async () => {
    setLoadingProjects(true);
    setErrorProjects('');
    try {
      const response = await api.get('/projects'); // Use api instance
      // Backend /api/projects should return filtered projects for team member
      const projectsArray = response.data || [];
      projectsArray.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setAssignedProjects(projectsArray);
    } catch (error) {
      console.error('Error fetching assigned projects:', error);
      setErrorProjects('Failed to load assigned projects.');
      setAssignedProjects([]); // Clear projects on error
    } finally {
      setLoadingProjects(false);
    }
  }, []); // No dependencies needed here as endpoint filters based on authenticated user

  // Fetch data on component mount
  useEffect(() => {
    fetchTasks();
    fetchAssignedProjects(); // Fetch projects directly
  }, [fetchTasks, fetchAssignedProjects]); // Include fetch functions in dependency array

  // --- Helper Functions ---
  const getTaskStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'in_progress') badgeClass = 'warning';
    else if (status === 'completed') badgeClass = 'success';
    return <span className={`badge bg-${badgeClass}`}>{status ? status.replace('_', ' ').toUpperCase() : 'N/A'}</span>;
  };

  const getTaskPriorityBadge = (priority) => {
    let badgeClass = 'bg-info text-dark';
    let icon = '';
    if (priority === 'high') { badgeClass = 'bg-danger'; icon = '🔴 '; }
    else if (priority === 'medium') { badgeClass = 'bg-warning text-dark'; icon = '🟡 '; }
    else if (priority === 'low') { badgeClass = 'bg-info text-dark'; icon = '🔵 '; }
    return <span className={`badge ${badgeClass}`}>{icon}{priority ? priority.toUpperCase() : 'N/A'}</span>;
  };

  const formatBudget = (budget) => {
    if (budget === null || budget === undefined || budget === '') return 'N/A';
    const parsedBudget = parseFloat(budget);
    if (isNaN(parsedBudget)) return 'Invalid';
    return `₱${parsedBudget.toFixed(2)}`;
  };

  // --- NEW Helper for Project Status Badge ---
  const getProjectStatusBadge = (status) => {
    // Assuming similar statuses to tasks, adjust if project statuses differ
    let badgeClass = 'secondary'; // Default or 'To Do'
    if (!status) return <span className={`badge bg-${badgeClass}`}>N/A</span>;

    const lowerStatus = status.toLowerCase().replace(/\s+/g, '_'); // Normalize status

    if (lowerStatus === 'in_progress') badgeClass = 'warning';
    else if (lowerStatus === 'completed' || lowerStatus === 'done') badgeClass = 'success';
    else if (lowerStatus === 'cancelled') badgeClass = 'danger';
    // Add more conditions if needed

    // Capitalize first letter of each word for display
    const displayStatus = status.split(/[\s_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return <span className={`badge bg-${badgeClass}`}>{displayStatus}</span>;
  };
  // ---

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <div style={{ position: 'absolute', top: 24, right: 40, zIndex: 1050 }}>
        <NotificationBell />
      </div>

      <Row className='gx-0'> {/* Use gx-0 to remove horizontal gutters if NavBar has own padding */}
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Welcome, {user.username}!</h2>
          <h3 className="mt-4 mb-4">Dashboard</h3>

          {/* Display errors if any */}
          {errorProjects && <Alert variant="danger">{errorProjects}</Alert>}
          {errorTasks && <Alert variant="danger">{errorTasks}</Alert>}

          <Row className="mb-5">
            {/* Project Section */}
            <Col md={6} className="d-flex mb-4">
              <Card className="shadow-sm flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Assigned Projects</h5>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column"> {/* Use flex column */}
                  {loadingProjects ? (
                    <div className="text-center flex-grow-1 d-flex align-items-center justify-content-center"><Spinner animation="border" /></div>
                  ) : assignedProjects.length === 0 && !errorProjects ? (
                     <div className="text-center text-muted flex-grow-1 d-flex align-items-center justify-content-center">No projects assigned.</div>
                  ) : (
                    <div className="scrollable-list flex-grow-1" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                      <Table hover className="table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Budget</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedProjects.map((project) => (
                            <tr key={project.id}>
                              <td>{project.project_name}</td>
                              <td>{project.project_code}</td>
                              <td>{formatBudget(project.budget)}</td>
                              <td>
                                {/* Use the new helper function */}
                                {getProjectStatusBadge(project.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                  <div className="mt-2 text-end">
                    <Button variant="link" onClick={() => navigate('/projects')}>
                      View All Projects
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Task Section */}
            <Col md={6} className="d-flex mb-4">
              <Card className="shadow-sm flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">My Assigned Tasks</h5>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column"> {/* Use flex column */}
                   {loadingTasks ? (
                    <div className="text-center flex-grow-1 d-flex align-items-center justify-content-center"><Spinner animation="border" /></div>
                  ) : tasks.length === 0 && !errorTasks ? (
                     <div className="text-center text-muted flex-grow-1 d-flex align-items-center justify-content-center">No tasks assigned.</div>
                  ) : (
                    <div className="scrollable-list flex-grow-1" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                      <Table hover className="table-striped">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Deadline</th>
                            <th>Budget</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task) => (
                            <tr key={task.id}>
                              <td>{task.title}</td>
                              <td>{getTaskStatusBadge(task.status)}</td>
                              <td>{getTaskPriorityBadge(task.priority)}</td>
                              <td>
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                              </td>
                              <td>{formatBudget(task.budget)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                  <div className="mt-2 text-end">
                    <Button variant="link" onClick={() => navigate('/tasks')}>
                      View All Tasks
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardTeamMember;