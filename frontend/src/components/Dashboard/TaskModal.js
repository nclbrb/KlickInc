import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, ListGroup, ProgressBar, Alert, Badge, Spinner } from 'react-bootstrap';
// Removed direct axios import, will use functions from api.js
import { uploadTaskFile, getTaskFiles, deleteTaskFile } from '../../api'; // Adjust path if api.js is elsewhere

// Assuming currentUser is passed as a prop or available from context for potential UI logic
function TaskModal({ show, handleClose, task, refreshTasks, projects, currentUser }) {
  const emptyForm = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    project_id: '',
    assigned_to: '',
    deadline: '',
    budget: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [budgetError, setBudgetError] = useState('');

  // --- NEW STATE FOR FILE MANAGEMENT ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState('');
  const [filesLoading, setFilesLoading] = useState(false);
  // --- END OF NEW STATE ---

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token'); // Still needed for direct axios calls if any remain
      // This should ideally also use a function from api.js if you centralize all calls
      const response = await fetch('http://127.0.0.1:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      const teamMembers = data.filter(user => user.role === 'team_member');
      setUsers(teamMembers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchAttachedFiles = useCallback(async (taskId) => {
    if (!taskId) return;
    setFilesLoading(true);
    setFileError('');
    try {
      const response = await getTaskFiles(taskId);
      setAttachedFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching attached files:', error);
      setFileError('Failed to load files. ' + (error.response?.data?.message || error.message));
      setAttachedFiles([]); // Clear files on error
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchUsers();
      if (task && task.id) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          project_id: task.project_id || '',
          assigned_to: task.assigned_to || '',
          deadline: task.deadline ? task.deadline.split('T')[0] : '',
          budget: task.budget || ''
        });
        fetchAttachedFiles(task.id);
      } else {
        setFormData(emptyForm);
        setAttachedFiles([]); // Clear files for new task
      }
      // Reset file-specific states when modal opens/changes task
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
      setFileError('');
      setBudgetError('');
    }
  }, [show, task, fetchUsers, fetchAttachedFiles]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status' && !task) return;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'project_id' || name === 'assigned_to' ? parseInt(value, 10) || '' : value
    }));
  };

  // --- NEW FILE HANDLERS ---
  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0] || null);
    setFileError(''); // Clear previous file errors
  };

  const handleFileUpload = async (taskIdToUploadFor) => {
    if (!selectedFile || !taskIdToUploadFor) return;

    setIsUploading(true);
    setUploadProgress(0);
    setFileError('');

    try {
      await uploadTaskFile(taskIdToUploadFor, selectedFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      setSelectedFile(null); // Clear file input after successful upload
      fetchAttachedFiles(taskIdToUploadFor); // Refresh file list
    } catch (error) {
      console.error('Error uploading file:', error);
      setFileError('Upload failed: ' + (error.response?.data?.message || error.response?.data?.errors?.file?.[0] || error.message));
    } finally {
      setIsUploading(false);
      setUploadProgress(0); // Reset progress bar after completion or error
    }
  };

  const handleFileDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    setFileError('');
    try {
      await deleteTaskFile(fileId);
      if (task && task.id) {
        fetchAttachedFiles(task.id); // Refresh file list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setFileError('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };
  // --- END OF NEW FILE HANDLERS ---

  const onClose = () => {
    setFormData(emptyForm);
    setBudgetError('');
    setSelectedFile(null);
    setAttachedFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
    setFileError('');
    handleClose();
  };

  const validateBudget = () => {
    // ... (keep existing budget validation)
    const project = projects.find(p => p.id === formData.project_id);
    const taskBudget = parseFloat(formData.budget);

    if (project && taskBudget > parseFloat(project.budget)) {
      setBudgetError('Task budget cannot exceed project budget.');
      return false;
    }
    setBudgetError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBudget()) return;

    const taskDataPayload = { ...formData };
    // Ensure budget is a number or null
    taskDataPayload.budget = taskDataPayload.budget ? parseFloat(taskDataPayload.budget) : null;


    try {
      let currentTaskId;
      if (task && task.id) { // Editing existing task
        // Use direct axios or create a specific updateTask API function
        const token = localStorage.getItem('access_token');
        await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, taskDataPayload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        currentTaskId = task.id;
      } else { // Creating new task
        // Use direct axios or create a specific createTask API function
        const token = localStorage.getItem('access_token');
        const response = await axios.post('http://127.0.0.1:8000/api/tasks', taskDataPayload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        currentTaskId = response.data.id; // Assuming backend returns the created task with its ID
      }

      // After task is saved, upload the file if selected
      if (selectedFile && currentTaskId) {
        await handleFileUpload(currentTaskId);
      }

      refreshTasks();
      onClose(); // Call onClose which now also resets file states
    } catch (error) {
      console.error('Error saving task:', error);
      // More specific error handling for task save
      const taskSaveError = error.response?.data?.message || 
                            (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(' ') : 'Error saving task');
      alert(taskSaveError);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" dialogClassName="custom-task-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>{task ? 'Edit Task' : 'Create New Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit} className="mt-3">
          {/* ... (keep existing form groups for project, title, description, etc.) ... */}
          <Form.Group className="mb-3" controlId="project">
            <Form.Label>Project</Form.Label>
            <Form.Select name="project_id" value={formData.project_id} onChange={handleChange} required>
              <option value="">Select Project</option>
              {projects.map(project => ( <option key={project.id} value={project.id}> {project.project_name} ({project.project_code}) </option> ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange}/>
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange} required disabled={!task} >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Select>
                {!task && <Form.Text className="text-muted">Status can be updated after creating the task.</Form.Text>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="priority">
                <Form.Label>Priority</Form.Label>
                <Form.Select name="priority" value={formData.priority} onChange={handleChange} required>
                  <option value="low">🔵 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="assigned_to">
                <Form.Label>Assign To</Form.Label>
                <Form.Select name="assigned_to" value={formData.assigned_to} onChange={handleChange} required>
                  <option value="">Select Team Member</option>
                  {users.map(user => ( <option key={user.id} value={user.id}> {user.username} ({user.email}) </option> ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="deadline">
                <Form.Label>Deadline</Form.Label>
                <Form.Control type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="budget">
            <Form.Label>Task Budget</Form.Label>
            <Form.Control type="number" name="budget" value={formData.budget} onChange={handleChange} min="0" step="0.01" />
            {budgetError && <div className="text-danger mt-1 small">{budgetError}</div>}
          </Form.Group>

          {/* --- NEW FILE UPLOAD SECTION --- */}
          <hr />
          <h5>Attachments</h5>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload New File</Form.Label>
            <Form.Control type="file" onChange={handleFileSelect} disabled={isUploading} />
            {selectedFile && <small className="text-muted d-block mt-1">Selected: {selectedFile.name}</small>}
          </Form.Group>

          {isUploading && (
            <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} className="mb-3" />
          )}
          {fileError && <Alert variant="danger" className="mt-2 small">{fileError}</Alert>}
          
          {/* Display existing files */}
          <h6>Existing Files:</h6>
          {filesLoading ? (
            <div className="text-center my-3">
                <Spinner animation="border" size="sm" /> Loading files...
            </div>
          ) : attachedFiles.length > 0 ? (
            <ListGroup variant="flush" className="mb-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
              {attachedFiles.map(file => (
                <ListGroup.Item key={file.id} className="d-flex justify-content-between align-items-center p-2">
                  <div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" title={`Download ${file.original_filename}`}>
                      {file.original_filename}
                    </a>
                    <br />
                    <small className="text-muted">
                      Uploaded by: {file.user?.username || 'Unknown'} on {new Date(file.created_at).toLocaleDateString()}
                      {' '}({(file.size / 1024).toFixed(1)} KB)
                    </small>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleFileDelete(file.id, file.original_filename)}
                    title="Delete file"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted small">No files attached to this task yet.</p>
          )}
          {/* --- END OF NEW FILE UPLOAD SECTION --- */}
          <hr />
          <div className="mt-3 d-flex justify-content-end">
            <Button variant="secondary" onClick={onClose} className="me-2" disabled={isUploading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TaskModal;