import { ResultSetHeader, RowDataPacket } from "mysql2";
import { conn, redis } from "./db";
import { Product } from "./product";

export class ProductsRepository {
  // Ajuste o tipo de retorno para RowDataPacket
  async getAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      conn.query<RowDataPacket[]>("SELECT * FROM PRODUCTS", (err, res) => {
        if (err) return reject(err);

        // Mapeie os resultados para Product[]
        const products: Product[] = res.map((row) => ({
          id: row.id,
          name: row.name,
          price: row.price,
          description: row.description,
        }));
        resolve(products);
      });
    });
  }

  async getById(product_id: number): Promise<Product | undefined> {
    return new Promise((resolve, reject) => {
      conn.query<RowDataPacket[]>(
        "SELECT * FROM PRODUCTS WHERE id = ?",
        [product_id],
        (err, res) => {
          if (err) return reject(err);

          // Converta a linha em Product
          const product =
            res.length > 0
              ? {
                  id: res[0].id,
                  name: res[0].name,
                  price: res[0].price,
                  description: res[0].description,
                }
              : undefined;
          resolve(product);
        }
      );
    });
  }

  create(p: Product): Promise<Product> {
    return new Promise((resolve, reject) => {
      conn.query<ResultSetHeader>(
        "INSERT INTO PRODUCTS (name, price, description) VALUES(?,?,?)",
        [p.name, p.price, p.description],
        (err, res) => {
          if (err) return reject(err);
          this.getById(res.insertId)
            .then((product) => {
              // Adiciona o produto ao cache após a criação
              redis.set(`product:${res.insertId}`, JSON.stringify(product));
              resolve(product!);
            })
            .catch(reject);
        }
      );
    });
  }

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

  async initCache(): Promise<void> {
    const products = await this.getAll();
    await redis.set("products:all", JSON.stringify(products), "EX", 3600);
  }
}
