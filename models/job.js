"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(`
                INSERT INTO jobs (title,
                                       salary,
                                       equity,
                                       company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`, [
      title,
      salary,
      equity,
      companyHandle,
    ],
    );
    const job = result.rows[0];

    return job;
  }

  /**Find jobs. If not given any search filters, queries database
   * for all jobs. Else, applies conditional logic to dynamically generate
   * a WHERE clause to retrieve filtered records from the database.
   *
   * Can filter on provided search filters:
   * - title (will find case-insensitive, partial matches)
   * - minSalary
   * - hasEquity
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll({ title, minSalary, hasEquity }) {
    const { whereSQL, values } =
      Job._generateFilterSQL({ title, minSalary, hasEquity });

    const querySQL = `
      SELECT id,
           title,
           salary,
           equity,
           company_handle AS "companyHandle"
      FROM jobs
      ${whereSQL}
      ORDER BY id`;

    const jobsRes = await db.query(querySQL, values);
    return jobsRes.rows;
  }

  /**Private static method only meant to be used within the Job class
   *
   * Applies conditional logic to dynamically generate a SQL WHERE clause and an
   * array that used for sanitization of the inputs.
   * Returns { whereSQL, values }
  */

  static _generateFilterSQL({ title, minSalary, hasEquity }) {
    const values = [];
    const whereStatements = [];

    if (title) {
      whereStatements.push(`title ILIKE $${values.length + 1}`);
      values.push(`%${title}%`);
    }

    if (minSalary) {
      whereStatements.push(`salary >= $${values.length + 1}`);
      values.push(minSalary);
    }

    if (hasEquity === true) {
      whereStatements.push('equity > 0');
    }

    let whereSQL = whereStatements.length === 0
      ? ""
      : "WHERE " + whereStatements.join(" AND ");

    return {
      whereSQL, values
    };
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }
}


module.exports = Job;
