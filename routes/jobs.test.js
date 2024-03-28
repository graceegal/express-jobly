"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4AdminToken,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
  const newJob = {
    title: "TestJob",
    salary: 30000,
    equity: 0,
    companyHandle: "c1",
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "TestJob",
        salary: 30000,
        equity: "0",
        companyHandle: "c1",
      }
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("unauthorized for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("bad request with missing data as admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 10000,
        equity: 0.5,
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with missing data as user", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 10000,
        equity: 0.5,
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

  test("bad request with missing data as anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 10000,
        equity: 0.5,
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("bad request with invalid data as admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "TestJob",
        salary: "string",
        equity: 0,
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance.salary is not of a type(s) integer"
        ],
        status: 400
      }
    });
  });

  test("bad request with invalid data as non-admin user", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "TestJob",
        salary: "string",
        equity: 0,
        companyHandle: "c1",
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

  test("bad request with invalid data as anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "TestJob",
        salary: "string",
        equity: 0,
        companyHandle: "c1",
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok - no filter", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: jobIds[0],
            title: "Comp1 Job",
            salary: 10000,
            equity: "0.5",
            companyHandle: "c1",
          },
          {
            id: jobIds[1],
            title: "Comp2 Job",
            salary: 10000,
            equity: "0",
            companyHandle: "c2",
          },
          {
            id: jobIds[2],
            title: "Comp3 Job",
            salary: 5000,
            equity: "0.9",
            companyHandle: "c3",
          },
        ],
    });
  });

  test("ok - filter by title, minSalary, hasEquity", async function () {
    const params = new URLSearchParams({
      title: "1",
      minSalary: 7000,
      hasEquity: true
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: jobIds[0],
            title: "Comp1 Job",
            salary: 10000,
            equity: "0.5",
            companyHandle: "c1",
          }
        ],
    });
  });

  test("ok - filter by just minSalary", async function () {
    const params = new URLSearchParams({
      minSalary: 7000
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: jobIds[0],
            title: "Comp1 Job",
            salary: 10000,
            equity: "0.5",
            companyHandle: "c1",
          },
          {
            id: jobIds[1],
            title: "Comp2 Job",
            salary: 10000,
            equity: "0",
            companyHandle: "c2",
          },
        ],
    });
  });

  test("ok - filter by hasEquity = 'false'; disregards hasEquity filter", async function () {
    const params = new URLSearchParams({
      hasEquity: false
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: jobIds[0],
            title: "Comp1 Job",
            salary: 10000,
            equity: "0.5",
            companyHandle: "c1",
          },
          {
            id: jobIds[1],
            title: "Comp2 Job",
            salary: 10000,
            equity: "0",
            companyHandle: "c2",
          },
          {
            id: jobIds[2],
            title: "Comp3 Job",
            salary: 5000,
            equity: "0.9",
            companyHandle: "c3",
          }
        ],
    });
  });

  test("not ok - filter by invalidFilter", async function () {
    const params = new URLSearchParams({
      invalidFilter: "test",
      title: "1",
      minSalary: 5000,
      hasEquity: true
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance is not allowed to have the additional property \"invalidFilter\""
        ],
        status: 400
      }
    });
  });

  test("not ok - title is empty string", async function () {
    const params = new URLSearchParams({
      title: "",
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance.title does not meet minimum length of 1"
        ],
        status: 400
      }
    });
  });

  test("not ok - minSalary is not a number", async function () {
    const params = new URLSearchParams({
      minSalary: "min",
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: "minSalary must be a number",
        status: 400
      }
    });
  });

  test("not ok - hasEquity is not ('true' or 'false')", async function () {
    const params = new URLSearchParams({
      hasEquity: "foo",
    });
    const resp = await request(app).get(`/jobs?${params}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance.hasEquity is not one of enum values: true,false"
        ],
        status: 400
      }
    });
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "Comp1 Job",
        salary: 10000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("works for anon: job w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "Comp1 Job",
        salary: 10000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: "No job with id: 0",
        status: 404
      }
    })
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        title: "Comp1 Job Updated",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "Comp1 Job Updated",
        salary: 10000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("Unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        title: "Comp1 Job Updated",
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
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        title: "Comp1 Job Updated",
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found on no such job as admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "Comp1 Job Updated",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found on no such job as non-admin user", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "Comp1 Job Updated",
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

  test("not found on no such job as anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "Comp1 Job Updated",
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("bad request on id change attempt as admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        id: 1,
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance is not allowed to have the additional property \"id\""
        ],
        status: 400
      }
    })
  });

  test("bad request on id change attempt as non-admin user", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        id: 1,
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

  test("bad request on id change attempt as anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        id: 1,
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("bad request on invalid data as admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        salary: "not-a-integer",
      })
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance.salary is not of a type(s) integer"
        ],
        status: 400
      }
    })
  });

  test("bad request on invalid data as non-admin user", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        salary: "not-a-integer",
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

  test("bad request on invalid data as anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        salary: "not-a-integer",
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobIds[0]}` });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[1]}`)
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
      .delete(`/jobs/${jobIds[1]}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found for no such job as admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${u4AdminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: "No job with id: 0",
        status: 404
      }
    })
  });

  test("not found for no such job as non-admin user", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });

  test("not found for no such job as anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});