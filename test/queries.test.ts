import { removeWhiteSpace } from './_test-utils'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  createEnum,
  dropEnum,
  removeDefaultFromColumn,
  renameEnum,
  setEnumType,
  setColumnDefault,
} from '../src/queries'

describe('queries:', () => {
  it('createEnum()', () => {
    expect(createEnum('enum1', ['A', 'B'])).to.equal(
      `CREATE TYPE "enum1" AS ENUM ('A', 'B')`,
    )
  })

  it('dropEnum()', () => {
    expect(dropEnum('enum1')).to.equal(`DROP TYPE "enum1"`)
  })

  it('removeDefaultFromColumn()', () => {
    expect(removeDefaultFromColumn('enum1', 'column1')).to.equal(
      `ALTER TABLE "enum1" ALTER COLUMN "column1" DROP DEFAULT`,
    )
  })

  it('renameEnum()', () => {
    expect(renameEnum('enum1', 'enumNew1')).to.equal(
      `ALTER TYPE "enum1" RENAME TO "enumNew1"`,
    )
  })

  it('setEnumType()', () => {
    expect(
      removeWhiteSpace(setEnumType('table1', 'column1', 'enum1')),
    ).to.equal(
      ` ALTER TABLE "table1" ALTER COLUMN "column1" TYPE "enum1"` +
        ` USING ("column1"::text::"enum1") `,
    )
  })

  it('setColumnDefault()', () => {
    expect(
      removeWhiteSpace(
        setColumnDefault('table1', 'column1', 'defaultVal1', 'STRING'),
      ),
    ).to.equal(
      ` ALTER TABLE "table1" ALTER COLUMN "column1"` +
        ` SET DEFAULT 'defaultVal1'::"STRING" `,
    )
  })
})
