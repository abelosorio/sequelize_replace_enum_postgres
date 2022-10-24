/**
 * Returns the query to create an Enum.
 */
export const createEnum = (name: string, values: string[]) => {
  return `CREATE TYPE "${name}" AS ENUM ('${values.join("', '")}')`
}

/**
 * Get the query to drop default value for a column.
 */
export const removeDefaultFromColumn = (
  tableName: string,
  columnName: string,
) => {
  return `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT`
}

/**
 * Get the query to set a column type to an Enum.
 */
export const setEnumType = (
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
 * Get the query to drop an Enum.
 */
export function dropEnum(name: string) {
  return `DROP TYPE "${name}"`
}

/**
 * Get the query to rename an enum.
 */
export const renameEnum = (oldEnumName: string, newEnumName: string) => {
  return `ALTER TYPE "${oldEnumName}" RENAME TO "${newEnumName}"`
}

/**
 * Get the query to set the default value for a column.
 */
export const setColumnDefault = (
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
