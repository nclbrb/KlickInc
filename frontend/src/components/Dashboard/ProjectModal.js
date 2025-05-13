import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Nav, Badge, ListGroup } from 'react-bootstrap';
import api from '../../api';

function ProjectModal({ show, handleClose, project, refreshProjects, readOnly }) {
  const emptyForm = {
    project_name: '',
    project_code: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'To Do',
    budget: '',  // Added budget field
    actual_expenditure: '',  // Optional: you can handle actual_expenditure as needed
  };

  const [formData, setFormData] = useState(emptyForm);
  const [budgetError, setBudgetError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [issues, setIssues] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  const fetchProjectIssues = async (projectId) => {
    setIsLoadingIssues(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`/projects/${projectId}/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching project issues:', error);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  // Event listener for refreshing issues
  useEffect(() => {
    const modalElement = document.querySelector('.modal.show');
    if (modalElement) {
      const handleRefresh = (event) => {
        const { projectId } = event.detail;
        if (projectId === project?.id) {
          fetchProjectIssues(projectId);
        }
      };

      modalElement.addEventListener('refreshProjectIssues', handleRefresh);
      return () => modalElement.removeEventListener('refreshProjectIssues', handleRefresh);
    }
  }, [show, project]);

  const fetchProjectFiles = async (projectId) => {
    setIsLoadingFiles(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`/projects/${projectId}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching project files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  useEffect(() => {
    if (show) {
      // Reset active tab when modal opens
      setActiveTab('details');

      // Fetch data if project exists
      if (project?.id) {
        fetchProjectIssues(project.id);
        fetchProjectFiles(project.id);
      }
      if (project) {
        setFormData({
          project_name: project.project_name || '',
          project_code: project.project_code || '',
          description: project.description || '',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          status: project.status || 'To Do',
          budget: project.budget || '',  // Populate budget when editing
          actual_expenditure: project.actual_expenditure || '',  // Optional: handle actual_expenditure if needed
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [show, project]);

  const onClose = () => {
    setFormData(emptyForm);
    setBudgetError(''); // Reset any errors on close
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent changing status for new projects
    if (name === 'status' && !project) {
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    // Ensure budget is a valid number and greater than 0
    const budgetValue = parseFloat(formData.budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setBudgetError('Please enter a valid budget greater than 0.');
      return false;
    }
    setBudgetError('');  // Clear error if valid 
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form before submitting
    if (!validateForm()) {
      return;
    }

    const projectData = {
      ...formData,
      budget: parseFloat(formData.budget) || 0, // Ensure budget is a number
      actual_expenditure: parseFloat(formData.actual_expenditure) || 0, // Optional: Ensure actual_expenditure is a number if provided
    };
    
    // Only include status when updating an existing project
    if (project) {
      projectData.status = formData.status;
    } else {
      // Remove status for new projects (will be set by the backend)
      delete projectData.status;
    }

    if (readOnly) {
      onClose();
      return;
    }

    try {
      if (project) {
        // Update existing project
        await api.put(`/projects/${project.id}`, projectData);
      } else {
        // Create new project
        await api.post('/projects', projectData);
      }
      refreshProjects && refreshProjects();
      onClose();
      alert(project ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('An error occurred while saving the project. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'In Progress') {
      badgeClass = 'warning';
    } else if (status === 'Done') {
      badgeClass = 'success';
    }
    return <span className={`badge bg-${badgeClass}`}>{status}</span>;
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'View Project' : project ? 'Edit Project' : 'Create Project'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            >
              Details
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'issues'}
              onClick={() => setActiveTab('issues')}
            >
              Issues
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'files'}
              onClick={() => setActiveTab('files')}
            >
              Files
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === 'details' ? (
          <Form onSubmit={handleSubmit}>
          <Form.Group controlId="project_name" className="mb-3">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="project_code" className="mb-3">
            <Form.Label>Project Code</Form.Label>
            <Form.Control
              type="text"
              name="project_code"
              value={formData.project_code}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="start_date" className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="end_date" className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="budget" className="mb-3">
            <Form.Label>Budget</Form.Label>
            <Form.Control
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required={!readOnly}
              disabled={readOnly}
              min="0"
              step="0.01"
            />
            {budgetError && <div className="text-danger mt-2">{budgetError}</div>}
          </Form.Group>
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={readOnly || !project} // Disable for new projects or when in read-only mode
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Form.Select>
            {!project && !readOnly && (
              <Form.Text className="text-muted">Status can be updated after creating the project.</Form.Text>
            )}
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            {!readOnly ? (
              <Button variant="purp" type="submit">
                {project ? 'Update Project' : 'Create Project'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            )}
          </div>
        </Form>
        ) : activeTab === 'issues' ? (
          <div className="issues-tab">
            {isLoadingIssues ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : issues.length > 0 ? (
              <ListGroup variant="flush">
                {issues.map((issue) => (
                  <ListGroup.Item key={issue.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{issue.title}</h6>
                        <p className="mb-1 text-muted small">{issue.description}</p>
                        <small className="text-muted">
                          Reported by: {issue.reporter?.name || 'Unknown'} | 
                          Task: {issue.task?.title || 'Unknown'} |
                          {new Date(issue.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <Badge 
                        bg={issue.status === 'resolved' ? 'success' : 'warning'}
                        className="ms-2"
                      >
                        {issue.status}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-center text-muted py-3">No issues reported for this project.</p>
            )}
          </div>
        ) : activeTab === 'files' ? (
          <div className="files-tab">
            {isLoadingFiles ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : files.length > 0 ? (
              <ListGroup variant="flush">
                {files.map((file) => (
                  <ListGroup.Item key={file.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{file.original_name}</h6>
                        <small className="text-muted">
                          Task: {file.task?.title || 'Unknown'} | 
                          Uploaded by: {file.uploader?.name || 'Unknown'} | 
                          {new Date(file.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        Download
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-center text-muted py-3">No files uploaded for this project.</p>
            )}
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}

export default ProjectModal;
