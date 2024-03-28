"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when user must have admin permissions.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  const currUser = res.locals.user;

  const isAdmin = currUser?.isAdmin === true;

  // FIXME: can change to !isAdmin on below line
  if (!currUser || isAdmin !== true) {
    throw new UnauthorizedError();
  }
  return next();
}

/** Middleware: Requires user is user for route or user has admin permissions.
 *
 * If not, raises Unauthorized.
*/

// TODO: change function name - ensureCorrectUserOrAdmin
function ensureCorrectUser(req, res, next) {
  const currUser = res.locals.user;
  const hasAuthorizedUsername = currUser?.username === req.params.username;
  const isAdmin = currUser?.isAdmin === true;

  if (!currUser || (!hasAuthorizedUsername && !isAdmin)) {
    throw new UnauthorizedError();
  }
  return next();
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser,
};

