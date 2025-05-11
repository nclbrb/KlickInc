import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function DashboardTeamMember({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);  
  const [showModal, setShowModal] = useState(false); 

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    api
      .get('/tasks')
      .then((response) => {
        const myTasks = response.data.filter((task) => task.assigned_to === user.id);
        myTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setTasks(myTasks);

        // Extract unique projects from these tasks
        const projectsMap = {};
        myTasks.forEach((task) => {
          if (task.project) {
            if (!projectsMap[task.project.id]) {
              projectsMap[task.project.id] = task.project;
            } else if (
              new Date(task.project.updated_at) >
              new Date(projectsMap[task.project.id].updated_at)
            ) {
              projectsMap[task.project.id] = task.project;
            }
          }
        });
        const projectsArray = Object.values(projectsMap);
        projectsArray.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setAssignedProjects(projectsArray);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  };

  // Helper to display task status as a badge
  const getTaskStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'in_progress') {
      badgeClass = 'warning';
    } else if (status === 'completed') {
      badgeClass = 'success';
    }
    return (
      <span className={`badge bg-${badgeClass}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Helper to display task priority as a badge
  const getTaskPriorityBadge = (priority) => {
    let badgeClass = 'bg-info text-dark';
    let icon = '';
    if (priority === 'high') {
      badgeClass = 'bg-danger';
      icon = '🔴 ';
    } else if (priority === 'medium') {
      badgeClass = 'bg-warning text-dark';
      icon = '🟡 ';
    } else if (priority === 'low') {
      badgeClass = 'bg-info text-dark';
      icon = '🔵 ';
    }
    return (
      <span className={`badge ${badgeClass}`}>
        {icon}
        {priority.toUpperCase()}
      </span>
    );
  };

  // Helper to format the budget
  const formatBudget = (budget) => {
    if (budget === null || budget === undefined || budget === '') {
      return 'N/A';
    }
    
    const parsedBudget = parseFloat(budget);
    if (isNaN(parsedBudget)) {
      return 'Invalid Budget';  
    }

    return `₱${parsedBudget.toFixed(2)}`;
  };

  // Open the notifications modal
  const handleShowNotifications = () => {
    const newNotifications = [
      'Task 1 has been assigned to you.',
      'Task 2 has been completed.',
      'New project has been assigned.',
    ];
    setNotifications(newNotifications);
    setShowModal(true);
  };

  // Close the notifications modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="main-content">
      <div className="container-fluid">
        <h2>Welcome, {user.username}!</h2>
        <h3 style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>Dashboard</h3>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-purp">
                <h5 className="mb-0 text-white">Assigned Projects</h5>
              </Card.Header>
              <Card.Body>
                <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  <Table hover>
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
                            <span className="badge bg-secondary">{project.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-2 text-end">
                  <Button variant="link" onClick={() => navigate('/projects')}>
                    View All Projects
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-purp">
                <h5 className="mb-0 text-white">Assigned Tasks</h5>
              </Card.Header>
              <Card.Body>
                <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  <Table hover>
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
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td>{formatBudget(task.budget)}</td> 
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-2 text-end">
                  <Button variant="link" onClick={() => navigate('/tasks')}>
                    View All Tasks
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Notifications Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))
            ) : (
              <li>No new notifications</li>
            )}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DashboardTeamMember;
