export default {
  testMatch: [
    "**/*.test.+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testEnvironment: "node",
  globals: {
    __TEST_DB_URL__: process.env.TEST_DB_URL || "postgres://localhost:5432/mydb",
  },
};
