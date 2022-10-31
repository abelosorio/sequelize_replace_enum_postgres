import sinon from 'sinon'
import { removeWhiteSpace } from './_test-utils'
import replaceEnum from '../src/index'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import sequelize, {
  QueryInterface,
  QueryOptions,
  Sequelize,
  Transaction,
  TransactionOptions,
} from 'sequelize'

describe('replaceEnum() - enum replacement:', () => {
  it('should run all queries within a transaction', async () => {
    const queryInterface = queryInterfaceMock()

    const transactionSpy = sinon.spy(queryInterface.sequelize, 'transaction')

    await replaceEnum(queryInterface)({
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
    })

    expect(transactionSpy.calledOnce).to.be.true
  })

  it('should run all queries within a sub-transaction', async () => {
    const queryInterface = queryInterfaceMock()
    const parentTransaction = parentTransactionMock()

    const transactionSpy = sinon.spy(queryInterface.sequelize, 'transaction')

    await replaceEnum(queryInterface)({
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
      transactionOptions: { transaction: parentTransaction },
    })

    expect(
      transactionSpy.calledOnceWith(
        sinon.match({ transaction: parentTransaction }),
        sinon.match.func,
      ),
    ).to.be.true
  })

  it('should pass correct queries to queryInterface', async () => {
    const queryInterface = queryInterfaceMock()

    await replaceEnum(queryInterface)({
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
    })

    expect(
      queryInterface.getQueries().map((q) => removeWhiteSpace(q.sql)),
    ).to.deep.equal([
      `CREATE TYPE "enum1_new" AS ENUM (\'A\', \'B\', \'C\')`,
      `ALTER TABLE "table1" ALTER COLUMN "column1" DROP DEFAULT`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1_new"` +
        ` USING ("column1"::text::"enum1_new") `,
      `DROP TYPE "enum1"`,
      `ALTER TYPE "enum1_new" RENAME TO "enum1"`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1"` +
        ` SET DEFAULT 'A'::"enum1" `,
    ])
  })

  it('should pass correct queries to queryInterface when not using a default value', async () => {
    const queryInterface = queryInterfaceMock()
    await replaceEnum(queryInterface)({
      tableName: 'table1',
      columnName: 'column1',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
    })

    expect(
      queryInterface.getQueries().map((q) => removeWhiteSpace(q.sql)),
    ).to.deep.equal([
      `CREATE TYPE "enum1_new" AS ENUM (\'A\', \'B\', \'C\')`,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1_new"` +
        ` USING ("column1"::text::"enum1_new") `,
      `DROP TYPE "enum1"`,
      `ALTER TYPE "enum1_new" RENAME TO "enum1"`,
    ])
  })

  it('should pass correct options - transaction', async () => {
    const queryInterface = queryInterfaceMock()
    await replaceEnum(queryInterface)({
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
    })

    const queries = queryInterface.getQueries()

    expect(queries).to.have.length(6, 'should create 6 queries')

    queries.forEach((query) => {
      expect(query.options).to.deep.equal({
        transaction: {
          mockTransaction: true,
          transactionOptions: {},
        },
      })
    })
  })

  it('should pass correct options - transaction and subtransaction', async () => {
    const queryInterface = queryInterfaceMock()
    const parentTransaction = parentTransactionMock()

    await replaceEnum(queryInterface)({
      tableName: 'table1',
      columnName: 'column1',
      defaultValue: 'A',
      newValues: ['A', 'B', 'C'],
      enumName: 'enum1',
      transactionOptions: { transaction: parentTransaction },
    })

    const queries = queryInterface.getQueries()

    expect(queries).to.have.length(6, 'should create 6 queries')

    queries.forEach((query) => {
      expect(query.options).to.deep.equal({
        transaction: {
          mockTransaction: true,
          transactionOptions: { transaction: parentTransaction },
        },
      })
    })
  })
})

type MockedSequelize = Sequelize & {
  transaction: (
    options: TransactionOptions,
    callback: (t: sequelize.Transaction) => PromiseLike<MockedTransaction>,
  ) => PromiseLike<MockedTransaction>
}

type MockedQueryInterface = QueryInterface & {
  getQueries: () => QueryDescriptor[]
  sequelize: MockedSequelize
}

type QueryDescriptor = { sql: string; options: QueryOptions }

const queryInterfaceMock = (): MockedQueryInterface => {
  const queries: QueryDescriptor[] = []
  return {
    sequelize: {
      async query(sql: string, options: QueryOptions) {
        queries.push({ sql, options })
        return Promise.resolve()
      },
      async transaction(
        options: TransactionOptions,
        callback: (t: sequelize.Transaction) => PromiseLike<MockedTransaction>,
      ) {
        const mockedTransaction = transactionMock(options)
        await callback(mockedTransaction)
        return Promise.resolve()
      },
    },
    getQueries() {
      return queries
    },
  } as MockedQueryInterface
}

type MockedParentTransaction = Transaction & {
  mockParentTransaction: true
}

type MockedTransaction = Transaction & {
  mockTransaction: true
  transactionOptions: TransactionOptions
}

const parentTransactionMock = (): MockedParentTransaction =>
  ({
    mockParentTransaction: true,
  } as unknown as MockedParentTransaction)

const transactionMock = (options: TransactionOptions): MockedTransaction =>
  ({
    mockTransaction: true,
    transactionOptions: options,
  } as unknown as MockedTransaction)
