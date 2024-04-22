import express, { static as expressStatic } from "express";
import bodyParser from "body-parser";
import { engine } from 'express-handlebars';
import { routes } from "./routes";
import { fetchAndSendAllFeeds } from "./fetch-and-send-all-feeds";
import { forever } from "./forever";
import { PORT } from "./env";

const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', 'src/pages');

app.use(expressStatic("node_modules/rfc4648/lib"));
app.use(bodyParser.json({ type: "application/activity+json" }));

app.use(routes);

app.get('/', (req, res) => {
  res.render('index');
});

app.use("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

forever(1000 * 60 * 15, fetchAndSendAllFeeds);
