// Using native fetch in Node 22+

async function testPagination() {
    try {
        console.log('Testing Page 1...');
        const res1 = await fetch('http://localhost:3001/api/agrupaciones?page=1&limit=5');
        const data1 = await res1.json();

        console.log('Page 1 Status:', res1.status);
        console.log('Page 1 Data Length:', data1.data ? data1.data.length : 'undefined');
        console.log('Page 1 Pagination:', data1.pagination);

        if (!data1.data || data1.data.length !== 5) {
            throw new Error('Page 1 failed: Expected 5 items');
        }

        console.log('\nTesting Page 2...');
        const res2 = await fetch('http://localhost:3001/api/agrupaciones?page=2&limit=5');
        const data2 = await res2.json();

        console.log('Page 2 Status:', res2.status);
        console.log('Page 2 Data Length:', data2.data ? data2.data.length : 'undefined');
        console.log('Page 2 Pagination:', data2.pagination);

        if (!data2.data || data2.data.length !== 5) {
            throw new Error('Page 2 failed: Expected 5 items');
        }

        // Check if items are different
        if (data1.data[0]._id === data2.data[0]._id) {
            throw new Error('Pagination failed: Page 1 and Page 2 have same first item');
        }

        console.log('\n✅ Pagination API works correctly!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        process.exit(1);
    }
}

testPagination();
