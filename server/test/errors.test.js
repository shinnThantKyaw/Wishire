import { describe, it } from "node:test";
import assert from "node:assert/strict";

// RED phase: These imports will fail until we create the error classes
const errors = await import("../lib/errors.js");
const { ValidationError, NotFoundError, DatabaseError, asyncHandler } = errors;

const handlerModule = await import("../middleware/errorHandler.js");
const { errorHandler } = handlerModule;

describe("Error classes", () => {
  it("ValidationError has correct properties", () => {
    const err = new ValidationError("field is required");
    assert.equal(err.name, "ValidationError");
    assert.equal(err.status, 400);
    assert.equal(err.code, "VALIDATION_ERROR");
    assert.equal(err.message, "field is required");
    assert.ok(err instanceof Error);
  });

  it("NotFoundError has correct properties", () => {
    const err = new NotFoundError("Wish not found: abc123");
    assert.equal(err.name, "NotFoundError");
    assert.equal(err.status, 404);
    assert.equal(err.code, "NOT_FOUND");
    assert.equal(err.message, "Wish not found: abc123");
    assert.ok(err instanceof Error);
  });

  it("NotFoundError has default message", () => {
    const err = new NotFoundError();
    assert.equal(err.message, "Resource not found");
  });

  it("DatabaseError has correct properties", () => {
    const err = new DatabaseError("connection failed");
    assert.equal(err.name, "DatabaseError");
    assert.equal(err.status, 500);
    assert.equal(err.code, "DB_ERROR");
    assert.equal(err.message, "connection failed");
    assert.ok(err instanceof Error);
  });
});

describe("asyncHandler", () => {
  it("is a function", () => {
    assert.equal(typeof asyncHandler, "function");
  });

  it("wraps async function and calls next on error", async () => {
    const testError = new ValidationError("test error");
    const fn = async () => {
      throw testError;
    };
    const wrapped = asyncHandler(fn);

    let capturedErr = null;
    const req = {};
    const res = {};
    const next = (err) => {
      capturedErr = err;
    };

    await wrapped(req, res, next);
    assert.equal(capturedErr, testError);
  });

  it("passes through on success", async () => {
    let called = false;
    const fn = async (req, res) => {
      called = true;
      res.json = (data) => data;
    };
    const wrapped = asyncHandler(fn);

    const req = {};
    const res = { json: () => {} };
    const next = () => {};

    await wrapped(req, res, next);
    assert.equal(called, true);
  });
});

describe("errorHandler middleware", () => {
  it("is a function with 4 parameters", () => {
    assert.equal(typeof errorHandler, "function");
    assert.equal(errorHandler.length, 4);
  });

  it("formats ValidationError with 400 status and code", () => {
    let statusCode = null;
    let responseBody = null;
    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    const err = new ValidationError("senderName is required");
    errorHandler(err, req, res, next);

    assert.equal(statusCode, 400);
    assert.deepEqual(responseBody, {
      error: "senderName is required",
      code: "VALIDATION_ERROR",
    });
  });

  it("formats NotFoundError with 404 status and code", () => {
    let statusCode = null;
    let responseBody = null;
    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    const err = new NotFoundError("Wish not found: xyz");
    errorHandler(err, req, res, next);

    assert.equal(statusCode, 404);
    assert.deepEqual(responseBody, {
      error: "Wish not found: xyz",
      code: "NOT_FOUND",
    });
  });

  it("formats DatabaseError with 500 status and real message", () => {
    let statusCode = null;
    let responseBody = null;
    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    const err = new DatabaseError("SQLITE_BUSY: database is locked");
    errorHandler(err, req, res, next);

    assert.equal(statusCode, 500);
    assert.deepEqual(responseBody, {
      error: "SQLITE_BUSY: database is locked",
      code: "DB_ERROR",
    });
  });

  it("handles generic Error with 500 default (no code)", () => {
    let statusCode = null;
    let responseBody = null;
    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    const err = new Error("something unexpected");
    errorHandler(err, req, res, next);

    assert.equal(statusCode, 500);
    assert.deepEqual(responseBody, { error: "something unexpected" });
    assert.equal(responseBody.code, undefined);
  });
});
