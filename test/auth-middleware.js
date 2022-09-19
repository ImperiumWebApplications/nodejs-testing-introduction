const authMiddleware = require("../middleware/is-auth");
const { expect } = require("chai");

describe("Auth middleware", function () {
  it("should throw an error if no authorization header is present", function () {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated."
    );
  });
  it("should throw an error if the authorization header is only one string", function () {
    const req = {
      get: function (headerName) {
        return "xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
  // Expect the request object to have a userId property
  it("should yield a userId after decoding the token", function () {
    const req = {
      get: function (headerName) {
        return "Bearer xyz";
      },
    };
    // Mock the jwt.verify function
    const jwt = require("jsonwebtoken");
    jwt.verify = function () {
      return { userId: "abc" };
    };
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    // Restore the original function
    jwt.verify = require("jsonwebtoken").verify;
  });
});
