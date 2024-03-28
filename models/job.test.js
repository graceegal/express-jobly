"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 100000,
    equity: 0.5,
    companyHandle: "c1",
  };

  const nonexistentCompanyJob = {
    title: "New Job",
    salary: 100000,
    equity: 0.5,
    companyHandle: "does-not-exist",
  };

  test("works", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 100000,
      equity: "0.5",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'New Job'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New Job",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request if company does not exist", async function () {
    try {
      await Job.create(nonexistentCompanyJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: filter by title", async function () {
    let jobs = await Job.findAll({ title: "1" });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "Comp1 Job",
        salary: 10000,
        equity: "0.5",
        companyHandle: "c1",
      }
    ]);
  });

  test("works: filter by minSalary", async function () {
    let jobs = await Job.findAll({ minSalary: 7000 });
    expect(jobs).toEqual([
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
      }
    ]);
  });

  test("works: filter by hasEquity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "Comp1 Job",
        salary: 10000,
        equity: "0.5",
        companyHandle: "c1",
      },
      {
        id: jobIds[2],
        title: "Comp3 Job",
        salary: 5000,
        equity: "0.9",
        companyHandle: "c3",
      }
    ]);
  });

  test("works: filter by hasEquity false", async function () {
    let jobs = await Job.findAll({ hasEquity: false });
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: filter by title, minSalary, hasEquity", async function () {
    const jobs =
      await Job.findAll({ title: "comp", minSalary: 7000, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "Comp1 Job",
        salary: 10000,
        equity: "0.5",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: filter with no results", async function () {
    const jobs =
      await Job.findAll({ title: "comp", minSalary: 20000, hasEquity: true });
    expect(jobs).toEqual([]);
  });

});

// /************************************** _generateFilterSQL */

describe("_generateFilterSQL tests", function () {
  test("works: has all valid inputs", async function () {
    const result = Job._generateFilterSQL({
      title: "1",
      minSalary: 1000,
      hasEquity: true,
    });
    expect(result).toEqual({
      whereSQL: "WHERE title ILIKE $1 AND salary >= $2 AND equity > 0",
      values: ['%1%', 1000]
    });
  });

  test("works: has some valid inputs", async function () {
    const result = Job._generateFilterSQL({
      title: "1",
      minSalary: 1000,
    });
    expect(result).toEqual({
      whereSQL: "WHERE title ILIKE $1 AND salary >= $2",
      values: ['%1%', 1000]
    });
  });

  test("works: has no inputs", async function () {
    const result = Job._generateFilterSQL({});
    expect(result).toEqual({
      whereSQL: "",
      values: []
    });
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    const job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      id: jobIds[0],
      title: "Comp1 Job",
      salary: 10000,
      equity: "0.5",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "Comp1 Job Updated",
    salary: 25000,
    equity: 0.33,
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      title: "Comp1 Job Updated",
      salary: 25000,
      equity: "0.33",
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "Comp1 Job Updated",
      salary: 25000,
      equity: "0.33",
      companyHandle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "Comp1 Job",
      salary: null,
      equity: null,
    };

    let job = await Job.update(jobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: jobIds[0],
      ...updateDataSetNulls,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "Comp1 Job",
      salary: null,
      equity: null,
      companyHandle: "c1",
    }]);
  });

  test("not found if no such Job", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
      `DELETE FROM jobs WHERE id = ${jobIds[0]} RETURNING id`);
    expect(res.rows[0]).toEqual(undefined);
  });

  test("not found if no such Job", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});