import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

function TaskIssueModal({ show, onHide, task, onReportSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!title.trim() || !description.trim()) {
      setError('Both title and description are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://127.0.0.1:8000/api/issues',
        {
          title,
          description,
          project_id: task.project_id,
          task_id: task.id,
          type: 'task'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setTitle('');
      setDescription('');
      setError('');
      // Notify parent components that a new issue was created
      onReportSubmit();
      
      // Refresh the project modal if it's open
      const projectModalElement = document.querySelector('.modal.show');
      if (projectModalElement) {
        const projectId = task.project_id;
        if (projectId) {
          // Trigger a custom event that ProjectModal will listen for
          const refreshEvent = new CustomEvent('refreshProjectIssues', { detail: { projectId } });
          projectModalElement.dispatchEvent(refreshEvent);
        }
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      setError(error.response?.data?.message || 'Error reporting issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Report Issue for Task: {task?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Issue Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Describe the issue in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TaskIssueModal; 