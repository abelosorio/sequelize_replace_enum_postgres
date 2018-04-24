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
    expect(getQueryToCreateEnum('enum1', ['A', 'B']))
      .to.equal(`CREATE TYPE "enum1" AS ENUM ('A', 'B')`);
  });

  it('getQueryToDropEnum()', () => {
    expect(getQueryToDropEnum('enum1')).to.equal(`DROP TYPE "enum1"`);
  });

  it('getQueryToRemoveDefaultFromColumn()', () => {
    expect(getQueryToRemoveDefaultFromColumn('enum1', 'column1'))
      .to.equal(`ALTER TABLE "enum1" ALTER COLUMN "column1" DROP DEFAULT`);
  });

  it('getQueryToRenameEnum()', () => {
    expect(getQueryToRenameEnum('enum1', 'enumNew1'))
      .to.equal(`ALTER TYPE "enum1" RENAME TO "enumNew1"`);
  });

  it('getQueryToSetEnumType()', () => {
    expect(
      removeWhiteSpace(getQueryToSetEnumType('table1', 'column1', 'enum1'))
    ).to.equal(
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1"` +
        ` USING ("column1"::text::"enum1") `
    );
  });

  it('getQueryToSetColumnDefault()', () => {
    expect(removeWhiteSpace(
      getQueryToSetColumnDefault('table1', 'column1', 'defaultVal1', 'STRING')
    )).to.equal(
      ` ALTER TABLE "table1" ALTER COLUMN "column1"` +
        ` SET DEFAULT 'defaultVal1'::"STRING" `
    );
  });
});
