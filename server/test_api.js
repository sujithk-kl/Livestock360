
const axios = require('axios');

const testApi = async () => {
    try {
        const city = 'Namakkal';
        const category = 'Curd';
        const url = `http://localhost:4000/api/products?category=${category}&city=${city}`;

        console.log(`Testing URL: ${url}`);

        const response = await axios.get(url);

        console.log('Status:', response.status);
        console.log('Data count:', response.data.count);
        console.log('Products:', response.data.data.map(p => ({
            name: p.productName,
            farmer: p.farmer?.name,
            city: p.farmer?.address?.city
        })));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testApi();
