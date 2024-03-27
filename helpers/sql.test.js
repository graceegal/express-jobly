"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");


describe("generate SQL for partial update", function () {
  test("given valid data to update", function () {
    const dataToUpdate = {
      test: "testVal",
      newTest: "testVal2"
    };
    const jsToSql = {
      newTest: "new_test"
    };
    const res = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(res).toEqual({
      setCols: '"test"=$1, "new_test"=$2',
      values: ['testVal', 'testVal2']
    });
  });

  test("given empty data to update", function () {
    const dataToUpdate = {};
    const jsToSql = {
      newTest: "new_test"
    };

    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrow(BadRequestError);
  });
});