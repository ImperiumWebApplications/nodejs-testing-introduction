const { expect } = require("chai");
const sinon = require("sinon");
const dotenv = require("dotenv");
const User = require("../models/user");
const AuthController = require("../controllers/auth");
const mongoose = require("mongoose");

// Configure dotenv to load in the .env file
dotenv.config();

describe("Auth Controller - Login", function () {
  it("should throw an error with code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();
    const req = {
      body: {
        email: "",
        password: "",
      },
    };

    // Call authcontroller method and use done() to wait for the promise to resolve
    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });

    User.findOne.restore();
  });
  it("should send a response with a valid user status for an existing user", function (done) {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          status: "I am new!",
        });
        return user.save();
      })
      .then((user) => {
        const req = { userId: user._id };
        const res = {
          statusCode: 500,
          userStatus: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userStatus = data.status;
          },
        };
        AuthController.getUserStatus(req, res, () => {}).then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userStatus).to.be.equal("I am new!");
          // Close the connection to the database
          mongoose.disconnect();
          done();
        });
      })
      .catch((err) => console.log(err));
  });
});
