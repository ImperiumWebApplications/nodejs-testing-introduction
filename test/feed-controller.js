const { expect } = require("chai");
const dotenv = require("dotenv");
const User = require("../models/user");
const Feedcontroller = require("../controllers/feed");
const mongoose = require("mongoose");

// Configure dotenv to load in the .env file
dotenv.config();

describe("Feed Controller", function () {
  before(function (done) {
    mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  it("should all the created post to the posts array of the creator", function (done) {
    const req = {
      body: {
        title: "Test Post",
        content: "A Test Post",
      },
      file: {
        path: "abc",
      },
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };
    Feedcontroller.createPost(req, res, () => {})
      .then((savedUser) => {
        expect(savedUser).to.have.property("posts");
        expect(savedUser.posts).to.have.length(1);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
