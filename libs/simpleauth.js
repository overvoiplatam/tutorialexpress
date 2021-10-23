module.exports = function (req, res, next) {
  // -----------------------------------------------------------------------
  // authentication middleware

	// change this
  const auth = {
    login: req.configuraciones.simpleauth.username,
    password: req.configuraciones.simpleauth.password
  }

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }
  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message
}