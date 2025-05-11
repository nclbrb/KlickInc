import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

const CommentSection = ({ taskId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for task:', taskId);
      
      if (!taskId) {
        console.error('No taskId provided');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Raw comments response:', JSON.stringify(response.data, null, 2));
      
      let commentsData = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        commentsData = response.data;
      } else if (response.data && Array.isArray(response.data.comments)) {
        // Response with comments array in data.comments
        commentsData = response.data.comments;
      } else if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        // Response with status and data array
        commentsData = response.data.data;
      } else if (response.data && response.data.comment) {
        // Single comment response
        commentsData = [response.data.comment];
      } else {
        console.warn('Unexpected response format, defaulting to empty array');
      }
      
      console.log('Processed comments:', commentsData);
      setComments(commentsData);
      
    } catch (error) {
      console.error('Error fetching comments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('access_token');
      const commentContent = newComment.trim();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Sending comment:', { content: commentContent });
      
      const response = await axios({
        method: 'post',
        url: `http://127.0.0.1:8000/api/tasks/${taskId}/comments`,
        data: {
          content: commentContent
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Comment response:', response.data);
      
      if (response.data && response.data.status === 'success' && response.data.comment) {
        setNewComment('');
        // Add the new comment to the list
        setComments(prev => [response.data.comment, ...prev]);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      console.log('Error response:', error.response);
      
      let errorMessage = 'Failed to post comment';
      if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        errorMessage = Object.values(error.response.data.errors).flat().join(' ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mt-3">
      <h5>Comments</h5>
      
      <ListGroup className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {isLoading ? (
          <ListGroup.Item className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Loading comments...</span>
          </ListGroup.Item>
        ) : error ? (
          <ListGroup.Item className="text-danger">
            {error}
            <Button 
              variant="link" 
              onClick={fetchComments}
              className="p-0 ms-2" 
              size="sm"
            >
              Retry
            </Button>
          </ListGroup.Item>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => {
              if (!comment) {
                console.warn('Undefined comment in comments array');
                return null;
              }
              
              // Debug log the comment data
              const commentDebug = {
                id: comment.id,
                content: comment.content,
                user: comment.user || 'No user data',
                user_id: comment.user_id || 'No user_id',
                currentUser: currentUser?.id,
                commentObject: comment
              };
              console.log('Rendering comment:', commentDebug);
              
              // Get user name from various possible locations
              const userName = comment.user?.name || 
                             comment.user?.username ||
                             (comment.user_id ? `User ${comment.user_id}` : 'Unknown User');
                             
              // Get user ID from various possible locations
              const userId = comment.user_id || 
                           (comment.user ? comment.user.id : null) || 
                           'unknown';
                             
              // Format the date
              const commentDate = comment.created_at ? 
                                formatDate(comment.created_at) : 
                                'Unknown date';
                             
              return (
                <ListGroup.Item key={comment.id || `comment-${Math.random()}`} 
                              className="mb-2 rounded" 
                              data-comment-id={comment.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div style={{ width: '100%' }}>
                      <div className="d-flex align-items-center">
                        <strong className="comment-user" data-user-id={userId}>
                          {userName}
                        </strong>
                        <small className="text-muted ms-2">
                          {commentDate}
                        </small>
                        {(userId === currentUser?.id || userId === currentUser?._id) && (
                          <Badge bg="secondary" className="ms-2">You</Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                          {comment.content || 'No content'}
                        </p>
                        <div className="text-muted small mt-1">
                          Comment ID: {comment.id || 'N/A'} | 
                          User ID: {userId || 'N/A'}
                        </div>
                      </div>
                    </div>
                    {(userId === currentUser?.id || currentUser?.role === 'project_manager') && (
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleDelete(comment.id)}
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })}
          </>
        ) : (
          <ListGroup.Item className="text-muted text-center">
            No comments yet. Be the first to comment!
          </ListGroup.Item>
        )}
      </ListGroup>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="commentTextarea">
          <Form.Label htmlFor="commentTextarea">Add a comment</Form.Label>
          <Form.Control
            as="textarea"
            id="commentTextarea"
            name="comment"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            required
            disabled={isSubmitting}
            aria-describedby="commentHelp"
          />
          <Form.Text id="commentHelp" className="text-muted" muted>
            Press Enter to submit your comment
          </Form.Text>
          {submitError && (
            <div className="text-danger small mt-1">{submitError}</div>
          )}
        </Form.Group>
        <div className="d-flex justify-content-between align-items-center">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Posting...
              </>
            ) : 'Post Comment'}
          </Button>
          {newComment.trim() && (
            <Button 
              variant="link" 
              onClick={() => setNewComment('')}
              disabled={isSubmitting}
              className="text-muted"
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default CommentSection;
