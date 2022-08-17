import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

//
// MIDDLEWARE FUNCTIONS
// to fill the user object of request from the token
// responsible to fill the user of the request
//
//
// AUTHORIZATION - user signed-in
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};
// AUTHORIZATION - user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // then go to the next middleware
  } else {
    res
      .status(401)
      .send({ message: 'Error: 401 - Unathorized (invalid admin token)' });
  }
};
