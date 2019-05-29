'use strict';

import sinon from 'sinon';
import { removeWhiteSpace } from './utils/testUtils';
import replaceEnum from '../src/index';

describe('replaceEnum() - enum replacement:', () => {
  it('should run all queries within a transaction', async () => {
    const queryInterface = queryInterfaceMock();

    const transactionSpy = sinon.spy(queryInterface.sequelize, 'transaction');

    await replaceEnum({
      queryInterface,
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1'
    });

    expect(transactionSpy.calledOnce).to.be.true;
  });

  it('should run all queries within a sub-transaction', async () => {
    const queryInterface = queryInterfaceMock();

    const transactionSpy = sinon.spy(queryInterface.sequelize, 'transaction');

    await replaceEnum({
      queryInterface,
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
      sequelizeOptions: { transaction: { mockParentTransaction: true } }
    });

    expect(transactionSpy.calledOnceWith(
      sinon.match({ transaction: { mockParentTransaction: true } }),
      sinon.match.func
    )).to.be.true;
  });

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

    expect(
      queryInterface.getQueries().map((q) => removeWhiteSpace(q.sql))
    ).to.deep.equal([
      `CREATE TYPE "enum1_new" AS ENUM (\'A\', \'B\', \'C\')`,
      `ALTER TABLE "table1" ALTER COLUMN "column1" DROP DEFAULT`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1_new"` +
      ` USING ("column1"::text::"enum1_new") `,
      `DROP TYPE "enum1"`,
      `ALTER TYPE "enum1_new" RENAME TO "enum1"`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1"` +
      ` SET DEFAULT 'A'::"enum1" `
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

    expect(
      queryInterface.getQueries().map((q) => removeWhiteSpace(q.sql))
    ).to.deep.equal([
      `CREATE TYPE "enum1_new" AS ENUM (\'A\', \'B\', \'C\')`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1_new"` +
        ` USING ("column1"::text::"enum1_new") `,
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

    expect(queries).to.have.length(6, 'should create 6 queries');

    queries.forEach((query) => {
      expect(query.options).to.deep.equal({
        transaction: {
          mockTransaction: true,
          sequelizeOptions: {}
        }
      });
    });
  });

  it('should pass correct options - transaction and subtransaction', async () => {
    const queryInterface = queryInterfaceMock();
    await replaceEnum({
      queryInterface,
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
      sequelizeOptions: { transaction: { mockParentTransaction: true } }
    });

    const queries = queryInterface.getQueries();

    expect(queries).to.have.length(6, 'should create 6 queries');

    queries.forEach((query) => {
      expect(query.options).to.deep.equal({
        transaction: {
          mockTransaction: true,
          sequelizeOptions: { transaction: { mockParentTransaction: true } }
        }
      });
    });
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
      async transaction(...args) {
        const sequelizeOptions = (args.length > 1) ? args[0] : null;
        const callback = args.length ? args[args.length - 1] : null;

        await callback({ mockTransaction: true, sequelizeOptions });
        return Promise.resolve();
      }
    },
    getQueries() {
      return queries;
    }
  };
}
