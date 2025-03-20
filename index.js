//import express
const express = require('express')

//init app
const app = express()

const cors = require('cors');

const bodyParser = require('body-parser');

const path = require('path')

//define port
const port = 3000;

const router = require('./routes')
app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.use('/api', router);

app.get('/uploads/:filename', (req,res) => {
    res.sendFile(path.join(__dirname, 'uploads' , req.params.filename))
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});