import { describe, expect, it } from '@jest/globals'
import { PaginationOptions } from '../../type/pagination.type'
import { getPaginatedResult, getPaginationQuery } from '../../util/pagination.util'

describe('Pagination Utilities', () => {
  // Sample data for testing
  const testData = [
    { id: '1', createdAt: new Date('2024-01-01'), name: 'Item 1' },
    { id: '2', createdAt: new Date('2024-01-02'), name: 'Item 2' },
    { id: '3', createdAt: new Date('2024-01-03'), name: 'Item 3' },
    { id: '4', createdAt: new Date('2024-01-04'), name: 'Item 4' },
    { id: '5', createdAt: new Date('2024-01-05'), name: 'Item 5' }
  ]

  describe('getPaginatedResult', () => {
    it('returns correct number of items with take parameter', () => {
      const result = getPaginatedResult({
        items: testData.slice(0, 3),
        options: getPaginationQuery({
          options: PaginationOptions.parse({ limit: 2 }),
          cursorOrderColumns: ['createdAt']
        })
      })
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual(testData[0])
      expect(result.data[1]).toEqual(testData[1])
      expect(result.page?.next).toBeDefined()
    })

    it('returns null next cursor on last page', () => {
      const result = getPaginatedResult({
        items: testData,
        options: getPaginationQuery({
          options: PaginationOptions.parse({ limit: 10 }),
          cursorOrderColumns: ['createdAt']
        })
      })
      expect(result.data).toHaveLength(5)
      expect(result.page?.next).toEqual(null)
    })

    it('works with cursor-based pagination', () => {
      // First page
      const firstPage = getPaginatedResult({
        items: testData.slice(0, 3),
        options: getPaginationQuery({
          options: PaginationOptions.parse({ limit: 2 }),
          cursorOrderColumns: ['createdAt']
        })
      })
      expect(firstPage.data).toHaveLength(2)
      expect(firstPage.page?.next).toBeDefined()

      // Second page using cursor
      const secondPage = getPaginatedResult({
        items: testData.slice(2),
        options: getPaginationQuery({
          options: PaginationOptions.parse({ limit: 2, cursor: firstPage.page?.next }),
          cursorOrderColumns: ['createdAt']
        })
      })

      expect(secondPage.data).toHaveLength(2)
      expect(secondPage.data[0]).toEqual(testData[2])
    })
  })

  describe('getPaginationQuery', () => {
    it('handles empty options', () => {
      const query = getPaginationQuery({ cursorOrderColumns: [] })
      expect(query.take).toBeUndefined()
      expect(query.skip).toBeUndefined()
      expect(query.cursor).toBeUndefined()
    })

    it('defaults lets you orderBy createdAt', () => {
      const query = getPaginationQuery({
        options: PaginationOptions.parse({ limit: 10, orderBy: 'createdAt' }),
        cursorOrderColumns: ['createdAt']
      })
      expect(query.orderBy).toEqual({ createdAt: 'asc' })
    })

    it('lets you provide custom orderByFields', () => {
      const query = getPaginationQuery({
        options: PaginationOptions.parse({ limit: 10, orderBy: 'name' }),
        cursorOrderColumns: ['name']
      })
      expect(query.orderBy).toEqual({ name: 'asc' })
    })

    it('throws error for invalid orderByFields', () => {
      expect(() =>
        getPaginationQuery({
          options: PaginationOptions.parse({ limit: 10, orderBy: 'name' }),
          cursorOrderColumns: ['createdAt']
        })
      ).toThrow()
    })

    it('adds extra record for cursor calculation', () => {
      const query = getPaginationQuery({
        options: PaginationOptions.parse({ limit: 10 }),
        cursorOrderColumns: ['createdAt']
      })
      expect(query.take).toBe(11)
    })
  })
})
