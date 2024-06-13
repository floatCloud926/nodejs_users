const express = require("express");
const app = express();
const webToken = require("jsonwebtoken");
const { expressjwt: jwt } = require("express-jwt");
const secretKey = "generate-token";
const bodyParser = require("body-parser");
const db = require("./db");
// 解决跨域问题
const cors = require("cors");
app.use(cors());
// 获取前端传递过来的body参数
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 设置除登录页以外，都需认证token
app.use(
  jwt({
    secret: secretKey,
    algorithms: ["HS256"],
  }).unless({ path: ["/login"] })
);

// 登录
app.post("/login", (req, res) => {
  if (req.body.username !== "admin" || req.body.password !== "123456") {
    return res.status(201).json({ status:201,message:'用户名或密码错误' });
  }
  // '10000'（字符串）以ms为单位
  // 60(数值)以s为单位
  // Eg: 60, "2 days", "10h", "7d"
  let tokenStr = webToken.sign({ username: req.body.username }, secretKey, {
    expiresIn: '10h',
  });
  res.send({
    status: 200,
    message: "登录成功",
    token: tokenStr,
  });
});


// 获取用户分页
app.get("/user", (req, res) => {
  try {
    let { pageNum, pageSize, name } = req.query;
    name = name ? name : "";
    db.query(
      `select COUNT(*) as total from user where name like '%${name}%'`,
      (err, countRes) => {
        let total = countRes[0].total;
        // ORDER BY id desc
        db.query(
          `select id,name,gender,birthday from user where name like '%${name}%'  limit ${
            (pageNum - 1) * pageSize
          },${pageSize}`,
          (err, userRes) => {
            res.status(200).json({ rows: userRes, total });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 获取用户详情
app.get("/user/:id", (req, res) => {
  try {
    let { id } = req.params;
    db.query(`select id,name,gender,birthday from user where id = ${id}`, (err, detailRes) => {
      res.status(200).json(detailRes[0]);
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 新增用户
app.post("/user", (req, res) => {
  try {
    const { name, gender ,birthday} = req.body;
    // console.log(name,gender);
    db.query(
      `insert into user(name,gender,birthday) values ('${name}','${gender}','${birthday}')`,
      (err, handleRes) => {
        res.status(200).json({ message: "新增成功" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// 修改用户
app.put("/user", (req, res) => {
  try {
    const { id, name, gender,birthday } = req.body;
    db.query(
      `update user set name = '${name}' ,gender = '${gender}',birthday = '${birthday}' where id = ${id}`,
      (err, handleRes) => {
        res.status(200).json({ message: "修改成功" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// 删除用户
app.delete("/user/:id", (req, res) => {
  try {
    let { id } = req.params;
    db.query(`delete from user where id = ${id}`, (err, detailRes) => {
      res.status(200).json({ message: "删除成功" });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 服务运行在本地3300端口
app.listen(3300, () => {
  console.log("服务运行在 http://localhost:3300");
});
 
