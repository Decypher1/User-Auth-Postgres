const express = require ('express')
const PORT = 3000
const app = express()

app.get('/', (req, res) => {
    res.status(200).send('Hello, World!')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
