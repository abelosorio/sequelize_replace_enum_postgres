# Replace ENUM PostgreSQL

This package provides the methods needed to replace a **PostgreSQL** ENUM in **Sequelize** migrations.

## Install

```bash
npm install --save sequelize-replace-enum-postgres
#OR
yarn add sequelize-replace-enum-postgres
```

## How to use

### Basic

In this migration we are adding the `on-demand` value to the `recurrenceType` field of `eventRecurrence`:

```js
const replaceEnum = require('sequelize-replace-enum-postgres')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum(queryInterface)({
      tableName: 'eventRecurrence',
      columnName: 'recurrenceType',
      defaultValue: 'weekly',
      newValues: ['weekly', 'monthly', 'yearly', 'on-demand'],
      enumName: 'enum_event_recurrence_recurrence_type',
    })
  },

  down: (queryInterface, Sequelize) => {
    return replaceEnum(queryInterface)({
      tableName: 'eventRecurrence',
      columnName: 'recurrenceType',
      defaultValue: 'weekly',
      newValues: ['weekly', 'monthly', 'yearly'],
      enumName: 'enum_event_recurrence_recurrence_type',
    })
  }
}
```

### Advanced

#### Typescript

The library is build, has full and first class typescript support.

```ts
import { QueryInterface, Sequelize } from 'sequelize'
import replaceEnum from 'sequelize-replace-enum-postgres'

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof Sequelize) => {
    return replaceEnum(queryInterface)({
      tableName: 'event_recurrence',
      columnName: 'recurrence_type',
      defaultValue: 'weekly',
      newValues: ['weekly', 'monthly', 'yearly', 'on-demand'],
      enumName: 'enum_event_recurrence_recurrence_type',
    })
  },

  down: (queryInterface: QueryInterface, Sequelize: typeof Sequelize) => {
    return replaceEnum(queryInterface)({
      tableName: 'event_recurrence',
      columnName: 'recurrence_type',
      defaultValue: 'weekly',
      newValues: ['weekly', 'monthly', 'yearly'],
      enumName: 'enum_event_recurrence_recurrence_type',
    })
  }
}
```

#### Transactions

By default, `replaceEnum` will create a transaction for you (it actually runs several queries, and does it safely within a transaction).

However — for example when writing migrations — you might already have a transaction instance. In such a case, you can pass it to `transactionOptions` and the function will create a nested sub-transaction, allowing it to fail gracefully ! You can also pass any other option inside id, it will be passed down to the created sub-transaction.

```ts
await queryInterface.sequelize.transaction(async t => {
  // If it fails, the enclosing
  // transaction (t) will waterfally fail 
  await replaceEnum({
    tableName: 'event_recurrence',
    columnName: 'recurrence_type',
    defaultValue: 'weekly',
    newValues: ['weekly', 'monthly', 'yearly', 'on-demand'],
    enumName: 'enum_event_recurrence_recurrence_type',
    transactionOptions: { transaction: t } // Transaction is passed here
  })

  await sqlQueryInterface.bulkUpdate(
    'event_recurrence',
    { /* some update... */ },
    { /* some select... */ },
    { transaction: t }, // Use same transaction
  )
})
```

#### Options

You can pass any options you'd like to subqueries, with `queryOptions` argument. They will be passed to to all subqueries.

```ts
await queryInterface.sequelize.transaction(async t => {
  // If it fails, the enclosing
  // transaction (t) will waterfally fail 
  await replaceEnum({
    tableName: 'event_recurrence',
    columnName: 'recurrence_type',
    defaultValue: 'weekly',
    newValues: ['weekly', 'monthly', 'yearly', 'on-demand'],
    enumName: 'enum_event_recurrence_recurrence_type',
    queryOptions: { logging: true } // Pass some query options
  })
})
```

> ⚠️ Don't try to pass a transaction inside `queryOptions`, as it would be overwritten by the underlying generated transaction. The recommended way to run `replaceEnum` within a transaction is passing a transaction instance to `transactionOptions`

## Maintainers

  * **[Abel M. Osorio](https://github.com/abelosorio)**
  * **[Cyril CHAPON](https://github.com/cyrilchapon)**

## Issues

  * https://github.com/abelosorio/sequelize_replace_enum_postgres/issues
