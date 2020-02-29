module.exports = {
    server: {
        port: 3000,
        imagesUpload: {
            host: '127.0.0.1',
            port: process.env.PORT || this.port,
            path: '/',
            method: 'POST',
            headers:{
                'Content-Type' : 'multipart/form-data'
            },
            body: {
                "data": {},
                "meta":{"host": "https://blooming-sea-23689.herokuapp.com/"}
            }
        }
    }
};