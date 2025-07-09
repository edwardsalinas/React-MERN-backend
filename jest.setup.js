// Set NODE_ENV to test to prevent database connections and server startup
process.env.NODE_ENV = 'test';

// Set default environment variables for tests
process.env.PORT = process.env.PORT || 3001;
process.env.SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || 'test-secret-seed';
process.env.DB_CNN = process.env.DB_CNN || 'mongodb://localhost:27017/test_db';
