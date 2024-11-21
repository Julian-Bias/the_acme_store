const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

//get users
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

// get products
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

//get user favorites
app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

//post to favorites requiring product id
app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).send({ error: "Product ID is required" });
    }
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

//delete a favorite
app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

//error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: "Internal Server Error" });
});

const init = async () => {
  await client.connect();
  console.log("connected to database");

  await createTables();
  console.log("tables created");

  const [julian, mark, woody, blakelee, consoles, computers, toys, animals] =
    await Promise.all([
      createUser({ username: "julian", password: "password1" }),
      createUser({ username: "mark", password: "password2" }),
      createUser({ username: "woody", password: "password3" }),
      createUser({ username: "blakelee", password: "password4" }),
      createProduct({ name: "consoles" }),
      createProduct({ name: "computers" }),
      createProduct({ name: "toys" }),
      createProduct({ name: "animals" }),
    ]);

  const favorites = await Promise.all([
    createFavorite({ user_id: julian.id, product_id: consoles.id }),
    createFavorite({ user_id: julian.id, product_id: toys.id }),
    createFavorite({ user_id: mark.id, product_id: consoles.id }),
    createFavorite({ user_id: mark.id, product_id: computers.id }),
    createFavorite({ user_id: mark.id, product_id: animals.id }),
    createFavorite({ user_id: woody.id, product_id: computers.id }),
    createFavorite({ user_id: woody.id, product_id: toys.id }),
    createFavorite({ user_id: blakelee.id, product_id: animals.id }),
  ]);

  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
