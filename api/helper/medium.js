const { QUERY_DEBUG } = require("../config/configuration");
const Medium = () => {};

Medium.logQuery = (op) => {
  if (QUERY_DEBUG) {
    var message_string = `[PARTH SERVICE-DB LOG][${new Date().toLocaleString()}]-- ${
      op.sql
    }(${op.values})`;
    console.warn(message_string);
  }
};
// Formate where clause from json object passed by user : Parth Patel
Medium.formatWhere = (params) => {
  const constraints = [];
  const data = [];
  Object.keys(params).forEach((item) => {
    if (!params[item] || params[item] == "") {
      return;
    }
    if (Array.isArray(params[item])) {
      constraints.push(`${item} in (?)`);
      data.push(params[item]);
    } else if (
      typeof params[item] === "string" &&
      params[item].indexOf(",") > -1
    ) {
      constraints.push(`${item} in (?)`);
      data.push(params[item].split(","));
    } else if (params[item] instanceof RegExp) {
      constraints.push(`${item} REGEXP ?`);
      data.push(params[item]);
    } else if (params[item] && typeof params[item] === "object") {
      Object.keys(params[item]).forEach((value) => {
        if (value === "$gte") {
          constraints.push(`${item} >= ?`);
          data.push(params[item][value]);
        } else if (value === "$lte") {
          constraints.push(`${item} <= ?`);
          data.push(params[item][value]);
        } else if (value === "$gt") {
          constraints.push(`${item} > ?`);
          data.push(params[item][value]);
        } else if (value === "$lt") {
          constraints.push(`${item} < ?`);
          data.push(params[item][value]);
        } else if (value === "$like") {
          if (Array.isArray(params[item][value])) {
            const localConstraints = [];
            params[item][value].forEach((likeValues) => {
              localConstraints.push(`${item} LIKE ?`);
              data.push(`%${likeValues}%`);
            });
            constraints.push(`(${localConstraints.join(" OR ")})`);
          } else if (
            typeof params[item][value] === "string" &&
            params[item][value].indexOf(",") > -1
          ) {
            const localConstraints = [];
            params[item][value] = params[item][value].split(",");
            params[item][value].forEach((likeValues) => {
              localConstraints.push(`${item} LIKE ?`);
              data.push(`%${likeValues}%`);
            });
            constraints.push(`(${localConstraints.join(" OR ")})`);
          } else {
            constraints.push(`${item} LIKE ?`);
            data.push(`%${params[item][value]}%`);
          }
        }
      });
    } else {
      constraints.push(`${item} = ?`);
      data.push(params[item]);
    }
  });
  var constraints_string = "";
  if (constraints.length > 0) {
    constraints_string = " WHERE " + constraints.join(" AND ");
  }
  return { constraints_string, data };
};

// Remove unknown columns using white list : Parth Patel
Medium.senetizeList = (white_list = [], list = {}) => {
  var senetizedlist = {};

  if (Array.isArray(list)) {
    list.map((column, index) => {
      if (white_list.includes(column)) {
        senetizedlist[column] = list[column];
      } else {
        Medium.warn(`Unknown column(${column}) found while senetizing`);
      }
    });
  } else if (typeof list === "object") {
    Object.keys(list).map((column, index) => {
      if (white_list.includes(column)) {
        senetizedlist[column] = list[column];
      } else {
        Medium.warn(`Unknown column(${column}) found while senetizing`);
      }
    });
  } else {
    Medium.warn("Invalid list for senetize.");
  }
  return senetizedlist;
};

// formate select(*) fields for select statements : Parth Patel
Medium.formateFiledsStatement = (fields) => {
  var field_list = [];
  var field_string = "";
  if (Array.isArray(fields)) {
    fields.map((column, index) => {
      field_list.push(column);
    });
  } else if (typeof fields === "object") {
    Object.keys(fields).map((column, index) => {
      field_list.push(column);
    });
  } else {
  }
  if (field_list.length > 0) {
    field_string = field_list.join(",");
  } else {
    field_string = "*";
  }
  return field_string;
};

// WARNINING MESSAGE : PARTH PATEL
Medium.warn = (message) => {
  var message_string = `[PARTH SERVICE][${new Date().toLocaleString()}]-- ${message}`;
  console.warn(message_string);
};

Medium.sendResponse = ({ req, res, data = [], message, status_code = 200 }) => {
  console.log(`Resposne sending with ${status_code}`);
  var response = {
    status_code: status_code,
    message: message,
    data: {
      data_length: Array.isArray(data) ? data.length : 0,
      result: data,
    },
  };

  res.status(status_code).send(response).end();
  
};

module.exports = Medium;
