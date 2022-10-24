import { QueryInterface, QueryOptions, TransactionOptions } from 'sequelize'
import * as helpers from './helpers'

/**
 * Since PostgreSQL still does not support remove values from an ENUM,
 * the workaround is to create a new ENUM with the new values and use it
 * to replace the other.
 */
export const replaceEnum =
  (queryInterface: QueryInterface) =>
  async (args: {
    tableName: string
    columnName: string
    enumName?: string | null
    newValues: string[]
    defaultValue?: string | null
    transactionOptions?: TransactionOptions | null
    queryOptions?: QueryOptions | null
  }): Promise<void> => {
    const { sequelize } = queryInterface

    const { tableName, columnName, newValues, defaultValue = null } = args

    const enumName = args.enumName ?? `enum_${tableName}_${columnName}`
    const transactionOptions: TransactionOptions = args.transactionOptions ?? {}
    const _queryOptions: QueryOptions = args.queryOptions ?? {}

    const newEnumName = `${enumName}_new`

    await sequelize.transaction(transactionOptions, async (t) => {
      const queryOptions: QueryOptions = {
        ..._queryOptions,
        transaction: t,
      }

      await helpers.createEnum(queryInterface)({
        name: newEnumName,
        values: newValues,
        queryOptions: queryOptions,
      })

      if (defaultValue != null) {
        await helpers.unsetDefaultValueFromEnum(queryInterface)({
          tableName,
          columnName,
          queryOptions: queryOptions,
        })
      }

      await helpers.setColumnTypeToEnum(queryInterface)({
        tableName,
        columnName,
        enumName: newEnumName,
        queryOptions: queryOptions,
      })

      await helpers.dropEnum(queryInterface)({
        name: enumName,
        queryOptions: queryOptions,
      })

      await helpers.renameEnum(queryInterface)({
        oldEnumName: newEnumName,
        newEnumName: enumName,
        queryOptions: queryOptions,
      })

      if (defaultValue != null) {
        await helpers.setColumnDefault(queryInterface)({
          tableName,
          columnName,
          defaultValue,
          defaultValueType: enumName,
          queryOptions: queryOptions,
        })
      }
    })
  }

export default replaceEnum
