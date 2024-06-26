"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u4AdminToken,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  test("works for admin: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      }, token: expect.any(String),
    });
  });

  test("works for admin: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      }, token: expect.any(String),
    });
  });

  test("Unauthorized for users: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("Unauthorized for users: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data as admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if missing data as non-admin user", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data as anon", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if invalid data as admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data as non-admin user", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if invalid data as anon", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: true,
      });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: false,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false,
        },
        {
          username: "u4Admin",
          firstName: "U4F",
          lastName: "U4L",
          email: "user4@user.com",
          isAdmin: true,
        },
      ],
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get("/users");
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        jobs: [jobIds[0], jobIds[1]],
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        jobs: [jobIds[0], jobIds[1]],
      },
    });
  });

  test("unauth for incorrect user", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found if user not found as admin", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if user not found as non-admin user", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found if user not found as anon", async function () {
    const resp = await request(app)
      .get(`/users/nope`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for correct user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  test("unauth for incorrect user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user as admin", async function () {
    const resp = await request(app)
      .patch(`/users/nope`)
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such user as non-admin user", async function () {
    const resp = await request(app)
      .patch(`/users/nope`)
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user as anon", async function () {
    const resp = await request(app)
      .patch(`/users/nope`)
      .send({
        firstName: "Nope",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if invalid data as admin", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data as non-admin, but correct user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data as non-admin, but incorrect user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if invalid data as anon", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("works: set new password", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth for incorrect user", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing as admin", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if user missing as non-admin user", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing as anon", async function () {
    const resp = await request(app)
      .delete(`/users/nope`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /users/:username/jobs/:id */

describe("POST /users/:username/jobs/:id", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ applied: jobIds[0] });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[1]}`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({ applied: jobIds[1] });
  });

  test("unauth for incorrect non-admin user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[2]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[2]}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("Bad request with string as job ID for correct user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/nope`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: "Job ID must be a number",
        status: 400
      }
    });
  });

  test("Bad request with string as job ID for admin", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/nope`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: "Job ID must be a number",
        status: 400
      }
    });
  });

  test("Unauth with string as job ID for incorrect non-admin user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/nope`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("Unauth with string as job ID for anon", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/nope`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found if no such user as admin", async function () {
    const resp = await request(app)
      .post(`/users/nope/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: "No user: nope",
        status: 404
      }
    });
  });

  test("unauth if no such user as non-admin user", async function () {
    const resp = await request(app)
      .post(`/users/nope/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth if no such user as anon", async function () {
    const resp = await request(app)
      .post(`/users/nope/jobs/${jobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found if no such job as admin", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/0`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: "No job with id: 0",
        status: 404
      }
    });
  });

  test("not found if no such job as correct user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/0`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: "No job with id: 0",
        status: 404
      }
    });
  });

  test("unauth if no such job as incorrect non-admin user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/0`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauth if no such job as anon", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/0`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});