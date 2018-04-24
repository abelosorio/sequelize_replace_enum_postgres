# Replace ENUM PostgreSQL

[![Build Status](https://travis-ci.org/abelosorio/sequelize_replace_enum_postgres.svg?branch=master)](https://travis-ci.org/abelosorio/sequelize_replace_enum_postgres) [![NPM version](https://img.shields.io/npm/v/sequelize-replace-enum-postgres.svg)](https://www.npmjs.com/package/sequelize-replace-enum-postgres)

This package provides the methods needed to replace a **PostgreSQL** ENUM in **Sequelize** migrations.

## Install

```
npm install --save sequelize-replace-enum-postgres
```

## How to use

In this migration we are adding the `on-demand` value to the `recurrenceType` field of `eventRecurrence`:

```
'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

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

  * https://github.com/abelosorio/sequelize_replace_enum_postgres/issues
