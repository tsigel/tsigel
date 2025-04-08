module.exports = {
    "preset": "ts-jest",
    "collectCoverage": true,
    "coverageDirectory": "./coverage",
    "coverageReporters": [
        "html",
        "text",
        "lcov"
    ],
    "testEnvironment": "node",
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
    ],
    "transformIgnorePatterns": [
        "/node_modules/"
    ]
};
