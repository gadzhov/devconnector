import axios from 'axios';
import { setAlert } from './alert';
import { GET_POSTS, POST_ERROR } from './types';

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
