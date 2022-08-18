var express = require('express');
var app = express();
app.use(express.json());

require('dotenv').config();

function getBaseURL(table) {
    var path = 'https://'.concat(process.env.ASTRA_DB_ID).concat('-').concat(process.env.ASTRA_DB_REGION)
    path = path.concat('.apps.astra.datastax.com/api/rest/v2/keyspaces/').concat(process.env.ASTRA_DB_KEYSPACE).concat('/')
    path = path.concat(table)
    return path
 }

 app.get('/get', function(request,response) {
    const axios = require('axios');

    var baseUrl = getBaseURL('user').concat('/').concat(request.query.id)  

    const headerOptions = {
        headers: { 'Content-Type': 'application/json', 
                    'x-cassandra-token': process.env.ASTRA_DB_APPLICATION_TOKEN
         },
    }

    axios
    .get(baseUrl,headerOptions)
    .then(res => {
        //console.log('statusCode: ${res.status}');
        console.log(res.data);
        response.send(res.data)
    })
    .catch(error => {
        console.error(error);
        response.send(error)
    });

 })

 app.post('/add', function(request, response) {
    const axios = require('axios')

    const userObject = {
        id: request.body.id,
        username: request.body.name,
        department: request.body.dept
    }

    const headerOptions = {
        headers: { 'Content-Type': 'application/json', 
                    'x-cassandra-token': process.env.ASTRA_DB_APPLICATION_TOKEN
         },
    }

    axios
    .post(getBaseURL('user'), userObject, headerOptions)
    .then((res) => {
        if (res.status === 201) {
        console.log('Request body :', res.data)
        console.log('Request header :', res.headers)
        response.send(res.data)
        }
    })
    .catch((e) => {
        console.error('Error occurred : ' + e)
    })
 })
 
 app.put('/update', function(request, response) {
  
    const axios = require('axios')

    const userObject = {
        username: request.body.name,
        department: request.body.dept
    }
    
    var baseUrl = getBaseURL('user').concat('/').concat(request.body.id)  

    const headerOptions = {
        headers: { 'Content-Type': 'application/json', 
                    'x-cassandra-token': process.env.ASTRA_DB_APPLICATION_TOKEN
         },
    }

    axios
    .put(baseUrl, userObject, headerOptions)
    .then((res) => {
        if (res.status === 200) {
        console.log('Request body :', res.data)
        console.log('Request header :', res.headers)
        response.send(res.data)
        }
    })
    .catch((e) => {
        console.error('Error occurred : ' + e)
    })
 })

 app.delete('/delete', function(request,response) {
    const axios = require('axios');

    var baseUrl = getBaseURL('user').concat('/').concat(request.query.id)  

    const headerOptions = {
        headers: { 'Content-Type': 'application/json', 
                    'x-cassandra-token': process.env.ASTRA_DB_APPLICATION_TOKEN
         },
    }
    axios
    .delete(baseUrl,headerOptions)
    .then(res => {
        console.log(res.data);
        response.send(res.data)
    })
    .catch(error => {
        console.error(error);
        response.send(error)
    });

 })


var server = app.listen(8081, function () {
    var host = "localhost"
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })