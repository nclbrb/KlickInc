import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, ListGroup } from 'react-bootstrap';
import api from '../../api';
import NavBar from './NavBar';

const ActivityFeedPage = ({ user, onLogout }) => {
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true); // New state for loading
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    // Fetch activity feed from the API
    api.get('/activity-feed') // Replace with the correct API endpoint
      .then((response) => {
        setActivityFeed(response.data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error('Error fetching activity feed:', error);
        setLoading(false); // Set loading to false on error
      });
  }, []);

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
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
            <h3>Activity Feed</h3>
          </div>

          {/* Display loading indicator while fetching */}
          {loading ? (
            <p>Loading activities...</p>
          ) : (
            <Row>
              {activityFeed.length === 0 ? (
                <div className="text-muted ms-3">No activities found.</div>
              ) : (
                activityFeed.map((activity, idx) => (
                  <Col key={idx} md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm" onClick={() => handleActivityClick(activity)} style={{ cursor: 'pointer' }}>
                      <Card.Body>
                        <h5 className="card-title">{activity.user}</h5>
                        <p className="card-text">{activity.action}</p>
                        <p className="text-muted">{activity.time}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}
        </Col>
      </Row>

      {/* Activity Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Activity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedActivity ? (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>User:</strong> {selectedActivity.user}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Action:</strong> {selectedActivity.action}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Time:</strong> {selectedActivity.time}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Details:</strong> {selectedActivity.details || 'No additional details'}
              </ListGroup.Item>
            </ListGroup>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ActivityFeedPage;
