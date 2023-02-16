import axios from 'axios'
import StatusCode from 'http-status-codes'
import UnauthenticatedError from '../errors/unauthenticated'

const auth = async(req, res, next) => {
  try {
      const response = await axios.get(`${process.env.API_URL}/v1/verify-user`, {
          headers: {
              'Accept':'application/json',
              'Authorization':`Bearer ${process.env.AUTH_TOKEN}`
          }
      });
      if (response) return response.data
      throw new UnauthenticatedError('Authentication invalid')
  } catch (error) {
    throw new UnauthenticatedError(error)
  };
  
}

export default auth;