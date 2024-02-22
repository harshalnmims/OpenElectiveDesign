const studentQuery = require('../queries/studentQueries.js');
const userQuery = require("../queries/user.js");
const validationController = require("../controller/validation.js");
const jwtauth = require("../middleware/request.js");
const {redisDb} = require("../config/database.js");

module.exports = {
  viewStudentEvents: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);

      if (username != undefined) {
        let getStudentEvent = await studentQuery.getStudentEvent(username);
        let getmodules = await userQuery.getModules(username);

        return res.render("viewStudentEvent", {
          module: getmodules,
          event: getStudentEvent.rows,
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (error) {
      console.log(error.message);
      return res.redirect("/elective/error");
    }
  },

  startCourseSelection: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);

      if (username != undefined) {
        let eventId = req.query.id;

        console.log(eventId, username);
        let displayBasket = await studentQuery.displayBasket(eventId, username);
        let showYearBackSubjects = await studentQuery.showYearBackSubjects(
          username,
          eventId
        );
        let getModules = await userQuery.getModules(username);

        return res.render("selectBasket", {
          module: getModules,
          showBasket: displayBasket.rows,
          yearBackSubjects: showYearBackSubjects.rows,
        });
      } else {
        res.clearCookie("jwtauth");
        return res.redirect("/elective/loginPage#sessionTimeout");
      }
    } catch (error) {
      console.log(error.message);
      return res.redirect("/elective/error");
    }
  },

  insertStudentCourses: async (req, res) => {
    try {
      let username = jwtauth.verifySession(req, res);
      if (username != undefined) {
        let { eventLid, timeString, courseArray, userLid, basketLid } =
          req.body;
        let basketObj = {
          eventLid,
          timeString,
          courseArray,
          userLid,
          basketLid,
        };
        console.log(
          JSON.stringify({
            eventLid,
            timeString,
            courseArray,
            userLid,
            basketLid,
          })
        );

        let redisData = await redisDb.set(
          "basketData",
          JSON.stringify(basketObj),
          { EX: 2592000 }
        );
        let insertStudentBasket = await studentQuery.insertStudentCourse(
          JSON.stringify(basketObj)
        );
        if (insertStudentBasket.rowCount > 0) {
          console.log(insertStudentBasket);
          return res.json({ message: "Inserted success" });
        } else {
          return res.json({ message: "failed to insert" });
        }
      } else {
        res.clearCookie("jwtauth");
        return res.json({
          status: "error",
          redirectTo: "/elective/loginPage",
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.json({ status: "Error", redirectTo: "/elective/error" });
    }
  },
};