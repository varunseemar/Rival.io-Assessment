// Ensure a JWT secret exists when tests run without a full .env loaded.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.NODE_ENV = "test";
