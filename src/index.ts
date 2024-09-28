import express, { Request, Response } from "express";
import mysql from "mysql2/promise";

const app = express();

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));

app.get('/categories', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT id, name, DATE_FORMAT(created_at, '%d/%m/%Y') AS created_at FROM categories");
    return res.render('categories/index', {
        categories: rows
    });
});

app.get('/', async function (req: Request, res: Response) {
    return res.render("home/index");
});

app.get("/categories/form", async function (req: Request, res: Response) {
    return res.render("categories/form");
});

app.post("/categories/save", async function (req: Request, res: Response) {
    const body = req.body;
    const insertQuery = "INSERT INTO categories (name) VALUES (?)";
    await connection.query(insertQuery, [body.name]);

    res.redirect("/categories");
});

app.post("/categories/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
});


app.get('/users', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT id, name, email, papel, DATE_FORMAT(created_at, '%d/%m/%Y') AS created_at FROM users");
    return res.render('users/index', {
        users: rows
    });
});

app.get("/users/form", function (req: Request, res: Response) {
    return res.render("users/form");
});

app.post("/users/save", async function (req: Request, res: Response) {
    const body = req.body;
    if (body.ativo == "on")
        body.ativo = 1;

    else body.ativo = 0;
    console.log(body);
    const insertQuery = "INSERT INTO users (name, email, senha, papel, ativo) VALUES (?, ?, ?, ?, ?)";
    await connection.query(insertQuery, [body.name, body.email, body.senha, body.papel, body.ativo]);

    res.redirect("/users");
});

app.post("/users/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/users");
});

app.get("/conta/login", function (req: Request, res: Response) {
    return res.render("conta/login");
});

app.post("/conta/login", async function (req: Request, res: Response) {
    const body = req.body
    console.log(body);
    const insertQuery = "SELECT * FROM users WHERE email = ? and senha = ?"
    const [rows] = await connection.query(insertQuery, [body.email, body.senha]);
    const usuario = rows[0] == null ? null : rows[0];

    if (usuario != null) {
        if (usuario.papel == "administrador") {
            return res.redirect("/users");
        } else {
            return res.redirect("/");
        }
    } else {
        return res.redirect("/conta/login");
    }


});

app.listen('3000', () => console.log("Server is listening on port 3000"));