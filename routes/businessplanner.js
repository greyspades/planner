var express = require("express");
var router = express.Router();
var db = require("../Planner");
var fs = require("fs");
var email = require("../email");
const { v4: uuidv4 } = require("uuid");
const sql = require("mssql");
const makeContract = require("../helpers/contract");
const CryptoJs = require("crypto-js");
const { base64ToHex, hexToBase64 } = require("../helpers/conversion");
const fetch = require("node-fetch");
const multer = require("multer");
const path = require("path");
const formidable = require("formidable");
const flash = require("connect-flash");
const makeRequest = require("../helpers/e360")

const storage = multer.diskStorage({
  destination: "./documents/",
  filename: function (req, file, cb) {
    try {
      const originalname = file.originalname;
      const extension = path.extname(originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const newFilename = originalname + extension;
      console.log(newFilename);
      cb(null, newFilename); // Use the new filename
    } catch (err) {
      console.log(err);
    }
  },
});

var key = CryptoJs.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_KEY);
var iv = CryptoJs.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_IV);

let varProj = "";
let varMiles = "";
let varFormProj = "";
var session;
router.get("/login", function (req, res, next) {
  res.render("BusinessPlanner\\login");
});

router.get("/home", async function (req, res, next) {
  session = req.session;
  if (req.session.userData) {
    const request = db.request();
    await request
      .execute("Get_projects")
      .then((result) => {
        const projects = result.recordset;
        var resData = {
          toDo: [],
          ongoing: [],
          completed: [],
        };
        // console.log(projects)
        projects.forEach((item) => {
          const today = new Date(); // First date
          const dueDate = new Date(item.enddate); // Second date
          // Calculate the time difference in milliseconds
          const timeDifference = dueDate - today;
          // Convert the time difference to days
          const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
          item["days"] = Math.round(daysDifference);
          if (
            item.status == "PENDING" &&
            new Date(JSON.stringify(item.startdate).slice(1, 11)) < new Date()
          ) {
            resData["toDo"].push(item);
          } else if (
            item.status == "PENDING" &&
            new Date(JSON.stringify(item.enddate).slice(1, 11)) > new Date()
          ) {
            resData["ongoing"].push(item);
          } else if (item.status == "COMPLETED") {
            resData["completed"].push(item);
          }
        });
        // console.log(resData)
        res.render("BusinessPlanner\\home", { data: resData });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});

router.get("/complete_project/:id", async function (req, res, next) {
  const id = req.params.id;
  const request = db.request();
  request.input("id", sql.VarChar, id);
  await request
    .execute("Complete_project")
    .then((result) => {
      if (result) {
        req.flash("status", "Project completed successfully");
        res.redirect(`/BusinessPlanner/home/projects/view/${id}`);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/delete_project", async function (req, res, next) {
  const id = req.body.id;
  const request = db.request();
  console.log(id);
  request.input("id", sql.VarChar, id);
  await request
    .execute("Delete_project")
    .then((result) => {
      console.log("deleted");
      req.flash("status", "project deleted successfully");
      res.redirect(`/BusinessPlanner/home/projects`);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/signup", function (req, res, next) {
  res.render("BusinessPlanner\\signup");
});

router.get("/home/viewreport", function (req, res, next) {
  session = req.session;
  if (req.session.userData) {
    const d = new Date();
    let today = Date.now();
    let day = d.getDay();
    let mon = today - (day - 1) * 86400000;
    let fri = mon + 4 * 86400000;
    const frid = new Date(fri);
    let friday = frid.getDate();
    let fridm = frid.getMonth() + 1;
    let fridy = frid.getFullYear();
    var filepath =
      "public/files/LAPODevOpsTasks" +
      fridm +
      "-" +
      friday +
      "-" +
      fridy +
      ".html";
    fs.access(filepath, fs.F_OK, function (err) {
      if (err) {
        res.render("BusinessPlanner\\viewemptyreport");
      } else {
        res.render("BusinessPlanner\\viewreport");
      }
    });
  } else {
    res.redirect("/businessplanner/login");
  }
});
// router.get('/successfulsignup', function(req, res, next) {
//     res.render('BusinessPlanner\\signupsucces');
// });
router.get("/home/addnewproject", function (req, res, next) {
  if (req.session.userData) {
    const request = db.request()
    request.execute("Get_all_pmo")
    .then((result) => {
      if(result.recordset.length > 0) {
        const resData = result.recordset
        // console.log(resData)
        res.render("BusinessPlanner\\addproject", {managers: resData});
      } else {

      }
    })
  } else {
    res.redirect("/businessplanner/login");
  }
});
router.get("/home/addnewmilestone/:id", async function (req, res, next) {
  session = req.session;
  if (session.userData) {
    const id = req.params.id;
    // res.render('BusinessPlanner\\addmilestone', {data: varProj});
    const request = db.request();
    request.input("id", sql.VarChar, id);
    await request
      .execute("Get_project_by_id")
      .then((result) => {
        const dbResult = result.recordset[0];
        const timeDiff =
          new Date(dbResult.enddate) - new Date(dbResult.startdate);
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        console.log(dbResult);
        res.render("./BusinessPlanner/addmilestone", {
          title: dbResult.title,
          duration: `${dbResult.startdate}---${dbResult.enddate}`,
          id: dbResult.id,
          difference: daysDiff,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("BusinessPlanner\\projecterr");
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});

router.get("/home/projects", async function (req, res, next) {
  session = req.session;
  if (session.userData) {
    await db
      .request()
      .execute("Get_projects")
      .then((result) => {
        res.render("BusinessPlanner\\projects", {
          data: result.recordset,
          messages: req.flash("info"),
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("BusinessPlanner\\projectserr");
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});

router.get("/home/projects/view/:id", async function (req, res, next) {
  const session = req.session;
  if (session.userData) {
    var id = req.params.id;
    const request = db.request();
    request.input("id", sql.VarChar, id);
    await request
      .execute("Get_project_info")
      .then(async (result) => {
        if (result) {
          await request.execute("Get_documents").then((doc) => {
            const documents = doc.recordset;
            const dbResult = result.recordset;
            // console.log(dbResult[0])
            const response = {
              id: dbResult[0].id,
              title: dbResult[0].title,
              description: dbResult[0].description,
              status: dbResult[0].status,
              startDate: dbResult[0].startdate,
              endDate: dbResult[0].enddate,
              milestones: [],
              comment: dbResult[0].comment,
              pmo: dbResult[0].pmo,
              creationDate: dbResult[0].creationDate,
              department: dbResult[0].department,
              author: dbResult[0].author
            };
            result.recordset.forEach((item) => {
              let keys = Object.keys(item);
              let obj = {};
              keys.forEach((key) => {
                if (
                  ["mTitle", "mDescription", "mPriority", "mDate", "mComment"].includes(key)
                ) {
                  obj[key] = item[key];
                }
              });
              response.milestones.push(obj);
            });
            res.render("BusinessPlanner\\view", {
              data: response,
              docs: documents,
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("BusinessPlanner\\projecterr");
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});
router.get("/home/milestones/edit/:id/:title", async function (req, res, next) {
  session = req.session;
  if (session.userData) {
    const id = req.params.id;
    const title = req.params.title;
    const request = db.request();
    request.input("id", sql.VarChar, id);
    request.input("title", sql.VarChar, title);
    await request
      .execute("Get_milestone")
      .then((result) => {
        const dbResult = result.recordset[0];
        res.render("BusinessPlanner\\editmilestone", { data: dbResult });
      })
      .catch((err) => {
        console.log(err);
        res.render("BusinessPlanner\\projecterr");
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});
router.get("/home/projects/edit/:id", async function (req, res, next) {
  session = req.session;
  const id = req.params.id;
  if (session.userData) {
    const request = db.request();
    request.input("id", sql.VarChar, id);
    await request
      .execute("Get_project_by_id")
      .then((result) => {
        const dbResult = result.recordset;
        console.log(dbResult);
        res.render("BusinessPlanner/editproject", { data: dbResult[0] });
      })
      .catch((err) => {
        console.log(err);
        res.render("BusinessPlanner\\projecterr");
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});
// router.get('/home/projects-deleted-proj', function(req, res, next) {
//     session = req.session;
//     if (session.userid) {
//         db.query("CALL getprojects()", function (err, rows) {
//             if (err) {
//                 res.render('BusinessPlanner\\projectserr');
//             } else {
//                 res.render("BusinessPlanner\\projdel", {data: rows[0]});
//             }
//         });
//     } else {
//         res.redirect('/businessplanner/login');
//     }
// });
router.get("/home/projects/view/deletemilestone", function (req, res, next) {
  session = req.session;
  if (session.userData) {
    var project = varProj;
    db.query("CALL getprojects()", function (err, rows) {
      if (err) {
        console.log(err);
        res.render("BusinessPlanner\\projecterr");
      }
      db.query("CALL getmilestones_by_time(?)", project, function (err, rows1) {
        if (err) {
          console.log(err);
          res.render("BusinessPlanner\\projecterr");
        }
        db.query("CALL get_single_project(?)", project, function (err, rows2) {
          if (err) {
            console.log(err);
            res.render("BusinessPlanner\\projecterr");
          }
          res.render("BusinessPlanner\\delmilestone", {
            data: rows[0],
            data1: rows1[0],
            data2: rows2[0],
            data3: varMiles,
          });
        });
      });
    });
  } else {
    res.redirect("/businessplanner/login");
  }
});
router.get("/home/addnewproject/addnewmilestone", function (req, res, next) {
  session = req.session;
  if (session.userData) {
    res.render("BusinessPlanner\\addmilestone0", { data: varProj });
  } else {
    res.redirect("/businessplanner/login");
  }
});
router.get("/home/submittingtasks/selectproj", async function (req, res, next) {
  session = req.session;
  if (session.userData) {
    const request = db.request();
    await request
      .execute("Get_projects")
      .then((result) => {
        const resData = result.recordset;
        res.render("BusinessPlanner\\selectproj", { data: resData });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/businessplanner/login");
  }
});

router.post(
  "/home/submittingtasks/selectproj/fillreport",
  async function (req, res, next) {
    session = req.session;
    if (session.userData) {
      const title = req.body.title;
      const request = db.request();
      request.input("title", sql.VarChar, title);
      await request
        .execute("Get_project_info_by_title")
        .then((result) => {
          const dbResult = result.recordset;
          const response = {
            id: dbResult[0].id,
            title: dbResult[0].title,
            description: dbResult[0].description,
            status: dbResult[0].status,
            startDate: dbResult[0].startdate,
            endDate: dbResult[0].enddate,
            milestones: [],
          };
          result.recordset.forEach((item) => {
            let keys = Object.keys(item);
            let obj = {};
            keys.forEach((key) => {
              if (
                ["mTitle", "mDescription", "mPriority", "mDate"].includes(key)
              ) {
                obj[key] = item[key];
              }
            });
            response.milestones.push(obj);
          });
          res.render("BusinessPlanner\\fillreport", { data: response });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.redirect("/businessplanner/login");
    }
  }
);
// router.get('/home/projecterr', function(req, res, next) {
//     session = req.session;
//     if (session.userid) {
//         res.render('BusinessPlanner\\projectserr');
//     } else {
//         res.redirect('/businessplanner/login');
//     }
// });
// router.get('/loginfailed', function(req,res,next) {
//     res.render('BusinessPlanner\\loginfailed');
// });
// router.get('/forgotpassword', function(req, res, next) {
//     res.render('BusinessPlanner\\forgotpassword');
// });
// router.get('/home/bin', function(req, res, next) {
//     session = req.session;
//     if (session.userid) {
//         db.query("CALL getprojects()", function(err, rows) {
//             if (err) {
//                 console.log(err);
//                 res.render('BusinessPlanner\\projecterr');
//             } else {
//                 db.query("CALL get_deleted_projects()", function(err, rows1) {
//                     if (err) {
//                         console.log(err);
//                         res.render('BusinessPlanner\\projecterr');
//                     } else {
//                         db.query("CALL get_all_milestones()", function(err, rows2) {
//                             if (err) {
//                                 console.log(err);
//                                 res.redirect('BusinessPlanner\\projecterr');
//                             } else res.render('BusinessPlanner\\deletedprojects', {data: rows[0], data1: rows1[0], data2: rows2[0]});
//                         });
//                     }
//                 });
//             }
//         });
//     } else {
//         res.redirect('/businessplanner/login');
//     }
// });
// router.get('/home/projects/view/deletedmilestones', function(req, res, next) {
//     session = req.session;
//     if (session.userid) {
//         db.query("CALL getprojects()", function (err, rows) {
//             if (err) {
//                 console.log(err);
//                 res.render('BusinessPlanner\\projecterr');
//             } else {
//                 db.query("CALL getmilestones(?)", varProj, function(err, rows1) {
//                     if (err) {
//                         console.log(err);
//                         res.render('BusinessPlanner\\projecterr');
//                     } else res.render('BusinessPlanner\\deletedmilestones', {data: rows[0], data1: rows1[0], data2: varProj});
//                 });
//             }
//         });
//     } else {
//         res.redirect('/businessplanner/login');
//     }
// });
router.get("/logout", function (req, res, next) {
  req.session.destroy();
  res.redirect("/businessplanner/login");
});

router.post("/submittingtasks...", async function (req, res, next) {
  if (Array.isArray(req.body.milestone)) {
    for (let i = 0; i < req.body.milestone.length; i++) {
      const id = uuidv4();
      const request = db.request();
      request.input("pid", sql.VarChar, req.body.id);
      request.input("mtitle", sql.VarChar, req.body.milestone[i]);
      request.input("activity", sql.VarChar, req.body.activity[i]);
      request.input("status", sql.VarChar, req.body.status[i]);
      request.input("remarks", sql.VarChar, req.body.comment[i]);
      request.input("id", sql.VarChar, id);
      request.input("date", sql.Date, new Date().toLocaleDateString());

      await request.execute("Create_task");
      // .then((result) => {

      // })
      // .catch((err) => {
      //     console.log(err)
      // })
    }
    req.flash("status", "Task added successfully");
    res.redirect("/businessplanner/home/submittingtasks/selectproj");
  } else {
    const id = uuidv4();
    const request = db.request();
    request.input("pid", sql.VarChar, req.body.id);
    request.input("mtitle", sql.VarChar, req.body.milestone);
    request.input("activity", sql.VarChar, req.body.activity);
    request.input("status", sql.VarChar, req.body.status);
    request.input("remarks", sql.VarChar, req.body.comment);
    request.input("id", sql.VarChar, id);
    request.input("date", sql.Date, new Date().toLocaleDateString());

    await request
      .execute("Create_task")
      .then((result) => {
        req.flash("status", "Task added successfully");
        res.redirect("/businessplanner/home/submittingtasks/selectproj");
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // const d = new Date();
  // let today = Date.now();
  // let day = d.getDay();
  // let mon = today - ((day - 1) * 86400000);
  // let fri = mon + (4 * 86400000);
  // const mond = new Date(mon);
  // const frid = new Date(fri);
  // let monday = mond.getDate();
  // let mondm = mond.getMonth() + 1;
  // let mondy = mond.getFullYear();
  // let friday = frid.getDate();
  // let fridm = frid.getMonth() + 1;
  // let fridy = frid.getFullYear();
  // const startdate = monday + "-" + mondm + "-" + mondy;
  // const enddate = friday + "-" + fridm + "-" + fridy;
  // var filepath = "public/files/LAPODevOpsTasks" + fridm + "-" + friday + "-" + fridy + ".html";
  // console.log("the koko2")
  // // fs.access(filepath, fs.F_OK, function(err) {
  // //     if (err) {
  // //         var html = "<!DOCTYPE html><html><HEAD><style>table, th, td {border: 1px solid black;border-collapse: collapse;text-align: center; font-size: 12px}</style></HEAD><body><img src='lapo_logo_plain.png' width='250px'><h6 style='color: blue; font-size: 19px'>DEPT: IT SOLUTION AND INNOVATION<BR>REPORTING PERIOD: " + startdate + " TO " + enddate + "<BR>DEPT HEAD NAME: OWEGIE OSASERE<BR>UNIT HEAD TEAM: NATHANIEL OMORAGBON<BR>TEAM MEMBERS: OLU EVANS, EBELE NMOEMENAM, CALEB NADOMA, PASCAL IKEJI</h6><table width='100%'><tr><th>ACTIVITY</th><th>REMARK</th><th>COMPLETION TIMELINE</th><th>STATUS</th></tr>";
  // //         fs.appendFile(filepath, html, function(err) {
  // //             if (err) req.flash(err);
  // //             console.log('Report created');
  // //         });
  // //     }
  // // });
  // function play() {var title = req.body.title;
  // var milestone = req.body.milestone;
  // var activity = req.body.activity;
  // var status = req.body.status;
  // var comment = req.body.comment;
  // if(Array.isArray(title)) {
  //     for(var i=0; i<title.length; i++) {
  //         let tit = title[i];
  //         let mil = milestone[i];
  //         let act = activity[i];
  //         let stat = status[i];
  //         let com = comment[i];
  //         db.query("CALL gettimeline(?)", mil, function(err, row) {
  //             if (err) req.flash('error', err);
  //             else {
  //                 var timeline = JSON.stringify(row[0][0].timeline).slice(1, 11);
  //                 var doc = "<tr><td style='text-align: left'><b style='font-size: 15px'>" + tit + "</b><br><br><b>" + mil + "</b><br>" + act + "</td><td>" + com + "</td><td>" + timeline + "</td><td>" + stat + "</td></tr>";
  //                 fs.appendFile(filepath, doc, function(err) {
  //                     if (err) req.flash(err);
  //                     console.log('File uploaded');
  //                 });
  //             }
  //         });
  //     }
  //     res.redirect('/businessplanner/home/submittingtasks/selectproj');
  // } else {
  //     db.query("CALL gettimeline(?)", milestone, function(err, row) {
  //         if(err) req.flash('error', err);
  //         else {
  //             var timeline = JSON.stringify(row[0][0].timeline).slice(1, 11);
  //             var doc = "<tr><td style='text-align: left'><b style='font-size: 15px'>" + title + "</b><br><br><b>" + milestone + "</b><br>" + activity + "</td><td>" + comment + "</td><td>" + timeline + "</td><td>" + status + "</td></tr>";
  //             fs.appendFile(filepath, doc, function(err) {
  //                 if (err) req.flash(err);
  //                 console.log('File uploaded');
  //                 res.redirect('/businessplanner/home/submittingtasks/selectproj');
  //             });
  //         }
  //     });
  // }
  // }
  // setTimeout(play, 1000);
});

// router.post('/signingup...', async function(req, res, next) {
//     const username = req.body.username;
//     const email = req.body.email;
//     const password = req.body.password;
//     const active = "Inactive";
//     const id = uuidv4();

//     const pool = await sql.connect(db);

//     const query = "INSERT INTO users(username, email, password, status, id) VALUES(@username, @email, @password, @active, @id)";
//     // const request = db.request();
//     const request = pool.request()
//      request.input('username',sql.VarChar, username)
//      request.input('email', sql.VarChar, email)
//      request.input('password', sql.VarChar, password)
//      request.input('active', sql.VarChar, active)
//      request.input('id', sql.VarChar, id)
//     // .query(query)
//     // .then((result) => {
//     //     console.log(result)
//     //     res.redirect('/businessplanner/successfulsignup');
//     // })
//     // .catch((err) => {
//     //     console.log(err)
//     //     res.status(500).json({ error: 'Internal server error' })
//     // })

//     await request.query(query)
//     .then((result) => {
//         console.log(result)
//         res.redirect('/businessplanner/successfulsignup');
//     })
//     .catch((err) => {
//         console.log(err)
//         res.status(500).json({ error: 'Internal server error' })
//     })
// });

router.post("/loggingin...", async function (req, res, next) {
  let username = req.body.user;
  const password = req.body.pswrd;

//   req.session.userData = username;
//   res.redirect('/businessplanner/home');

  const cred = await makeContract()

  const token = {
      tk: cred[0],
      src: "AS-IN-D659B-e3M"
  }
  const body = {
      UsN: username,
      Pwd: password,
      xAppSource: "AS-IN-D659B-e3M"
  }
  const jsonBody = JSON.stringify(body);
  const jsonHeader = JSON.stringify(token)

  var resData;

  var key = CryptoJs.enc.Utf8.parse(cred[1]);
  var iv = CryptoJs.enc.Utf8.parse(cred[2]);

  const encryptedBody = CryptoJs.AES.encrypt(jsonBody, key, {
      iv: iv,
  }).toString();
  const encryptedHeader = CryptoJs.AES.encrypt(jsonHeader, key, {
      iv: iv,
  }).toString();
  const hexBody = base64ToHex(encryptedBody);
  const hexHeader = base64ToHex(encryptedHeader);

  const options = {
      method: "POST",
      headers: {
        "x-lapo-eve-proc": hexHeader + cred[0],
        "Content-Type": "application/json",
      },
      body: hexBody,
  }
//   session = req.session;
//   session.userid = username;
//   res.redirect("/businessplanner/home");

  var e360Res = await fetch("http://10.0.0.184:8015/userservices/mobile/authenticatem", options)
  var jsonRes = await e360Res.json()
  if(jsonRes.status==200) {
      let bytes = CryptoJs.AES.decrypt(hexToBase64(jsonRes.data), key, { iv: iv });
      resData = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
      const userData = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
    //   console.log(userData)
      req.session.userData = userData;
      res.redirect('/businessplanner/home');
  } else {
      res.redirect('/businessplanner/loginfailed');
  }

//   await db.request()
//   .input('username',sql.VarChar, username)
//   .execute("Get_user_by_username")
//   .then((result) => {
//       let user = result.recordset[0];
//       session = req.session;
//       session.userid = username;
//       if(user) {
//           if(user?.password == password) {
//               res.redirect('/businessplanner/home')
//           } else {
//               res.redirect('/businessplanner/loginfailed');
//           }
//       }
//   })
});
// router.post('/addingnewprojects...', async function(req, res, next) {
//     const title = req.body.title;
//     const desc = JSON.stringify(req.body.desc);
//     var i=0;
//     db.request()
//     .input('username',sql.VarChar, username)
//     .execute("Get_user_by_username")
//     .then((result) => {})

//     if(Array.isArray(title)) {
//         for(var i=0; i<title.length; i++) {
//             await db.request()
//             .execute("Add_project")
//             .then((result) => {})
//             //     if (err) console.log(err);
//             //     console.log('Project entered into lapoplanner');
//             // });
//         }
//     } else {
//         db.query("CALL add_new_project(?, ?)", [title, desc], function(err, data) {
//             if (err) console.log(err);
//             console.log('Project entered into lapoplanner');
//         });
//     }
//     res.redirect("/businessplanner/home/projects");
// });

router.get("/home/searchPMO", async function(req, res, next) {
    if(req.session.userData) {
        const value = req.query.query
        const userData = req.session.userData;
        const division = req.session.division
        const cred = await makeContract()
        const jsonHeader = JSON.stringify({
            'tk': cred[0],
            'us': userData.UserRef,
            'rl': userData.uRole,
            'src': "AS-IN-D659B-e3M"
        })
        var body = JSON.stringify({
            "xParam": value,
            "xBuCode": "",
            "xScope": division.DivisionName,
            "xScopeRef": division.DivisionCode,
            "xRowCount": 1,
            "xFromDate": "",
            "xToDate": "",
            "xApp": "AS-IN-D659B-e3M",
            "xPageIndex": 1,
            "xPageSize": 1
          });
        const result = await makeRequest("http://10.0.0.184:8015/userservices/searchemployees", body, jsonHeader, cred)
        console.log(result)
        res.send(result)
        // req.session.division = result;
        // console.log(result)
        // res.render("BusinessPlanner\\addPMO",{data: result})
    } else {
        res.redirect("/businessplanner/login");
    }
})

router.post("/home/addPMO", async function(req, res, next) {
    if(req.session.userData) {
        // console.log(req.body)
        const id = uuidv4();
        const { name, createProj, deleteProj, editProj, bu, jobRole, userId } = req.body
        const request = db.request()
        request.input("name", sql.VarChar, name)
        await request.execute("Get_pmo_by_name")
        .then((result) => {
          // const resData = result.recordset[0]
          if(result.recordset.length > 0) {
            req.flash("error", "This PMO already exists")
            res.redirect("/businessplanner/home/addPMO")
          } else {
            const createPmo = async() => {
              const request = db.request()
              request.input("id", sql.VarChar, id)
              request.input("name", sql.VarChar, name)
              request.input("bu", sql.VarChar, bu)
              request.input("jobRole", sql.VarChar, jobRole)
              request.input("createProj", sql.Bit, createProj == 'on' ? true : false)
              request.input("deleteProj", sql.Bit, deleteProj == 'on' ? true : false)
              request.input("editProj", sql.Bit, editProj == 'on' ? true : false)
              request.input("userId", sql.VarChar, userId)

              await request.execute("Create_PMO")
              .then((result) => {
                  // console.log(result)
                  req.flash("status", "Successfully created PMO")
                  res.redirect("/businessplanner/home/addPMO")
              })
              .catch((err) => {
                  console.log(err)
              })
            }
              createPmo()
          }
        })
        .catch((err) => {
          console.log(err)
        })

    }else {
        res.redirect("/businessplanner/login");
    }
})

router.get("/pmo/manage_pmo/:id", async function(req, res, next) {
  if(req.session.userData) {
    const id = req.params.id
    const request = db.request()
    request.input("id",sql.VarChar, id)
    await request.execute("Get_pmo_by_id")
    .then((result) => {
      const resData = result.recordset[0]
      resData.id = resData.id[0]
      // console.log(resData)
      res.render("BusinessPlanner\\editPmo", {data: resData})
    })
  } else {
    res.redirect("/businessplanner/login");
  }
})

router.post("/pmo/manage_pmo/edit", async function(req, res, next) {
  if(req.session.userData) {
    console.log(req.body)
    const { createProj, deleteProj, editProj, id } = req.body
    const request = db.request()
    request.input("create", sql.Bit, createProj == 'on' ? true : false)
    request.input("delete", sql.Bit, deleteProj == 'on' ? true : false)
    request.input("edit", sql.Bit, editProj == 'on' ? true : false)
    request.input("id", sql.VarChar, id)
    await request.execute("Update_permissions")
    .then((result) => {
      console.log("edited permissions")
      req.flash("status", "Successfully edited user permissions")
      res.redirect(`/businessplanner/pmo/manage_pmo/${id}`)
    })
  } else {
    res.redirect("/businessplanner/login");
  }
})

router.get("/home/pmo", async function(req, res, next) {
  if(req.session.userData) {
    const request = db.request()
    await request.execute("Get_all_pmos")
    .then((result) => {
      const resData = result.recordset
      // console.log(resData)
      res.render("BusinessPlanner\\PMOs", {data: resData})
    })
  } else {
    res.redirect("/businessplanner/login");
  }
})

router.get("/home/addPMO", async function(req, res, next) {
    if(req.session.userData) {
        const userData = req.session.userData;
        const cred = await makeContract()
        const jsonHeader = JSON.stringify({
            'tk': cred[0],
            'us': userData.UserRef,
            'rl': userData.uRole,
            'src': "AS-IN-D659B-e3M"
        })
        var body = JSON.stringify({
            "xParam": userData.UserRef,
            "xBuCode": "",
            "xScope": "",
            "xScopeRef": "",
            "xRowCount": 1,
            "xFromDate": "",
            "xToDate": "",
            "xApp": "AS-IN-D659B-e3M",
            "xPageIndex": 1,
            "xPageSize": 1
          });
        const result = await makeRequest("http://10.0.0.184:8015/userservices/divisionbyempNo", body, jsonHeader, cred)
        req.session.division = result;
        res.render("BusinessPlanner\\addPMO")
    } else {
        res.redirect("/businessplanner/login");
    }
})

router.get("/downloadDoc/:path", async function (req, res, next) {
//   const path = req.params.path;
  const fileName = req.params.path;
  const filePath = `./documents/${fileName}`

  res.download(filePath, fileName, (err) => {
    if (err) {
      // Handle errors (e.g., file not found)
      res.status(404).send("File not found");
    }
  });
  // const request = db.request()
  //         request.input('id',sql.VarChar, id)
  //         await request.execute("Get_project_by_id")
  //         .then((result) => {
  //             const resData = result.recordset[0]
  //             if(resData.fileExtension) {
  //                 const filePath = `./documents/${id}${resData.fileExtension}`;
  //                 const fileName = `${id}${resData.fileExtension}`
  //                 res.download(filePath, fileName, (err) => {
  //                 if (err) {
  //                 // Handle errors (e.g., file not found)
  //                     res.status(404).send('File not found');
  //                 }
  //             });
  //             } else {
  //                 console.log("there is no document attached")
  //                 req.flash('error', 'This project has no document attached')
  //                 res.redirect(`/BusinessPlanner/home/projects/view/${id}`)
  //             }
  //         })
  //         .catch((err) => {
  //             console.log(err)
  //         })
});

router.post("/changeMilestoneStatus", async function(req, res, next) {
    const id = req.body.id
    const status = req.body.status
    const title = req.body.title
    const request = db.request()
    request.input('id', sql.VarChar, id)
    request.input('title', sql.VarChar, title)
    request.input('status', sql.VarChar, status)

    await request.execute('Change_milestone_status')
    .then((result) => {
        console.log("changed status")
        req.flash("status", "Milestone updated successfully")
        res.redirect(`/businessplanner/home/projects/view/${id}`);
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get("/project/delete_document/:path", async function(req, res, next) {
  const fileName = req.params.path;
  const id = fileName.split("~")[0];
  const actualName = fileName.split("~")[1]
  const filePath = `./documents/${fileName}`
  console.log(actualName)
  const request= db.request()
  request.input("id", sql.VarChar, id)
  request.input("name", sql.VarChar, actualName)
  await request.execute("Delete_document")
  .then((result) => {
    if(result) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting the file:', err);
          res.status(500).send('Error deleting the file');
        } else {
          console.log('File deleted successfully');
          req.flash("status", "Document deleted successfully")
          res.redirect(`/businessplanner/home/projects/view/${id}`);
        }
      });
    }
  })
  .catch((err) => {
    console.log(err)
  })
})

router.post("/project/add_document", async function(req, res, next) {
  const form = new formidable.IncomingForm();
    // Parse the form data, including files
    form.parse(req, async (err, fields, file) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error parsing form data");
      }
      const id = fields.id[0]
      if (Object.keys(file).length != 0) {
        const files = Object.keys(file);
        for (const doc of files) {
          let filePath = file[doc][0].filepath;
          let fileName = file[doc][0].originalFilename;
          let newPath = `./documents/${id}~${fileName}`;
          const extension = path.extname(fileName);

          fs.rename(filePath, newPath, async function (err) {
            if (err) {
              console.log(err);
            }
            const request = db.request();
            request.input("id", sql.VarChar, id);
            request.input("name", sql.VarChar, fileName);
            request.input("extension", sql.VarChar, extension);
            request.input("path", sql.VarChar, newPath);
            await request
              .execute("Add_document")
              .then((result) => {
                console.log("document added");
                req.flash("status", "Successfully added new document")
                res.redirect(`/businessplanner/home/projects/view/${id}`);
              })
              .catch((err) => {
                console.log(err);
              });
          });
        }
      }})
});

router.post("/submittingnewprojects...", async function (req, res, next) {
  try {
    var i = 0;
    const id = uuidv4();
    const form = new formidable.IncomingForm();
    const userData = req.session.userData;
    // Parse the form data, including files
    form.parse(req, async (err, fields, file) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error parsing form data");
      }
      if (Object.keys(file).length != 0) {
        const files = Object.keys(file);
        for (const doc of files) {
          let filePath = file[doc][0].filepath;
          let fileName = file[doc][0].originalFilename;
          let newPath = `./documents/${id}~${fileName}`;
          const extension = path.extname(fileName);

          fs.rename(filePath, newPath, async function (err) {
            if (err) {
              console.log(err);
            }
            const request = db.request();
            request.input("id", sql.VarChar, id);
            request.input("name", sql.VarChar, fileName);
            request.input("extension", sql.VarChar, extension);
            request.input("path", sql.VarChar, newPath);
            await request
              .execute("Add_document")
              .then((result) => {
                console.log("document added");
              })
              .catch((err) => {
                console.log(err);
              });
          });
        }
      }
      const request = db.request();
      request.input("title", sql.VarChar, fields.title[0]);
      await request
        .execute("Get_project_by_name")
        .then(async (result1) => {
          let resData = result1.recordset;
          if (resData.length < 1) {
            request.input("description", sql.VarChar, fields.description[0]);
            request.input("startDate", sql.VarChar, fields.startDate[0]);
            request.input("endDate", sql.VarChar, fields.endDate[0]);
            request.input("id", sql.VarChar, id);
            request.input("status", sql.VarChar, "PENDING");
            request.input("department", sql.VarChar, fields.department[0])
            request.input("manager", sql.VarChar, fields.manager[0])
            request.input("creationDate", sql.Date, new Date())
            request.input("author", sql.VarChar, `${userData.FirstName} ${userData.LastName}`)
            // request.input('extension', sql.VarChar, extension)
            await request
              .execute("Add_projects")
              .then((result) => {
                const timeDiff =
                  new Date(fields.endDate[0]) - new Date(fields.startDate[0]);
                const daysDiff = timeDiff / (1000 * 3600 * 24);
                if (result) {
                  res.render("./BusinessPlanner/addmilestone", {
                    title: fields.title[0],
                    duration: `${JSON.stringify(fields.startDate[0]).slice(1, 11)}---${JSON.stringify(fields.endDate[0]).slice(1, 11)}`,
                    id: id,
                    difference: daysDiff,
                  });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log("project exists");
            req.flash("error", "This project title already exists");
            res.redirect("home/addnewproject");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } catch (er) {
    console.log(err);
  }
});

router.post("/addingmilestone...", async function (req, res, next) {
  const title = req.body.title;
  const desc = req.body.desc;
  const priority = req.body.priority;
  const date = req.body.date;
  const id = req.body.id;
  if (Array.isArray(title)) {
    const existing = [];
    for (var i = 0; i < title.length; i++) {
      let request = db.request();
      request.input("title", sql.VarChar, title);
      await request.execute("Get_milestone_by_name").then(async (result) => {
        const resData = result.recordset;
        if (resData.length < 1) {
          // const request = db.request()
          // request.input("title", sql.VarChar, title)
          request.input("title", sql.VarChar, title[i]);
          request.input("priority", sql.VarChar, priority[i]);
          request.input("description", sql.VarChar, desc[i]);
          request.input("date", sql.Date, date[i]);
          request.input("id", sql.VarChar, id);

          await request
            .execute("Add_milestone")
            .then((result1) => {
              if (result1 && i == title.length - 1) {
                res.redirect("/businessplanner/home/projects");
              }
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/businessplanner/home/projecterr");
            });
        } else {
          console.log("milestone exists");
          req.flash("error", `the milestone${existing[0]} already exists`);
          res.redirect("home/addnewproject");
        }
      });
    }
    // res.redirect('/businessplanner/home/projects/view');
  } else {
    const request = db.request();
    request.input("title", sql.VarChar, title);
    request.input("priority", sql.VarChar, priority);
    request.input("description", sql.VarChar, desc);
    request.input("date", sql.Date, date);
    request.input("id", sql.VarChar, id);

    await request
      .execute("Add_milestone")
      .then((result) => {
        if (result) {
          res.redirect("/businessplanner/home/projects");
        }
      })
      .catch((err) => {
        console.log(err);
        // res.redirect("/businessplanner/home/projecterr");
      });
  }
});

router.post("/showmilestones", function (req, res, next) {
  varProj = req.body.project;
  // console.log(req.body)
  res.redirect(`/businessplanner/home/projects/view/${req.body.id}`);
});

router.post("/editmilestone", function (req, res, next) {
  varMiles = req.body.milestone;
  res.redirect("/businessplanner/home/projects/milestones/edit");
});

router.post("/editmilestone...", async function (req, res, next) {
  var desc = req.body.description;
  var priority = req.body.priority;
  var date = req.body.date;
  var title = req.body.title;
  var prevTitle = req.body.prevTitle;
  var id = req.body.id;
  var comment = req.body.comment

  const request = db.request();
  request.input("title", sql.VarChar, title);
  request.input("priority", sql.VarChar, priority);
  request.input("description", sql.VarChar, desc);
  request.input("date", sql.Date, date);
  request.input("id", sql.VarChar, id);
  request.input("prev", sql.VarChar, prevTitle);
  request.input("comment", sql.VarChar, comment)

  await request
    .execute("Update_milestone")
    .then((result) => {
      if (result) {
        res.redirect(`/businessplanner/home/projects/view/${id}`);
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/businessplanner/home/projecterr");
    });
});

router.post("/editproject...", async function (req, res, next) {
  const title = req.body.title;
  const desc = req.body.desc;
  const id = req.body.id;
  const request = db.request();
  console.log(id);
  request.input("id", sql.VarChar, id);
  request.input("title", sql.VarChar, title);
  request.input("description", sql.VarChar, desc);
  await request
    .execute("Edit_project")
    .then((result) => {
      if (result) res.redirect("/businessplanner/home/projects");
    })
    .catch((err) => {
      console.log(err);
      res.render("BusinessPlanner\\projecterr");
    });
});
router.post("/delete", function (req, res, next) {
  var name = req.body.project;
  var date = new Date();
  db.query(
    "CALL delete_status_project(?, ?)",
    [name, date],
    function (err, data) {
      if (err) {
        console.log(err);
        res.redirect("/businessplanner/home/projecterr");
      } else {
        console.log("The project has been successfully deleted");
        res.redirect("/businessplanner/home/projects-deleted-proj");
      }
    }
  );
});
router.get("", async function (req, res, next) {});
router.post("/getMilestonetoDel", function (req, res, next) {
  varMiles = req.body.milestone;
  res.redirect("/businessplanner/home/projects/view/deletemilestone");
});
router.post("/deletemilestone", function (req, res, next) {
  const milestone = req.body.milestone;
  const d = new Date();
  db.query(
    "CALL del_milestone(?, ?, ?)",
    [varProj, milestone, d],
    function (err, result) {
      if (err) {
        console.log(err);
        res.redirect("/businessplanner/home/projecterr");
      } else {
        console.log("Milestone has been successfully deleted!");
        res.redirect("/businessplanner/home/projects/view");
      }
    }
  );
});
router.post("/loadprojectsubmitreport", function (req, res, next) {
  varFormProj = req.body.project;
  res.redirect("/businessplanner/home/submittingtasks/selectproj/fillreport");
});

module.exports = router;
