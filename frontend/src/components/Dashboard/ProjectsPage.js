import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form } from 'react-bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectModal from './ProjectModal';
import ProjectTotalModal from './ProjectTotalModal';
import GanttChartModal from './GanttChartModal';
import NavBar from './NavBar';
import ReportIssueModal from './ReportIssueModal';


function ProjectsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // State for Report Issue modal
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [selectedProjectForIssueReport, setSelectedProjectForIssueReport] = useState(null);

  // New state for totals modal
  const [showTotalsModal, setShowTotalsModal] = useState(false);
  const [selectedProjectForTotals, setSelectedProjectForTotals] = useState(null);
  const [showGanttChart, setShowGanttChart] = useState(false);
  const [showViewProjectModal, setShowViewProjectModal] = useState(false);
  const [projectToView, setProjectToView] = useState(null);
  
  // Add new state for issues
  const [projectIssues, setProjectIssues] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    fetchProjects();
    if (user.role === 'team_member') {
      fetchMyTasks();
    }
  }, [user.role]);

  const fetchProjects = () => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log('API Projects Data:', response.data);
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  };

  const fetchMyTasks = () => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log('API Tasks Data:', response.data);
        // Make sure we're getting tasks assigned to this user
        // Note: the assigned_to field might be an object with an id property
        const myTasks = response.data.filter(task => {
          // Handle both formats: assigned_to as ID or as object
          if (typeof task.assigned_to === 'object') {
            return task.assigned_to?.id === user.id;
          } else {
            return task.assigned_to === user.id;
          }
        });
        console.log('Filtered Tasks:', myTasks);
        setTasks(myTasks);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const token = localStorage.getItem('access_token');
    axios
      .delete(`http://127.0.0.1:8000/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        fetchProjects();
      })
      .catch((error) => {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      });
  };

  const handleViewTasks = (project) => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const tasksForProject = response.data.filter(
          (task) => task.project_id === project.id
        );
        setProjectTasks(tasksForProject);
        setSelectedProjectForTasks(project);
        setShowTasksModal(true);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  };

  const handleViewGanttChart = (project) => {
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      const tasksForProject = response.data.filter(
        (task) => task.project_id === project.id
      );
      setProjectTasks(tasksForProject);
      setSelectedProject(project);
      setShowGanttChart(true);
    })
    .catch((error) => {
      console.error('Error fetching tasks:', error);
    });
  };

  const handleViewProject = (project) => {
    setProjectToView(project);
    setShowViewProjectModal(true);
    fetchProjectIssues(project.id);
  };
  


  const getProjectStatusBadge = (status) => {
    if (!status) return <span className="badge bg-secondary">N/A</span>;
    
    const statusText = String(status).trim();
    let badgeClass = 'secondary';
    
    // Handle different possible status formats
    if (statusText.match(/in[-\s]?progress|in_progress|inprogress/i)) {
      badgeClass = 'warning';
    } else if (statusText.match(/done|completed|finished/i)) {
      badgeClass = 'success';
    } else if (statusText.match(/pending|not started|not_started/i)) {
      badgeClass = 'info';
    } else if (statusText.match(/cancelled|canceled|stopped/i)) {
      badgeClass = 'danger';
    }
    
    // Format the status text for display
    const displayStatus = statusText
      .toLowerCase()
      .split(/[\s_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return <span className={`badge bg-${badgeClass}`}>{displayStatus}</span>;
  };

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

  // For debugging - log the raw data
  useEffect(() => {
    if (user.role === 'team_member' && projects.length > 0 && tasks.length > 0) {
      console.log('Debug - Projects for team member:', projects);
      console.log('Debug - Tasks for team member:', tasks);
      
      // Check the first task's structure
      if (tasks.length > 0) {
        console.log('Debug - First task structure:', tasks[0]);
        console.log('Debug - First task project:', tasks[0].project);
        
        // If we have tasks but no projects with data, try to create projects from tasks
        const hasValidProjects = projects.some(p => p.budget || p.status);
        if (!hasValidProjects && tasks.some(t => t.project)) {
          console.log('Creating projects from task data...');
          const projectsFromTasks = [];
          
          // Group tasks by project_id
          const tasksByProject = {};
          tasks.forEach(task => {
            if (task.project_id) {
              if (!tasksByProject[task.project_id]) {
                tasksByProject[task.project_id] = [];
              }
              tasksByProject[task.project_id].push(task);
            }
          });
          
          // Create project objects from the first task in each group
          Object.keys(tasksByProject).forEach(projectId => {
            const firstTask = tasksByProject[projectId][0];
            const projectData = firstTask.project || {};
            
            projectsFromTasks.push({
              id: parseInt(projectId),
              project_name: projectData.project_name || projectData.title || 'Project ' + projectId,
              project_code: projectData.project_code || '',
              description: projectData.description || '',
              budget: projectData.budget || '',
              status: projectData.status || '',
              start_date: projectData.start_date || '',
              end_date: projectData.end_date || ''
            });
          });
          
          if (projectsFromTasks.length > 0) {
            console.log('Created projects from tasks:', projectsFromTasks);
            setProjects(prev => [...prev, ...projectsFromTasks]);
          }
        }
      }
    }
  }, [projects, tasks, user.role]);

  const filteredProjects =
    user.role === 'team_member'
      ? projects
          .filter((project) => {
            // Only include projects that have at least one task assigned to the current user
            const userTasks = tasks.filter(task => task.project_id === project.id);
            return userTasks.length > 0;
          })
          .map(project => {
            // Find the first task for this project
            const projectTasks = tasks.filter(task => task.project_id === project.id);
            const firstTask = projectTasks[0];
            
            // Debug this specific project and its tasks
            console.log(`Debug - Processing project ${project.id}:`, {
              project,
              firstTask,
              projectTasks: projectTasks.length
            });
            
            // Defensive fallback for deeply nested or missing data
            const fallbackProject = firstTask?.project || {};
            
            // Create a more robust result object with all possible data sources
            const result = {
              ...project,
              project_name: project.project_name || fallbackProject.project_name || '',
              project_code: project.project_code || fallbackProject.project_code || '',
              description: project.description || fallbackProject.description || '',
              // For budget, try all possible locations and property names
              budget:
                project.budget ??
                project.project_budget ??
                fallbackProject.budget ??
                fallbackProject.project_budget ??
                firstTask?.budget ??
                firstTask?.project_budget ??
                (firstTask?.project && typeof firstTask.project === 'object' ? firstTask.project.budget : null) ??
                '',
              // For status, try all possible locations and property names
              status:
                project.status ??
                project.project_status ??
                fallbackProject.status ??
                fallbackProject.project_status ??
                firstTask?.status ??
                firstTask?.project_status ??
                (firstTask?.project && typeof firstTask.project === 'object' ? firstTask.project.status : null) ??
                '',
              start_date: project.start_date || fallbackProject.start_date || '',
              end_date: project.end_date || fallbackProject.end_date || '',
            };
            
            console.log(`Debug - Result for project ${project.id}:`, {
              budget: result.budget,
              status: result.status
            });
            
            return result;
          })
      : projects;

  const formatBudget = (budget) => {
    // Handle all possible budget formats
    if (budget === null || budget === undefined || budget === '') {
      return 'N/A';
    }
    
    // Handle budget as string or number
    let parsedBudget;
    if (typeof budget === 'string') {
      // Remove any non-numeric characters except decimal point
      const cleanedBudget = budget.replace(/[^0-9.]/g, '');
      parsedBudget = parseFloat(cleanedBudget);
    } else if (typeof budget === 'number') {
      parsedBudget = budget;
    } else {
      return 'N/A';
    }
    
    return !isNaN(parsedBudget) ? `₱${parsedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
  };

  // Handle viewing project totals
  const handleViewTotals = (project) => {
    setSelectedProjectForTotals(project);
    setShowTotalsModal(true);
  };

  // Handle reporting issue
  const handleReportIssue = (project) => {
    setSelectedProjectForIssueReport(project);
    setShowReportIssueModal(true);
  };

  // Add new helper function for issue type badge
  const getIssueTypeBadge = (type) => {
    const issueType = type || 'task';
    return <span className={`badge bg-${issueType.toLowerCase() === 'task' ? 'info' : 'warning'}`}>{issueType}</span>;
  };

  // Update fetchProjectIssues to get both project and task issues with task details
  const fetchProjectIssues = async (projectId) => {
    setIsLoadingIssues(true);
    try {
      const token = localStorage.getItem('access_token');
      // First get all tasks for this project to have their amounts
      const tasksResponse = await axios.get(`http://127.0.0.1:8000/api/tasks?project_id=${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      // Create a map of task details by ID for quick lookup
      const taskMap = tasksResponse.data.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {});

      // Now get the issues
      const response = await axios.get(`http://127.0.0.1:8000/api/issues?project_id=${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Map the issues and include full task data
      const issuesWithTasks = response.data.map(issue => {
        if (issue.task_id && taskMap[issue.task_id]) {
          return { ...issue, task: taskMap[issue.task_id] };
        }
        return issue;
      });

      setProjectIssues(issuesWithTasks);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  // Update handleReportIssueSubmit to show project details after submission
  const handleReportIssueSubmit = () => {
    setShowReportIssueModal(false);
    if (projectToView) {
      fetchProjectIssues(projectToView.id);
    }
  };

  const handleAmountUpdate = async (issueId, amount) => {
    try {
      const token = localStorage.getItem('access_token');
      const issue = projectIssues.find(i => i.id === issueId);
      
      if (!issue) return;

      if (issue.type === 'task' && issue.task_id) {
        // Update task's budget
        await axios.put(
          `http://127.0.0.1:8000/api/tasks/${issue.task_id}`,
          { budget: amount ? parseFloat(amount) : null },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Fetch updated task data
        const taskResponse = await axios.get(`http://127.0.0.1:8000/api/tasks/${issue.task_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        // Update the local state with full task data
        setProjectIssues(prevIssues =>
          prevIssues.map(i => 
            i.id === issueId
              ? { ...i, task: taskResponse.data }
              : i
          )
        );
      } else {
        // Update issue amount
        await axios.put(
          `http://127.0.0.1:8000/api/issues/${issueId}`,
          { amount: amount ? parseFloat(amount) : null },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Update the local state
        setProjectIssues(prevIssues =>
          prevIssues.map(i =>
            i.id === issueId
              ? { ...i, amount: amount ? parseFloat(amount) : null }
              : i
          )
        );
      }
    } catch (error) {
      console.error('Error updating amount:', error);
      alert('Error updating amount. Please try again.');
    }
  };

  const handleViewActivities = (issue) => {
    setSelectedIssue(issue);
    setShowActivitiesModal(true);
  };

  // Helper function to get issue status badge
  const getIssueStatusBadge = (status) => {
    let variant = 'secondary';
    switch (status) {
      case 'open':
        variant = 'danger';
        break;
      case 'in_progress':
        variant = 'warning';
        break;
      case 'resolved':
        variant = 'success';
        break;
      case 'closed':
        variant = 'secondary';
        break;
      default:
        variant = 'secondary';
    }
    return <span className={`badge bg-${variant}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar using NavBar */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>

        {/* Main Content */}
        <Col
          xs={12}
          md={9}
          lg={10}
          className="p-4"
          style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
        >
          <h2 style={{ marginBottom: user.role === 'team_member' ? '5rem' : '1rem' }}>
            Projects
          </h2>
          {user.role === 'project_manager' && (
            <div className="mb-3 text-end">
              <Button className="btn-purp" onClick={handleCreateProject}>
                + New Project
              </Button>
            </div>
          )}
          <Card className="shadow-sm">
            <Card.Header className="bg-purp text-white">
              <h5 className="mb-0 text-white">My Projects</h5>
            </Card.Header>
            <Card.Body>
              {filteredProjects.length > 0 ? (
                <div
                  className="scrollable-list"
                  style={{ maxHeight: '60vh', overflowY: 'auto' }}
                >
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Project Code</th>
                        <th>Description</th>
                        <th>Budget</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th style={{ width: '250px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project.id}>
                          <td>{project.project_name}</td>
                          <td>{project.project_code}</td>
                          <td>
                            {project.description?.substring(0, 50)}
                            {project.description && project.description.length > 50
                              ? '...'
                              : ''}
                          </td>
                          <td>
                            {formatBudget(project.budget)}
                          </td>
                          <td>
                            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} -{' '}
                            {project.end_date
                              ? new Date(project.end_date).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td>
                            {getProjectStatusBadge(project.status)}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1 justify-content-start">
                              {/* Action buttons in a more compact layout */}
                              <div className="btn-group">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleViewProject(project)}
                                  className="me-1"
                                >
                                  <i className="bi bi-eye"></i> View
                                </Button>
                                
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleViewTasks(project)}
                                  className="me-1"
                                >
                                  <i className="bi bi-list-task"></i> Tasks
                                </Button>
                                
                                {user.role === 'project_manager' && (
                                  <>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => handleViewGanttChart(project)}
                                      className="me-1"
                                    >
                                      <i className="bi bi-bar-chart"></i> Chart
                                    </Button>
                                    
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      onClick={() => handleViewTotals(project)}
                                      className="me-1"
                                    >
                                      <i className="bi bi-cash"></i> Totals
                                    </Button>
                                    
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleReportIssue(project)}
                                      className="me-1"
                                    >
                                      <i className="bi bi-exclamation-triangle"></i> Issue
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p>No projects found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showTasksModal}
        onHide={() => setShowTasksModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tasks for {selectedProjectForTasks?.project_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {projectTasks.length > 0 ? (
            <Table striped bordered hover>
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
                {projectTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{getTaskStatusBadge(task.status)}</td>
                    <td>{getTaskPriorityBadge(task.priority)}</td>
                    <td>
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>{task.budget != null ? `₱${parseFloat(task.budget).toFixed(2)}` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No tasks found for this project.</p>
          )}
        </Modal.Body>
      </Modal>

      <GanttChartModal
        show={showGanttChart}
        handleClose={() => setShowGanttChart(false)}
        tasks={projectTasks}
        projectName={selectedProject?.project_name || ''}
      />

      <ProjectTotalModal
        show={showTotalsModal}
        handleClose={() => setShowTotalsModal(false)}
        projectId={selectedProjectForTotals?.id}
      />

      <ProjectModal
        show={showProjectModal}
        handleClose={() => setShowProjectModal(false)}
        project={selectedProject}
        refreshProjects={fetchProjects}
      />

      {/* Update View Project Modal */}
      <Modal show={showViewProjectModal} onHide={() => setShowViewProjectModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {projectToView && (
            <div>
              <h4>{projectToView.project_name}</h4>
              <p><strong>Project Code:</strong> {projectToView.project_code}</p>
              <p><strong>Description:</strong> {projectToView.description || 'N/A'}</p>
              <p><strong>Status:</strong> {getProjectStatusBadge(projectToView.status)}</p>
              <p><strong>Budget:</strong> {formatBudget(projectToView.budget)}</p>
              <p><strong>Start Date:</strong> {new Date(projectToView.start_date).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {projectToView.end_date ? new Date(projectToView.end_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Actual Expenditure: {projectIssues
                        .filter(issue => issue.type === 'task' && issue.task?.budget)
                        .reduce((total, issue) => total + parseFloat(issue.task.budget || 0), 0)
                        .toFixed(2)}</strong></p>
              

              {/* Issues Section */}
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Project Issues</h5>
                </div>
                {isLoadingIssues ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : projectIssues.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Reported By</th>
                          <th>Date</th>
                          {user.role === 'team_manager' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {projectIssues.map(issue => (
                          <tr key={issue.id}>
                            <td>{issue.title}</td>
                            <td>
                              <span
                                title={issue.description}
                                style={{ 
                                  cursor: 'pointer',
                                  display: 'block',
                                  maxWidth: '300px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {issue.description}
                              </span>
                            </td>
                            <td>{getIssueTypeBadge(issue.type)}</td>
                            <td>
                              {user.role === 'team_manager' ? (
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={issue.type === 'task' ? 
                                    (issue.task?.budget || '') : 
                                    (issue.amount || '')}
                                  onChange={(e) => handleAmountUpdate(issue.id, e.target.value)}
                                  size="sm"
                                  style={{ width: '100px' }}
                                />
                              ) : (
                                issue.type === 'task' ? 
                                  issue.task?.budget ? 
                                    `$${parseFloat(issue.task.budget).toFixed(2)}` : 
                                    'N/A' :
                                  issue.amount ? 
                                    `$${parseFloat(issue.amount).toFixed(2)}` : 
                                    'N/A'
                              )}
                            </td>
                            <td>
                              {issue.type === 'task' && issue.task ? 
                                getTaskStatusBadge(issue.task.status) : 
                                getIssueStatusBadge(issue.status)
                              }
                            </td>
                            <td>{issue.reporter?.username || issue.reporter?.name || 'Unknown'}</td>
                            <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                            {user.role === 'team_manager' && (
                              <td>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => handleViewActivities(issue)}
                                >
                                  View History
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted">No issues reported for this project.</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewProjectModal(false)}>
            Close
          </Button>
          {user.role === 'project_manager' && (
            <>
              <Button 
                variant="primary" 
                onClick={() => {
                  setSelectedProject(projectToView);
                  setShowProjectModal(true);
                  setShowViewProjectModal(false);
                }}
              >
                Edit Project
              </Button>
              <Button 
                variant="danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project?')) {
                    handleDeleteProject(projectToView.id);
                    setShowViewProjectModal(false);
                  }
                }}
              >
                Delete Project
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <ReportIssueModal
        show={showReportIssueModal}
        onHide={() => setShowReportIssueModal(false)}
        project={selectedProjectForIssueReport}
        onReportSubmit={handleReportIssueSubmit}
      />

      {/* Activities Modal */}
      <Modal
        show={showActivitiesModal}
        onHide={() => setShowActivitiesModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Activity Feed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIssue?.activities?.length > 0 ? (
            <div className="activity-feed">
              {selectedIssue.activities
                .filter(activity => activity.type === 'amount_updated')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((activity, index) => (
                  <div key={index} className="activity-item mb-3 p-2 border-bottom">
                    <div className="d-flex align-items-center mb-1">
                      <div className="activity-icon me-2">
                        <i className="fas fa-dollar-sign text-success"></i>
                      </div>
                      <div>
                        <strong>{activity.user?.name || 'Unknown User'}</strong>
                        <span className="ms-2 badge bg-info">Amount Updated</span>
                      </div>
                    </div>
                    <div className="text-muted ms-4">
                      Changed from ${activity.changes?.old_amount || '0.00'} to ${activity.changes?.new_amount || '0.00'}
                    </div>
                    <small className="text-muted d-block ms-4">
                      {new Date(activity.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted">No amount update history available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActivitiesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProjectsPage;
