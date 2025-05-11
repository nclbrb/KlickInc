import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

function ReportIssueModal({ show, handleClose, projectId, refreshProjects }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      setError('Both title and description are required.');
      return;
    }
    
    const token = localStorage.getItem('access_token');
    const issueData = { title, description, project_id: projectId };
    
    axios
      .post('http://127.0.0.1:8000/api/issues', issueData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        setTitle('');
        setDescription('');
        handleClose(); // Close the modal after submission
        refreshProjects(); // Refresh the project list if needed
        alert('Issue reported successfully');
      })
      .catch((error) => {
        console.error('Error reporting issue:', error);
        alert('Error reporting issue');
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Report an Issue</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the title of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formDescription" className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          {error && <p className="text-danger mt-2">{error}</p>}

          {/* Align the button to the right */}
          <div className="text-end mt-3">
            <Button variant="primary" type="submit">
              Submit Report
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ReportIssueModal;
