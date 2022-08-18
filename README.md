# Hands-On Exercise (2) : Build your first application with Javascript and Node JS

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/from-referrer/)

**Astra DB** includes **Stargate**, an open-source, data API layer that sits between your application and the database.

Every database you create automatically has GraphQL, REST, Document (schemaless JSON) and gRPC endpoints. Stargate automatically scales as your traffic scales. 

Datastax provides database drivers in different programming languages (e.g. Java, C++, C#,  Python and Node JS) and SDK that is available in Java, Javascript and Python.

![image](img/image1.png?raw=true)

In this exercise,   you will be using both REST API to develop the REST services using Node JS in the following steps: 
(A) Create User table in the same keyspace created in Hands-On Exercise (1).
(B) Walkthrough the codes 
(C) Test the REST services

This exercise is to show how to use REST API via Stargate in AstraDB.   Please note that this workshop is not to share how to create REST services with Node JS or coding best practices.

## Prerequisites 

Hands-On Exercise (1) must be completed. 

Libraries Required
(1) express : Express.js, or simply Express, is a back end web application framework for Node.js
(2) dotenv : Loads environment variables from .env file
(3) axios : Axios is a promise-based HTTP Client for node.js and the browser. 

The above libraries are already installed for this project. 

## Section A:  Create User Table

1. You have created your database using CQL in Hands-On Exercise 1.   In this exercise,  you will create User table using REST API. 

2. Please use the same email to login to http://astra.datastax.com to access the **shinydb** that was created in Hands-On Exercise 1.  

3. If your **shinydb** is hibernated due to inactive for 48 hrs,   please click on corresponding [**resume**] to make the database active again.  

4. Once the database is active, click on **shinydb**.  
![image](img/image2.png?raw=true)

5. Click on **Connect** tab.  In this Connect page,  details steps are provided on how to connect to Astra DB via various way.    For this exercise,  we will focus on REST API.  Click on REST API as shown below. 
![image](img/image3.png?raw=true)

6. If you have lost the token auto-generated in Hands-On Exercise 1,  click on the **here** link under the (1) of the prerequisites.   Another page is opened in another browser tab.  Click on **Role** dropdown list and select **shinydb autogenerated by Astra** and click on **Generate Token**.       
![image](img/image4.png?raw=true)

7. Please copy the client id, client secret and token for the subsequent steps.
![image](img/image5.png?raw=true)

8. Navigate back to your original browser tab with the connect tab.   Follow (2) of the prerequisites.   Open an Terminal or Command Prompt to set the environment variables. 
![image](img/image6.png?raw=true)

9. Copy and paste the following in the same Terminal / Command Prompt to create User table. 
```copy
curl --request POST \
    --url https://${ASTRA_DB_ID}-${ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces/${ASTRA_DB_KEYSPACE}/tables \
    --header 'content-type: application/json' \
    --header "x-cassandra-token: ${ASTRA_DB_APPLICATION_TOKEN}" \
    --data '{"name":"user","ifNotExists":true,"columnDefinitions": [ {"name":"id","typeDefinition":"text","static":false}, {"name":"username","typeDefinition":"text","static":false}, {"name":"department","typeDefinition":"text","static":false}],"primaryKey": {"partitionKey":["id"]},"tableOptions":{"defaultTimeToLive":0}}'

```

10. Click on **CQL Console** tab.   Execute **use shiny;** and **describe user;** to verify the **User** table is created.    
![image](img/image7.png?raw=true)

## Section B: Walkthrough the codes 

1. app.js contains the source codes for this application. 

2. The code below is to create the base url of the REST API to connect to Astra DB.   It returns the base URL for particular table. The properties will be configured later. 
```
function getBaseURL(table) {
    var path = 'https://'.concat(process.env.ASTRA_DB_ID).concat('-').concat(process.env.ASTRA_DB_REGION)
    path = path.concat('.apps.astra.datastax.com/api/rest/v2/keyspaces/').concat(process.env.ASTRA_DB_KEYSPACE).concat('/')
    path = path.concat(table)
    return path
 }
```

3. The application server is start with port 8081.  The application is accessible via http://localhost:8081
```
var server = app.listen(8081, function () {
    var host = "localhost"
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })
```

4. The code below is to add row (e.g. add new user) into the user table. 
```
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

```

5. The code below is to retrieve row from the user table. 
```
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
```

6. The code below is to update row (e.g. update user) in the user table. 
```
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
```

7. The code below is to delete row (e.g. delete user) from the user table. 
```
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
```

## Section C: Test the REST services

1. Click on the icon below to access GitPod.   

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/likhia/DataStaxWorkshop1Exercise2.git)
   
ℹ️ _It may take minutes (approx. 3-5) for GitPod to fully initialize._

2. Create a new file named as **.env** under the root folder.   Copy and paste the properties from .env.example and set its value from the Console tab and also the token from the generated token. 

3. These properties will be used by this application to connect to Astra DB.  

4. To run,  type **node app.js**

5. To create a new user,   execute the commands below. 
```copy
curl --request POST \
     --url http://localhost:8081/add \
     --header 'Accept: application/json' \
     --header 'Content-Type: application/json' \
     --data '{"id":"User1", "name" :"User 1", "dept": "Department 1"}'
```

6. To retrieve the newly created user, execute the commands below.  
```copy
curl "http://localhost:8081/get?id=User1"
```

7. To update the user, execute the commands below. 
```copy
curl --request PUT \
     --url http://localhost:8081/update \
     --header 'Accept: application/json' \
     --header 'Content-Type: application/json' \
     --data '{"id":"User1", "name" :"Chloe", "dept": "HR"}'
```

8. To delete the user, execute the commands below.
```copy 
curl --request DELETE \
     --url "http://localhost:8081/delete?id=User1"
```     
