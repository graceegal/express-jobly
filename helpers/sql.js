"use strict";

const { BadRequestError } = require("../expressError");

/** Generates SQL and converting Javascript camelCased keys to snake_case
 * for use in database operations
 *
 * Takes in (dataToUpdate, jsToSql)
 *    - dataToUpdate: an object with data that is being updated
 *    - jsToSQL: object with camelCased keys and snaked_cased equivalents as values
 *
 * Returns { setCols, values}
 *    - setCols: joined SQL string for setting the new columns
 *    - values: array of data that will be passed in to database
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
