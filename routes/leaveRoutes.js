const express = require("express");
const xlsx = require("xlsx");
const db = require("../db"); // Replace with your database connection module
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login?message=Please log in to continue.");
  next();
} // Replace with your middleware for login check

const router = express.Router();
module.exports = (db) => {
  router.get("/dateWise", ensureLoggedIn, (req, res) => {

    res.render("dateWise", { message: [] });
  });
  router.get("/monthWise", ensureLoggedIn, (req, res) => {

    res.render("monthWise", { message: [] });
  });
  router.get("/yearWise", ensureLoggedIn, (req, res) => {

    res.render("yearWise", { message: [] });
  });
  router.get("/custom", ensureLoggedIn, (req, res) => {

    res.render("custom", { message: [] });
  });
  router.get("/consolidated", ensureLoggedIn, (req, res) => {

    res.render("consolidated", { message: [] });
  });
  // Live Search Endpoint for Faculty Name
// In your leaveRoutes.js or wherever you handle your routes
router.get('/api/search-faculty', (req, res) => {
  console.log('Query Params:', req.query); // Debug log to check the query parameters

  const { fname } = req.query;
console.log(fname[0]);
  if (!fname) {
      return res.status(400).json({ message: 'Missing fname parameter' });
  }

  const query = 'SELECT fid, fname FROM facultytable WHERE fname LIKE ?';
  const params = [`%${fname[0]}%`];

  db.query(query, params, (err, results) => {
      if (err) {
          console.error('Error fetching faculty names:', err);
          return res.status(500).json({ message: 'Error fetching data' });
      }
      res.json(results);
  });
});

  // router.get("/filter-leaves", ensureLoggedIn, (req, res) => {
  //   res.render("filt", { message: [] });
  // });
 // Route for Datewise Filter
router.post("/dateWise", (req, res) => {
  const { date, fname } = req.body;
  let query = `
    SELECT 
      l.fid, f.fname, l.date, l.typeofleaveapplied, 
      l.noofdays, l.from, l.to, l.leavesbefore, l.leavesafter, 
      l.cl, l.sl, l.el, l.scl
    FROM leavestable l 
    JOIN facultytable f ON l.fid = f.fid
    WHERE 1=1
  `;
  
  let params = [];

  // Apply Faculty Name Filter
  if (fname) {
    query += " AND f.fname LIKE ?";
    params.push(`%${fname}%`);
  }

  // Apply Date Filter
  if (date) {
    query += " AND ? BETWEEN l.from AND l.to";
    params.push(date);
  }

  db.query(query, params, (err, results) => {
    let message = {};
    if (err) {
      console.error("Error fetching filtered leave records:", err);
      message.text = "Error fetching filtered leave records.";
      message.type = "danger";
      return res.render("dateWise", { message });
    }

    if (results.length === 0) {
      message.text = "No records found for the given filter criteria.";
      message.type = "warning";
      return res.render("dateWise", { message });
    }

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(results);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Datewise Leaves");

    res.setHeader("Content-Disposition", "attachment; filename=datewise_leaves.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.send(buffer);
  });
});

  // Route for Monthwise Filter
  router.post("/monthWise", (req, res) => {
    const { month, year, fname } = req.body;
    let query = `
      SELECT 
        l.fid, f.fname, l.date, l.typeofleaveapplied, 
        l.noofdays, l.from, l.to, l.leavesbefore, l.leavesafter, 
        l.cl, l.sl, l.el, l.scl
      FROM leavestable l 
      JOIN facultytable f ON l.fid = f.fid
      WHERE 1=1
    `;
    const params = [];
    if (fname) {
      query += " AND f.fname LIKE ?";
      params.push(`%${fname}%`);
    }
  
  
    if (month && year) {
      query += " AND (MONTH(l.from) = ? AND YEAR(l.from) = ?) OR (MONTH(l.to) = ? AND YEAR(l.to) = ?)";
      params.push(month, year, month, year);
    } 
    console.log(month, year, month, year);
    db.query(query, params, (err, results) => {
      let message = {};
      if (err) {
        console.error("Error fetching filtered leave records:", err);
        message.text = "Error fetching filtered leave records.";
        message.type = "danger";
        return res.render("monthWise", { message });
      }
  
      if (results.length === 0) {
        message.text = "No records found for the given filter criteria.";
        message.type = "warning";
        return res.render("monthWise", { message });
      }
  
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(results);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Monthwise Leaves");
  
      res.setHeader("Content-Disposition", "attachment; filename=monthwise_leaves.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.send(buffer);
    });
  });
  
  // Route for Yearwise Filter
  router.post("/yearWise", (req, res) => {
    const { year, fname } = req.body;
    console.log(year);
    let query = `
      SELECT 
        l.fid, f.fname, l.date, l.typeofleaveapplied, 
        l.noofdays, l.from, l.to, l.leavesbefore, l.leavesafter, 
        l.cl, l.sl, l.el, l.scl
      FROM leavestable l 
      JOIN facultytable f ON l.fid = f.fid
      WHERE 1=1
    `;
    const params = [];
    if (fname) {
      query += " AND f.fname LIKE ?";
      params.push(`%${fname}%`);
    }
  
    if (year) {
      query += " AND (YEAR(l.from) = ? OR YEAR(l.to) = ?)";
      params.push(year,year);
    }
  
    db.query( query , params, (err, results) => {
      let message = {};
      if (err) {
        console.error("Error fetching filtered leave records:", err);
        message.text = "Error fetching filtered leave records.";
        message.type = "danger";
        return res.render("yearWise", { message });
      }
  
      if (results.length === 0) {
        message.text = "No records found for the given filter criteria.";
        message.type = "warning";
        return res.render("yearWise", { message });
      }
  
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(results);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Yearwise Leaves");
  
      res.setHeader("Content-Disposition", "attachment; filename=yearwise_leaves.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.send(buffer);
    });
  });
  
  // Route for Custom Range Filter
  router.post("/custom", (req, res) => {
    const { fromDate, toDate, fname } = req.body;
    let query = `
      SELECT 
        l.fid, f.fname, l.date, l.typeofleaveapplied, 
        l.noofdays, l.from, l.to, l.leavesbefore, l.leavesafter, 
        l.cl, l.sl, l.el, l.scl
      FROM leavestable l 
      JOIN facultytable f ON l.fid = f.fid
      WHERE 1=1
    `;
    const params = [];
    if (fname) {
      query += " AND f.fname LIKE ?";
      params.push(`%${fname}%`);
    }
  
    if (fromDate && toDate) {
      query += `
        AND (
          (l.from >= ? AND l.from <= ?) OR 
          (l.to >= ? AND l.to <= ?) OR 
          (l.from <= ? AND l.to >= ?)
        )
      `;
      params.push(fromDate, toDate, fromDate, toDate, fromDate, toDate);
    }
  
    db.query(query,params, (err, results) => {
      let message = {};
      if (err) {
        console.error("Error fetching filtered leave records:", err);
        message.text = "Error fetching filtered leave records.";
        message.type = "danger";
        return res.render("custom", { message });
      }
  
      if (results.length === 0) {
        message.text = "No records found for the given filter criteria.";
        message.type = "warning";
        return res.render("custom", { message });
      }
  
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(results);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Custom Leaves");
  
      res.setHeader("Content-Disposition", "attachment; filename=custom_leaves.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.send(buffer);
    });
  });
  
  // Route for Consolidated Report
  router.post("/consolidated", (req, res) => {
    let query = `
      SELECT fid, fname,  cl, sl, el, scl
      FROM facultytable
    `;
    
    db.query(query, (err, results) => {
      let message = {};
      if (err) {
        console.error("Error fetching consolidated report:", err);
        message.text = "Error fetching consolidated report.";
        message.type = "danger";
        return res.render("consolidated", { message });
      }
  
      if (results.length === 0) {
        message.text = "No faculty records found.";
        message.type = "warning";
        return res.render("consolidated", { message });
      }
  
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(results);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Consolidated Report");
  
      res.setHeader("Content-Disposition", "attachment; filename=consolidated_report.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.send(buffer);
    });
  });
  
  
  // router.post("/filter-leaves", (req, res) => {
  //   const { date, month, year, fromDate, toDate, fname } = req.body;
  
  //   let query = `
  //     SELECT 
  //       l.fid, f.fname, l.date, l.typeofleaveapplied, 
  //       l.noofdays, l.from, l.to, l.leavesbefore, l.leavesafter, 
  //       l.cl, l.sl, l.el, l.scl
  //     FROM leavestable l 
  //     JOIN facultytable f ON l.fid = f.fid
  //     WHERE 1=1
  //   `;
  //   const params = [];
  
  //   if (fname) {
  //     query += " AND f.fname LIKE ?";
  //     params.push(`%${fname}%`);
  //   }
  
  //   if (date) {
  //     query += " AND ? BETWEEN l.from AND l.to";
  //     params.push(date);
  //   }
  
  //   if (month && year) {
  //     query += " AND (MONTH(l.from) = ? AND YEAR(l.from) = ?) OR (MONTH(l.to) = ? AND YEAR(l.to) = ?)";
  //     params.push(month, year, month, year);
  //   } else if (month) {
  //     query += " AND (MONTH(l.from) = ? OR MONTH(l.to) = ?)";
  //     params.push(month);
  //   } else if (year) {
  //     query += " AND (YEAR(l.from) = ? OR YEAR(l.to) = ?)";
  //     params.push(year);
  //   }
  
  //   if (fromDate && toDate) {
  //     query += `
  //       AND (
  //         (l.from >= ? AND l.from <= ?) OR 
  //         (l.to >= ? AND l.to <= ?) OR 
  //         (l.from <= ? AND l.to >= ?)
  //       )
  //     `;
  //     params.push(fromDate, toDate, fromDate, toDate, fromDate, toDate);
  //   }
  
  //   db.query(query, params, (err, results) => {
  //     let message = {};
  
  //     if (err) {
  //       console.error("Error fetching filtered leave records:", err);
  //       message.text = "Error fetching filtered leave records.";
  //       message.type = "danger";
  //       return res.render("filter-leaves", { message });
  //     }
  
  //     if (results.length === 0) {
  //       message.text = "No records found for the given filter criteria.";
  //       message.type = "warning";
  //       return res.render("filter-leaves", { message });
  //     }
  
  //     const workbook = xlsx.utils.book_new();
  //     const worksheet = xlsx.utils.json_to_sheet(results);
  //     xlsx.utils.book_append_sheet(workbook, worksheet, "Leaves");
  
  //     res.setHeader("Content-Disposition", "attachment; filename=filtered_leaves.xlsx");
  //     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
  //     const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  //     res.send(buffer);
  //   });
  // });
  
  router.get("/view-leave-applications", ensureLoggedIn, (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
  
    const { fid } = req.session.user;
    const month = parseInt(req.query.month, 10) || null;
    const year = parseInt(req.query.year, 10) || null;
  
    let query = "SELECT `from`, `to`, `sl`, `cl`, `el`, `scl` FROM leavestable WHERE fid = ?";
    const queryParams = [fid];
  
    if (month) {
      query += " AND (MONTH(`from`) = ? OR MONTH(`to`) = ?)";
      queryParams.push(month, month);
    }
  
    if (year) {
      query += " AND (YEAR(`from`) = ? OR YEAR(`to`) = ?)";
      queryParams.push(year, year);
    }
  
    console.log("Final Query:", query, queryParams);
  
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).send("Error fetching leave data.");
      }
  
      res.render("leaveapplications", {
        leaveApplications: results,
        selectedMonth: month || "",
        selectedYear: year || "",
      });
    });
  });
  

router.get("/apply-leave", ensureLoggedIn, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  
  const { fid } = req.session.user;
  res.render("apply-leave", { fid, message: [] });
});

router.post("/apply-leave", (req, res) => {
  const { fid, date, typeofleaveapplied, noofdays, from, to } = req.body;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const currentDate = new Date();

  const dayDifference = calculateDayDifference(fromDate, toDate);

  if (fromDate < currentDate.setHours(0, 0, 0, 0)) {
    return res.render("apply-leave", {
      fid: fid,
      message: { text: "Leave can only be applied from today or a future date.", type: "danger" },
    });
  }

  if (Math.round(noofdays) !== dayDifference) {
    return res.render("apply-leave", {
      fid: fid,
      message: {
        text: `The 'from' and 'to' dates do not match the specified number of leave days (${noofdays}).`,
        type: "danger",
      },
    });
  }

  const facultyQuery = "SELECT * FROM facultytable WHERE fid = ?";
  db.query(facultyQuery, [fid], (err, facultyResults) => {
    if (err || facultyResults.length === 0) {
      return res.render("apply-leave", {
        fid: fid,
        message: { text: "Error fetching faculty data or faculty not found.", type: "danger" },
      });
    }

    const faculty = facultyResults[0];
    const leaveType = typeofleaveapplied.toLowerCase();

    if (leaveType !== "od" && parseFloat(faculty[leaveType]) < parseFloat(noofdays)) {
      return res.render("apply-leave", {
        fid: fid,
        message: {
          text: `Insufficient ${typeofleaveapplied} balance. Remaining: ${faculty[leaveType]}.`,
          type: "danger",
        },
      });
    }

    const overlapQuery =
      "SELECT * FROM leavestable WHERE fid = ? AND ((`from` BETWEEN ? AND ?) OR (`to` BETWEEN ? AND ?))";
    db.query(overlapQuery, [fid, from, to, from, to], (err, overlapResults) => {
      if (err || overlapResults.length > 0) {
        return res.render("apply-leave", {
          fid: fid,
          message: { text: "Leave dates overlap with an existing application.", type: "danger" },
        });
      }

      const leavesBefore = {
        cl: faculty.cl,
        sl: faculty.sl,
        el: faculty.el,
        scl: faculty.scl,
      };

      const leavesAfter = { ...leavesBefore };
      if (leaveType !== "od") {
        leavesAfter[leaveType] = parseFloat(leavesBefore[leaveType]) - parseFloat(noofdays);
      }

      const leaveQuery = `
        INSERT INTO leavestable (
          fid, date, typeofleaveapplied, noofdays, \`from\`, \`to\`, leavesbefore, leavesafter,
        
          cl, sl, el, scl
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        leaveQuery,
        [
          fid,
          date,
          typeofleaveapplied,
          noofdays,
          from,
          to,
          leavesBefore[leaveType],
          leavesAfter[leaveType],
         
          leavesAfter.cl,
          leavesAfter.sl,
          leavesAfter.el,
          leavesAfter.scl
        ],
        (err) => {
          if (err) {
            return res.render("apply-leave", {
              fid: fid,
              message: { text: "Error inserting leave data.", type: "danger" },
            });
          }

          // Update the faculty table with the decremented leave balances
          const updateFacultyQuery = `
            UPDATE facultytable 
            SET cl = ?, sl = ?, el = ?, scl = ? 
            WHERE fid = ?
          `;
          db.query(
            updateFacultyQuery,
            [leavesAfter.cl, leavesAfter.sl, leavesAfter.el, leavesAfter.scl, fid],
            (err) => {
              if (err) {
                return res.render("apply-leave", {
                  fid: fid,
                  message: { text: "Error updating faculty leave balances.", type: "danger" },
                });
              }

              res.redirect(
                `/facultyleavesinfo/leaves/leave-success?fid=${fid}&clBefore=${leavesBefore.cl}&slBefore=${leavesBefore.sl}&elBefore=${leavesBefore.el}&sclBefore=${leavesBefore.scl}&clAfter=${leavesAfter.cl}&slAfter=${leavesAfter.sl}&elAfter=${leavesAfter.el}&sclAfter=${leavesAfter.scl}`
              );
            }
          );
        }
      );
    });
  });
});


router.get("/leave-success", ensureLoggedIn, (req, res) => {
  const {
    clBefore,
    slBefore,
    elBefore,
    sclBefore,
    clAfter,
    slAfter,
    elAfter,
    sclAfter,
  } = req.query;

  res.render("leave-success", {
    message: "Leave applied successfully!",
    leaveData: {
      before: { cl: clBefore, sl: slBefore, el: elBefore, scl: sclBefore },
      after: { cl: clAfter, sl: slAfter, el: elAfter, scl: sclAfter },
    },
  });
});

function calculateDayDifference(fromDate, toDate) {
  return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
}

return router;
};
