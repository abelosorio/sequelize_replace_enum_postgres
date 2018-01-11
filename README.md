# Replace ENUM PostgreSQL

This package provides the methods needed to replace a **PostgreSQL** ENUM in **Sequelize** migrations.

## Install

```
npm install --save replace-enum-postgresql
```

## How to use

In this migration we are adding the `on-demand` value to the `recurrenceType` field of `eventRecurrence`:

```
'use strict';

const replaceEnum = require('replace-enum-postgresql').default;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'eventRecurrence',
      columnName: 'recurrenceType',
      defaultValue: 'weekly',
      newValues: ['weekly', 'monthly', 'yearly', 'on-demand'],
      enumName: 'enum_event_recurrence_recurrence_type'
    });
  },

  down: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'eventRecurrence',
      columnName: 'recurrenceType',
      defaultValue: 'weekly',
      newValues: ['weekly', 'monthly', 'yearly'],
      enumName: 'enum_event_recurrence_recurrence_type'
    });
  }
};

```

## Mantainers

  * **[Abel M. Osorio](https://github.com/abelosorio)**

## Issues

  * https://github.com/abelosorio/replace_enum_postgresql/issues