import assert from 'assert';
import { removeWhiteSpace } from './utils/testUtils';
import {
  getQueryToCreateEnum,
  getQueryToDropEnum,
  getQueryToRemoveDefaultFromColumn,
  getQueryToRenameEnum,
  getQueryToSetEnumType,
  getQueryToSetColumnDefault
} from '../src/index';

describe('queries:', () => {
  it('getQueryToCreateEnum()', () => {
    const sql = getQueryToCreateEnum('enum1', ['A', 'B']);

    assert.equal(sql, `CREATE TYPE "enum1" AS ENUM ('A', 'B')`);
  });

  it('getQueryToDropEnum()', () => {
    const sql = getQueryToDropEnum('enum1');
    assert.equal(sql, `DROP TYPE "enum1"`);
  });

  it('getQueryToRemoveDefaultFromColumn()', () => {
    const sql = getQueryToRemoveDefaultFromColumn('enum1', 'column1');
    assert.equal(
      sql,
      `ALTER TABLE "enum1" ALTER COLUMN "column1" DROP DEFAULT`
    );
  });

  it('getQueryToRenameEnum()', () => {
    const sql = getQueryToRenameEnum('enum1', 'enumNew1');
    assert.equal(sql, `ALTER TYPE "enum1" RENAME TO "enumNew1"`);
  });

  it('getQueryToSetEnumType()', () => {
    const sql =
      removeWhiteSpace(getQueryToSetEnumType('table1', 'column1', 'enum1'));

    assert.equal(
      sql,
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1"` +
        ` USING ("column1"::text::"enum1") `
    );
  });

  it('getQueryToSetColumnDefault()', () => {
    const sql = removeWhiteSpace(
      getQueryToSetColumnDefault('table1', 'column1', 'defaultVal1', 'STRING')
    );

    assert.equal(
      sql,
      ` ALTER TABLE "table1" ALTER COLUMN "column1"` +
        ` SET DEFAULT 'defaultVal1'::"STRING" `
    );
  });
});
