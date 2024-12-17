import { DEFAULT_QUERY_PAGINATION_LIMIT } from '../../constant';
import { PageCursorEncoder, PaginationQuery } from '../../type/pagination.type';
import { getPaginatedResult, getPaginationQuery } from '../../util/pagination.util';

describe('Pagination System', () => {
  const generateMockData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      id: `id${String(i + 1).padStart(3, '0')}`,
      createdAt: new Date(2024, 0, i + 1),
      name: `Item ${i + 1}`
    }));

  const mockData = generateMockData(50);

  describe('getPaginationQuery', () => {
    describe('Forward Pagination', () => {
      it('returns default query parameters', () => {
        const query = getPaginationQuery({});
        expect(query).toEqual({
         orderBy: undefined,
         take: DEFAULT_QUERY_PAGINATION_LIMIT,
         skip: undefined,
         cursor: undefined
        });
      });

      it('applies custom limit', () => {
        const options = PaginationQuery.parse({
          limit: 10,
          direction: 'next'
        });
        
        const query = getPaginationQuery({ options });
        expect(query).toEqual({
          take: 10,
          orderBy: undefined,
          cursor: undefined,
          skip: undefined
        });
      });

      it('handles ascending sort order', () => {
        const options = PaginationQuery.parse({
          sortOrder: 'asc',
          direction: 'next'
        });
        
        const query = getPaginationQuery({ options });
        expect(query).toEqual({
          take: 25,
          orderBy: undefined,
          sortOrder: 'asc',
          cursor: undefined,
          skip: undefined
        });
      });
    });

    describe('Backward Pagination', () => {
      it('handles prev direction with cursor', () => {
        const cursor = PageCursorEncoder.parse({
          id: 'id010',
          createdAt: new Date('2024-01-10')
        });
        
        const options = PaginationQuery.parse({
          cursor,
          direction: 'prev'
        });
        
        const query = getPaginationQuery({ options });
        expect(query).toEqual({
          take: -25,
          cursor: {
            id: 'id010',
            createdAt: new Date('2024-01-10')
          },
          skip: 1,
          orderBy: undefined,
        });
      });
    });
  });

  describe('getPaginatedResult', () => {
    describe('Edge Cases', () => {
      it('returns empty result for no items', () => {
        const result = getPaginatedResult({ items: [] });
        expect(result).toEqual({
          data: [],
          page: { next: null }
        });
      });

      it('returns cursor to item when take === 1', () => {
        const result = getPaginatedResult({ 
          items: [mockData[0]], 
          pagination: { take: 1 } 
        });
        expect(result).toEqual({
          data: [{ ...mockData[0] }],
          page: { next: PageCursorEncoder.parse({
            id: mockData[0].id,
            createdAt: mockData[0].createdAt
          })}
        });
      });

      it('handles items with same timestamp', () => {
        const sameTimeItems = [
          { id: 'id001', createdAt: new Date('2024-01-01T00:00:00Z'), name: 'A' },
          { id: 'id002', createdAt: new Date('2024-01-01T00:00:00Z'), name: 'B' },
          { id: 'id003', createdAt: new Date('2024-01-01T00:00:00Z'), name: 'C' }
        ];

        const result = getPaginatedResult({ 
          items: sameTimeItems, 
          pagination: { take: 3 } 
        });
        
        expect(result.data).toHaveLength(2);
        expect(result.page?.next).not.toBeNull();
      });
    });

    describe('Forward Pagination', () => {
      it('generates cursor when more items exist', () => {
        const items = mockData.slice(0, 11);
        const result = getPaginatedResult({ 
          items, 
          pagination: { take: 11 } 
        });
        
        expect(result.data).toHaveLength(10);
        expect(result.page?.next).not.toBeNull();
        
        const decodedCursor = Buffer.from(result.page!.next!, 'base64').toString();
        const [timestamp] = decodedCursor.split('|');
        expect(new Date(timestamp)).toEqual(items[9].createdAt);
      });
    });

    describe('Backward Pagination', () => {
      it('paginates through dataset backwards', () => {
        const cursor = PageCursorEncoder.parse({
          id: 'id025',
          createdAt: new Date('2024-01-25')
        });
        
        const options = PaginationQuery.parse({
          cursor,
          direction: 'prev',
          limit: 10
        });
        
        const query = getPaginationQuery({ options });
        const items = mockData.slice(10, 20).reverse(); // Important: reverse items for prev direction
        
        const result = getPaginatedResult({ 
          items, 
          pagination: query
        });
        
        expect(result.data).toHaveLength(9);
        expect(result.page?.next).not.toBeNull();
      });

      it('handles first page in prev direction', () => {
        const cursor = PageCursorEncoder.parse({
          id: 'id010',
          createdAt: new Date('2024-01-10')
        });
        
        const options = PaginationQuery.parse({
          cursor,
          direction: 'prev'
        });
        
        const query = getPaginationQuery({ options });
        const items = mockData.slice(0, 9).reverse(); // Important: reverse for prev direction
        
        const result = getPaginatedResult({ 
          items, 
          pagination: { ...query, take: Math.abs(query.take!) }
        });
        
        expect(result.data).toHaveLength(9);
        expect(result.page?.next).toBeNull();
      });
    });

    describe('Bidirectional Navigation', () => {
      it('allows switching between next and prev direction', () => {
        // Forward pagination
        let options = PaginationQuery.parse({
          limit: 10,
          direction: 'next'
        });
        
        let query = getPaginationQuery({ options });
        let items = mockData.slice(0, 10);
        let result = getPaginatedResult({ items, pagination: query });
        
        expect(result.data).toHaveLength(9);
        expect(result.page?.next).not.toBeNull();
        
        // Backward pagination from last item
        const cursor = result.page!.next!;
        options = PaginationQuery.parse({
          cursor,
          limit: 5,
          direction: 'prev'
        });
        
        query = getPaginationQuery({ options });
        items = mockData.slice(0, 5).reverse();
        result = getPaginatedResult({
          items, 
          pagination: { ...query, take: Math.abs(query.take!) }
        });
        
        expect(result.data).toHaveLength(4);
        expect(result.page?.next).not.toBeNull();
      });
    });

    it('generates correct cursor for both directions', () => {
     const items = generateMockData(4);

     // Forward pagination
     const forwardResult = getPaginatedResult({
       items,
       pagination: { take: 4 }
     });

     const forwardCursor = Buffer.from(forwardResult.page!.next!, 'base64').toString();
     const [forwardTimestamp, forwardId] = forwardCursor.split('|');
     expect(forwardId).toBe('id003');
     expect(new Date(forwardTimestamp)).toEqual(items[2].createdAt);

     // Backward pagination
     const backwardResult = getPaginatedResult({
       items: [...items].reverse(),
       pagination: { take: -4 }
     });

     const backwardCursor = Buffer.from(backwardResult.page!.next!, 'base64').toString();
     const [backwardTimestamp, backwardId] = backwardCursor.split('|');
     expect(backwardId).toBe('id002');
     expect(new Date(backwardTimestamp)).toEqual(items[1].createdAt);
   });
  });
});