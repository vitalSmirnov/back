module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["<rootDir>/src/**/?(*.)+(spec|test).ts", "<rootDir>/src/**/tests/**/*.test.ts"],
}
