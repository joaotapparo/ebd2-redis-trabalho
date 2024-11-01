import { ResultSetHeader, RowDataPacket } from "mysql2";
import { conn, redis } from "./db";
import { Product } from "./product";

export class ProductsRepository {
  // retorna todos os produtos
  async getAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      redis.get("products:all", (err, cachedProducts) => {
        if (err) return reject(err);
        if (cachedProducts) {
          return resolve(JSON.parse(cachedProducts));
        }

        conn.query<RowDataPacket[]>("SELECT * FROM PRODUCTS", (err, res) => {
          if (err) return reject(err);

          // mapeia os resultados para um array de produtos
          const products: Product[] = res.map((row) => ({
            id: row.id,
            name: row.name,
            price: row.price,
            description: row.description,
          }));

          // armazena os produtos no cache
          redis.set("products:all", JSON.stringify(products), "EX", 3600);
          resolve(products);
        });
      });
    });
  }

  // retorna um produto pelo id
  async getById(product_id: number): Promise<Product | undefined> {
    return new Promise((resolve, reject) => {
      redis.get(`product:${product_id}`, (err, cachedProduct) => {
        if (err) return reject(err);
        if (cachedProduct) {
          return resolve(JSON.parse(cachedProduct));
        }

        conn.query<RowDataPacket[]>(
          "SELECT * FROM PRODUCTS WHERE id = ?",
          [product_id],
          (err, res) => {
            if (err) return reject(err);

            // converte a linha em um produto
            const product =
              res.length > 0
                ? {
                    id: res[0].id,
                    name: res[0].name,
                    price: res[0].price,
                    description: res[0].description,
                  }
                : undefined;

            // armazena o produto no cache
            if (product) {
              redis.set(
                `product:${product_id}`,
                JSON.stringify(product),
                "EX",
                3600
              );
            }
            resolve(product);
          }
        );
      });
    });
  }

  // cria um novo produto
  create(p: Product): Promise<Product> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "INSERT INTO PRODUCTS (name, price, description) VALUES(?,?,?)",
        [p.name, p.price, p.description],
        (err, res) => {
          if (err) return reject(err);
          this.getById(res.insertId)
            .then((product) => {
              // adiciona o produto ao cache após a criação
              redis.set(`product:${res.insertId}`, JSON.stringify(product));
              resolve(product!);
            })
            .catch(reject);
        }
      );
    });
  }

  // atualiza um produto existente
  update(p: Product): Promise<Product | undefined> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "UPDATE PRODUCTS SET name = ?, price = ?, description = ? WHERE id = ?",
        [p.name, p.price, p.description, p.id],
        (err, res) => {
          if (err) return reject(err);
          this.getById(p.id!)
            .then((product) => {
              // Atualiza o produto no cache após a atualização
              redis.set(`product:${p.id}`, JSON.stringify(product));
              resolve(product);
            })
            .catch(reject);
        }
      );
    });
  }

  // exclui um produto
  delete(product_id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "DELETE FROM PRODUCTS WHERE id = ?",
        [product_id],
        (err, res) => {
          if (err) return reject(err);
          // Remove o produto do cache após a exclusão
          redis.del(`product:${product_id}`);
          resolve(res.affectedRows);
        }
      );
    });
  }

  // inicializa o cache
  async initCache(): Promise<void> {
    const products = await this.getAll();
    await redis.set("products:all", JSON.stringify(products), "EX", 3600);
  }
}
