import { QueryInterface, QueryOptions, TransactionOptions } from 'sequelize'

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

      await createEnum(queryInterface)({
        name: newEnumName,
        values: newValues,
        queryOptions: queryOptions,
      })

      if (defaultValue != null) {
        await unsetDefaultValueFromEnum(queryInterface)({
          tableName,
          columnName,
          queryOptions: queryOptions,
        })
      }

      await setColumnTypeToEnum(queryInterface)({
        tableName,
        columnName,
        enumName: newEnumName,
        queryOptions: queryOptions,
      })

      await dropEnum(queryInterface)({
        name: enumName,
        queryOptions: queryOptions,
      })

      await renameEnum(queryInterface)({
        oldEnumName: newEnumName,
        newEnumName: enumName,
        queryOptions: queryOptions,
      })

      if (defaultValue != null) {
        await setColumnDefault(queryInterface)({
          tableName,
          columnName,
          defaultValue,
          defaultValueType: enumName,
          queryOptions: queryOptions,
        })
      }
    })
  }

/**
 * Create a new ENUM.
 */
export const createEnum =
  (queryInterface: QueryInterface) =>
  async (args: {
    name: string
    values: string[]
    queryOptions?: QueryOptions | null
  }) => {
    const { sequelize } = queryInterface

    return sequelize.query(
      getQueryToCreateEnum(args.name, args.values),
      args.queryOptions ?? undefined,
    )
  }

/**
 * Returns the query to create an Enum.
 */
export const getQueryToCreateEnum = (name: string, values: string[]) => {
  return `CREATE TYPE "${name}" AS ENUM ('${values.join("', '")}')`
}

/**
 * Unset default value from ENUM.
 */
export const unsetDefaultValueFromEnum =
  (queryInterface: QueryInterface) =>
  async (args: {
    tableName: string
    columnName: string
    queryOptions?: QueryOptions | null
  }) => {
    const { sequelize } = queryInterface
    return sequelize.query(
      getQueryToRemoveDefaultFromColumn(args.tableName, args.columnName),
      args.queryOptions ?? undefined,
    )
  }

/**
 * Get the query to drop default value for a column.
 */
export const getQueryToRemoveDefaultFromColumn = (
  tableName: string,
  columnName: string,
) => {
  return `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT`
}

/**
 * Set the column type to an Enum.
 */
export const setColumnTypeToEnum =
  (queryInterface: QueryInterface) =>
  async (args: {
    tableName: string
    columnName: string
    enumName: string
    queryOptions: QueryOptions
  }) => {
    const { sequelize } = queryInterface
    return sequelize.query(
      getQueryToSetEnumType(args.tableName, args.columnName, args.enumName),
      args.queryOptions,
    )
  }

/**
 * Get the query to set a column type to an Enum.
 */
export const getQueryToSetEnumType = (
  tableName: string,
  columnName: string,
  enumName: string,
) => {
  return `
    ALTER TABLE "${tableName}"
      ALTER COLUMN "${columnName}"
        TYPE "${enumName}"
        USING ("${columnName}"::text::"${enumName}")
  `
}

/**
 * Drop an Enum.
 */
export const dropEnum =
  (queryInterface: QueryInterface) =>
  async (args: { name: string; queryOptions: QueryOptions }) => {
    const { sequelize } = queryInterface
    return sequelize.query(getQueryToDropEnum(args.name), args.queryOptions)
  }

/**
 * Get the query to drop an Enum.
 */
export function getQueryToDropEnum(name: string) {
  return `DROP TYPE "${name}"`
}

/**
 * Rename an Enum.
 */
export const renameEnum =
  (queryInterface: QueryInterface) =>
  async (args: {
    oldEnumName: string
    newEnumName: string
    queryOptions: QueryOptions
  }) => {
    const { sequelize } = queryInterface
    return sequelize.query(
      getQueryToRenameEnum(args.oldEnumName, args.newEnumName),
      args.queryOptions,
    )
  }

/**
 * Get the query to rename an enum.
 */
export const getQueryToRenameEnum = (
  oldEnumName: string,
  newEnumName: string,
) => {
  return `ALTER TYPE "${oldEnumName}" RENAME TO "${newEnumName}"`
}

/**
 * Set the default value for a column.
 */
export const setColumnDefault =
  (queryInterface: QueryInterface) =>
  async (args: {
    tableName: string
    columnName: string
    defaultValue: string
    defaultValueType: string
    queryOptions: QueryOptions
  }) => {
    const { sequelize } = queryInterface
    return sequelize.query(
      getQueryToSetColumnDefault(
        args.tableName,
        args.columnName,
        args.defaultValue,
        args.defaultValueType,
      ),
      args.queryOptions,
    )
  }

/**
 * Get the query to set the default value for a column.
 */
export const getQueryToSetColumnDefault = (
  tableName: string,
  columnName: string,
  defaultValue: string,
  defaultValueType: string,
) => {
  return `
    ALTER TABLE "${tableName}"
      ALTER COLUMN "${columnName}"
        SET DEFAULT '${defaultValue}'::"${defaultValueType}"
  `
}

export default replaceEnum
