'use strict';
/* eslint-disable require-jsdoc */

import assert from 'assert';
import { removeWhiteSpace } from './utils/testUtils';
import replaceEnum from '../src/index';

describe('replaceEnum() - enum replacement:', () => {
  it('should pass correct queries to queryInterface', async () => {
    const queryInterface = queryInterfaceMock();
    await replaceEnum({
      queryInterface,
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1'
    });

    assert.deepEqual(queryInterface.getQueries().map((q) => removeWhiteSpace(q.sql)), [
      `CREATE TYPE "enum1_new" AS ENUM (\'A\', \'B\', \'C\')`,
      `ALTER TABLE "table1" ALTER COLUMN "column1" DROP DEFAULT`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1_new" USING ("column1"::text::"enum1_new") `,
      `DROP TYPE "enum1"`,
      `ALTER TYPE "enum1_new" RENAME TO "enum1"`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" SET DEFAULT 'A'::"enum1" `,
    ]);
  });

  it('should pass correct queries to queryInterface when not using a default value', async () => {
    const queryInterface = queryInterfaceMock();
    await replaceEnum({
      queryInterface,
      tableName: 'table1',
      columnName: 'column1',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1'
    });

    assert.deepEqual(queryInterface.getQueries().map((q) => removeWhiteSpace(q.sql)), [
      `CREATE TYPE "enum1_new" AS ENUM (\'A\', \'B\', \'C\')`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1_new" USING ("column1"::text::"enum1_new") `,
      `DROP TYPE "enum1"`,
      `ALTER TYPE "enum1_new" RENAME TO "enum1"`
    ]);
  });

  it('should pass correct options - transaction', async () => {
    const queryInterface = queryInterfaceMock();
    await replaceEnum({
      queryInterface,
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1'
    });

    const queries = queryInterface.getQueries();
    assert.equal(queries.length, 6, 'should create 6 queries');
    for (const query of queries) {
      assert.deepEqual(query.options, { transaction: { mockTransaction: true } });
    }
  });
});

function queryInterfaceMock() {
  const queries = [];

  return {
    sequelize: {
      query(sql, options) {
        queries.push({ sql, options });
        return Promise.resolve();
      },
      async transaction(callback) {
        await callback({ mockTransaction: true });
        return Promise.resolve();
      }
    },
    getQueries() {
      return queries;
    }
  };
}
