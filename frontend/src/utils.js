//error handler
export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};
//note: error.response.data.message refers to...
// from server.js
// res.status(404).send({message: 'Product not found'});
// otherwise return the general error message
