"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin login
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userNewSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin login
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, email, isAdmin, jobs }
 *  where jobs is [id, ...]
 *
 * Authorization required: current user login OR admin login
 **/

router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  const user = await User.get(req.params.username);

  // ask why forEach doesn't work here?
  user.jobs = user.jobs.map(j => j.id);

  return res.json({ user });
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: current user login OR admin login
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userUpdateSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.update(req.params.username, req.body);
  return res.json({ user });
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: current user login OR admin login
 **/

router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  await User.remove(req.params.username);
  return res.json({ deleted: req.params.username });
});



/** POST /[username]/jobs/[id] => { applied: jobId }
 *
 * Authorization required: current user login OR admin login
*/

router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  const jobId = Number(req.params.id);
  if (isNaN(jobId)) throw new BadRequestError("Job ID must be a number");

  await User.applyToJob(req.params.username, jobId);

  return res.json({ applied: jobId });
});


module.exports = router;
