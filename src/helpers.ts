import { QueryInterface, QueryOptions } from 'sequelize'
import * as queries from './queries'

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
      queries.createEnum(args.name, args.values),
      args.queryOptions ?? undefined,
    )
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
      queries.removeDefaultFromColumn(args.tableName, args.columnName),
      args.queryOptions ?? undefined,
    )
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
      queries.setEnumType(args.tableName, args.columnName, args.enumName),
      args.queryOptions,
    )
  }

/**
 * Drop an Enum.
 */
export const dropEnum =
  (queryInterface: QueryInterface) =>
  async (args: { name: string; queryOptions: QueryOptions }) => {
    const { sequelize } = queryInterface
    return sequelize.query(queries.dropEnum(args.name), args.queryOptions)
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
      queries.renameEnum(args.oldEnumName, args.newEnumName),
      args.queryOptions,
    )
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
      queries.setColumnDefault(
        args.tableName,
        args.columnName,
        args.defaultValue,
        args.defaultValueType,
      ),
      args.queryOptions,
    )
  }
