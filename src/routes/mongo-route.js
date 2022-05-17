const router = require("express").Router();
const { mongoConnect } = require("../services/mongo");
const ObjectId = require("mongodb").ObjectId;

router.use((req, res, next) => {
  if (req.query._method === "DELETE") {
    console.log("DELETE");
    req.method = "DELETE";
    req.url = req.path;
  }

  next();
});

router.get("/", async (req, res) => {
  const db = mongoConnect();
  const fetchedTodos = await db.collection("todos").find().toArray();
  console.log(fetchedTodos);
  const todos = fetchedTodos.map((item) => ({ ID: item._id, ...item }));
  res.render("index", { model: todos });
});

router.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

router.post("/create", async (req, res) => {
  const db = mongoConnect();
  db.collection("todos")
    .insertOne({ Title: req.body.Title })
    .then((result) => {
      console.log("A todo has been added");
      res.redirect("/");
    });
});

router.get("/edit/:id", async (req, res) => {
  const db = mongoConnect();
  const id = req.params.id;
  const objId = new ObjectId(id);
  db.collection("todos")
    .findOne({ _id: objId })
    .then((result) => {
      res.render("edit", { model: result });
    });
});

router.post("/edit/:id", async (req, res) => {
  const db = mongoConnect();
  const id = req.params.id;
  const objId = new ObjectId(id);
  db.collection("todos")
    .findOneAndUpdate(
      { _id: objId },
      {
        $set: {
          Title: req.body.Title,
        },
      }
    )
    .then((result) => {
      console.log(`${id} was updated.`);
      res.redirect("/");
    });
});

router.delete("/delete/:id", async (req, res) => {
  const db = mongoConnect();
  const id = req.params.id;
  const objId = new ObjectId(id);
  db.collection("todos")
    .findOneAndDelete({ _id: objId })
    .then((result) => {
      console.log(`deleted ${id}`);
      res.redirect("/");
    });
});

module.exports = router;
