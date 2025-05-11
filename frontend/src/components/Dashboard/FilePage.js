import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Modal, Form, Container } from 'react-bootstrap';
import api from '../../api'; // adjust path if needed
import NavBar from './NavBar'; // Make sure the path is correct

const FilePage = ({ user, onLogout }) => {
  const [files, setFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    api
      .get('/files')
      .then((res) => setFiles(res.data))
      .catch((err) => console.error('Error fetching files:', err));
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);

    api.post('/files/upload', formData)
      .then(() => {
        setShowUploadModal(false);
        fetchFiles();
      })
      .catch((err) => console.error('Upload error:', err));
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar via shared NavBar component */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Shared Files</h3>
          </div>

          <Row>
            {files.length === 0 ? (
              <div className="text-muted ms-3">No files uploaded yet.</div>
            ) : (
              files.map((file) => (
                <Col key={file.id} md={3} className="mb-4">
                  <Card className="h-100 shadow-sm text-center">
                    <Card.Body>
                      <i className="material-icons" style={{ fontSize: '48px' }}>insert_drive_file</i>
                      <Card.Title className="small mt-2">{file.name}</Card.Title>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-around">
                      <a href={file.download_url} target="_blank" rel="noreferrer">
                        <Button variant="outline-success" size="sm">Download</Button>
                      </a>
                      <Button variant="outline-secondary" size="sm">
                        <i className="material-icons" style={{ fontSize: '16px' }}>share</i>
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Col>
      </Row>

      {/* Floating Action Button (FAB) for Upload */}
      <Button
        variant="primary"
        onClick={() => setShowUploadModal(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '70px',
          height: '70px',
          fontSize: '40px',
          padding: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          border: 'none',
        }}
      >
        <span style={{ color: 'white' }}>+</span>
      </Button>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFile">
              <Form.Label>Select file</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FilePage;
