import express from "express";
import { Request, Response, Router } from "express";
import { ProductsRepository } from "./ProductsRepository";
import { Product } from "./product"; // certifique-se de que o caminho esteja correto

const app = express();
const port = 3000;
const routes = Router();

const productsRepo = new ProductsRepository();

// middleware para processar o json
app.use(express.json());

(async () => {
  // inicializa o cache ao iniciar o servidor
  await productsRepo.initCache();
})();

// rota principal
routes.get("/", (req: Request, res: Response) => {
  res.status(200).send("voce foi avisado");
});

// rota para obter todos os produtos
routes.get("/getAllProducts", async (req: Request, res: Response) => {
  const products = await productsRepo.getAll();
  res.status(200).type("application/json").send(products);
});

// rota para adicionar um produto
routes.post("/addProduct", async (req: Request, res: Response) => {
  const newProduct: Product = {
    name: req.body.name as string,
    price: parseFloat(req.body.price as string),
    description: req.body.description as string,
  };

  try {
    const createdProduct = await productsRepo.create(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// aplica as rotas na aplicação web backend
app.use(routes);

// inicia o servidor
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
