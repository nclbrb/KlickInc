import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Button, Container, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { getProjectFiles, deleteTaskFile } from '../../api'; // Use getProjectFiles
import NavBar from './NavBar'; // Make sure the path is correct
import axios from 'axios'; // For fetching projects list initially

const FilePage = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch projects for the dropdown
  const fetchProjects = useCallback(async () => {
    try {
      // This should ideally use a function from api.js if you centralize all calls
      // For now, using the existing ProjectController logic
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/projects', {
         headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data || []);
      if (response.data && response.data.length > 0) {
        // Optionally pre-select the first project or leave it empty
        // setSelectedProjectId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects list.');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch files when selectedProjectId changes
  const fetchFilesForProject = useCallback(async () => {
    if (!selectedProjectId) {
      setFiles([]); // Clear files if no project is selected
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await getProjectFiles(selectedProjectId);
      setFiles(response.data || []);
    } catch (err) {
      console.error('Error fetching files for project:', err);
      setError('Failed to load files. ' + (err.response?.data?.message || err.message));
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchFilesForProject();
  }, [fetchFilesForProject]);


  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const handleFileDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) return;
    setError('');
    try {
      await deleteTaskFile(fileId);
      fetchFilesForProject(); // Refresh file list
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} />
        </Col>

        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Project Files</h3>
          </div>

          <Form.Group as={Row} className="mb-4 align-items-center">
            <Form.Label column sm="2" lg="1">Select Project:</Form.Label>
            <Col sm="10" lg="4">
              <Form.Select onChange={handleProjectChange} value={selectedProjectId}>
                <option value="">-- Choose a Project --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name} ({project.project_code})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading files...</span>
              </Spinner>
              <p className="mt-2">Loading files...</p>
            </div>
          ) : !selectedProjectId ? (
             <Alert variant="info">Please select a project to view its files.</Alert>
          ) : files.length === 0 && selectedProjectId ? (
            <Alert variant="secondary">No files found for the selected project.</Alert>
          ) : (
            <ListGroup>
              {files.map((file) => (
                <ListGroup.Item key={file.id} className="mb-2 shadow-sm">
                  <Row className="align-items-center">
                    <Col md={1}>
                      {/* Basic icon based on mime type - can be expanded */}
                      {file.mime_type && file.mime_type.startsWith('image/') ? (
                        <i className="fas fa-file-image fa-2x text-info"></i>
                      ) : file.mime_type === 'application/pdf' ? (
                        <i className="fas fa-file-pdf fa-2x text-danger"></i>
                      ) : (
                        <i className="fas fa-file-alt fa-2x text-secondary"></i>
                      )}
                    </Col>
                    <Col md={6}>
                      <h6 className="mb-0">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" title={`Download ${file.original_filename}`}>
                          {file.original_filename}
                        </a>
                      </h6>
                      <small className="text-muted d-block">
                        Task: {file.task_title || 'N/A'} (ID: {file.task_id || 'N/A'})
                      </small>
                      <small className="text-muted d-block">
                        Uploaded by: {file.user?.username || 'Unknown'} on {new Date(file.created_at).toLocaleDateString()}
                      </small>
                    </Col>
                    <Col md={3} className="text-md-end">
                      <small className="text-muted">{(file.size / 1024).toFixed(1)} KB</small>
                    </Col>
                    <Col md={2} className="text-md-end mt-2 mt-md-0">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="me-2"
                        title="Download"
                      >
                        <i className="fas fa-download"></i>
                      </Button>
                      {/* Simple permission: only uploader or PM can delete from this page */}
                      {(user && (user.id === file.user_id || user.role === 'project_manager')) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleFileDelete(file.id, file.original_filename)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
           {/* Removed the floating action button for upload from this page */}
        </Col>
      </Row>
    </Container>
  );
};

export default FilePage;