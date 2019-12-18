import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST
} from './types';

// Get posts
export const getPosts = () => async dispatch => {
  try {
    const resp = await axios.get('api/posts');

    dispatch({
      type: GET_POSTS,
      payload: resp.data
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add like
export const addLike = postId => async dispatch => {
  try {
    const resp = await axios.put(`api/posts/like/${postId}`);

    dispatch({
      type: UPDATE_LIKES,
      payload: {
        postId,
        likes: resp.data
      }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Remove like
export const removeLike = postId => async dispatch => {
  try {
    const resp = await axios.put(`api/posts/unlike/${postId}`);

    dispatch({
      type: UPDATE_LIKES,
      payload: {
        postId,
        likes: resp.data
      }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete post
export const deletePost = postId => async dispatch => {
  try {
    await axios.delete(`/api/posts/${postId}`);

    dispatch({
      type: DELETE_POST,
      payload: postId
    });

    dispatch(setAlert('Post removed', 'success'));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add post
export const addPost = formData => async dispatch => {
  const config = {
    headers: {
      'Content-type': 'application/json'
    }
  };
  try {
    const resp = await axios.post('/api/posts', formData, config);

    dispatch({
      type: ADD_POST,
      payload: resp.data
    });

    dispatch(setAlert('Post created', 'success'));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
