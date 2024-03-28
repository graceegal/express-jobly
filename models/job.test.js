"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
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
});

/************************************** findAll */

// describe("findAll", function () {
//   test("works: no filter", async function () {
//     let companies = await Job.findAll({});
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });

//   test("works: filter by name", async function () {
//     let companies = await Job.findAll({ nameLike: "1" });
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       }
//     ]);
//   });

//   test("works: filter by minEmployees", async function () {
//     let companies = await Job.findAll({ minEmployees: 2 });
//     expect(companies).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });

//   test("works: filter by maxEmployees", async function () {
//     let companies = await Job.findAll({ maxEmployees: 2 });
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//   });

//   test("works: filter by nameLike, minEmployees, maxEmployees", async function () {
//     const companies =
//       await Job.findAll({ nameLike: "C", minEmployees: 2, maxEmployees: 2 });
//     expect(companies).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//   });

//   test("works: filter with no results", async function () {
//     const companies =
//       await Job.findAll({ nameLike: "1", minEmployees: 2, maxEmployees: 2 });
//     expect(companies).toEqual([]);
//   });

// });

// /************************************** _generateFilterSQL */

// describe("_generateFilterSQL tests", function () {
//   test("works: has all valid inputs", async function () {
//     const result = Job._generateFilterSQL({
//       nameLike: "1",
//       minEmployees: 1,
//       maxEmployees: 3
//     });
//     expect(result).toEqual({
//       whereSQL: "WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3",
//       values: ['%1%', 1, 3]
//     });
//   });

//   test("works: has some valid inputs", async function () {
//     const result = Job._generateFilterSQL({
//       nameLike: "1",
//       minEmployees: 1
//     });
//     expect(result).toEqual({
//       whereSQL: "WHERE name ILIKE $1 AND num_employees >= $2",
//       values: ['%1%', 1]
//     });
//   });

//   test("works: has no inputs", async function () {
//     const result = Job._generateFilterSQL({});
//     expect(result).toEqual({
//       whereSQL: "",
//       values: []
//     });
//   });
// });

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     const Job = await Job.get("c1");
//     expect(Job).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such Job", async function () {
//     try {
//       await Job.get("nope");
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let Job = await Job.update("c1", updateData);
//     expect(Job).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let Job = await Job.update("c1", updateDataSetNulls);
//     expect(Job).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such Job", async function () {
//     try {
//       await Job.update("nope", updateData);
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Job.update("c1", {});
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Job.remove("c1");
//     const res = await db.query(
//       "SELECT handle FROM companies WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such Job", async function () {
//     try {
//       await Job.remove("nope");
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });