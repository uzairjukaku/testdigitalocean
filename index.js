const express = require('express');
const app = express();
const port = 3000;


app.get('/',(req,res)=>{


res.send('get method')
})

app.listen(process.env.PORT, () => {


    console.log('server is running on port ' + port);

})