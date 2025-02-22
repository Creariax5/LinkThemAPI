const pool = require('../../db');

const testApi = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
    });
};

const testDbConnection = async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Try to execute a simple query
        const result = await client.query('SELECT NOW()');
        
        res.status(200).json({
            status: 'success',
            message: 'Database connection successful',
            timestamp: result.rows[0].now,
            database: {
                host: process.env.DATABASE_URL ? 'Connected via URL' : 'Connected via local config',
                ssl: pool.options.ssl ? 'Enabled' : 'Disabled'
            }
        });

    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });

    } finally {
        client.release();
    }
};

module.exports = {
    testApi,
    testDbConnection
};
