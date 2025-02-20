const express = require('express');
const routes = require('./src/routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Srcap API");
});

app.use('/api/v1', routes);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => console.log(`app listening on port ${port}`));
}

module.exports = app;