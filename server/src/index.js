const ascii = '8 8888      88 8 888888888o   8 8888         8 888888888o.\n8 8888      88 8 8888    `88. 8 8888         8 8888    `^888.\n8 8888      88 8 8888     `88 8 8888         8 8888        `88.\n8 8888      88 8 8888     ,88 8 8888         8 8888         `88\n8 8888      88 8 8888.   ,88' 8 8888         8 8888          88\n8 8888      88 8 888888888P'  8 8888         8 8888          88\n8 8888      88 8 8888         8 8888         8 8888         ,88\n` 8888     ,8P 8 8888         8 8888         8 8888        ,88'\n  8888, d8P  8 8888         8 8888         8 8888, o88P'\n   `Y88888P'   8 8888         8 888888888888 8 888888888P'\n';
console.log(ascii);

start = () => {
    const express = require('express');
    const app = express();

    // You can change the port by modifying the PORT enviornment variable in the Dockerfile
    const port = process.env.PORT || 80;

    const AWS = require('aws-sdk');
    const useragent = require('express-useragent');

    const config = require('../config.json');

    const s3 = new AWS.S3({
        accessKeyId: config['s3-access-id'],
        secretAccessKey: config['s3-access-key']
    });

    const fileUpload = require('express-fileupload');

    app.use(express.json());
    app.use(fileUpload());
    app.use(useragent.express());

    const session = require('express-session');
    const MongoDBStore = require('connect-mongodb-session')(session);

    var store = new MongoDBStore({
        uri: config.mongoURL,
        collection: 'sessions'
    });

    store.on('error', (error) => {
        console.log(error);
    });

    const path = require('path')

    const ApiRouter = require('./routers/ApiRouter');
    const UserRouter = require('./routers/UserRouter');

    const rateLimit = require('express-rate-limit');

    const isDev = true;

    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: 'You have exceeded the maximum amount of requests for your IP.',
    });

    const bLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 25000,
        message: 'You have exceeded the maximum amount of requests for your IP.',
    });

    const rfLimiter = rateLimit({
        windowMs: 30 * 60 * 1000,
        max: 5,
        message: 'Please wait up to 30 minutes to send another report or feedback!',
    });

    const uploadLimiter = rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 50,
        message: 'Please wait up to another 5 minutes to upload another image!',
    });

    app.use('/*', bLimiter); // General limiter
    app.use('/api/v1', apiLimiter);
    app.use('/api/v1/createReport', rfLimiter);
    app.use('/api/v1/createFeedback', rfLimiter);
    app.use('/upload', uploadLimiter);

    var mongoose = require('mongoose');

    // Connect to MongoDB
    mongoose.connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

    const con = mongoose.connection;

    con.on('error', console.error.bind(console, 'connection error:'));
    con.once('open', () => {
        console.log('MongoDB connected');
    });

    app.use(require('express-session')({
        secret: config.expressSessionSecret,
        cookie: {
            maxAge: (1825 * 86400 * 1000) // 1 week
        },
        store: store,
        resave: false,
        saveUninitialized: false
    }));

    app.get('/', (req, res) => {
        // This is for one of my friends just keep it
        if (req.hostname === 'sailor-is-my.world') {
            res.redirect('https://love.sailor-is-my.world');
            return;
        }

        if (!isDev) {
            if (req.hostname !== 'upld.live') {
                res.redirect('https://upld.live');
                return;
            }
        }

        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });

    const BuildModel = require('./models/BuildModel');
    app.get('/api/v1/buildID', (req, res) => {
        BuildModel.findOne({}, null, { sort: { compilationDate: -1 } }, (err, build) => {
            if (err) {
                res.json({
                    success: false,
                });
                return false;
            }

            return res.json({
                build
            });
        });
    });

    app.use(express.static(path.join(__dirname, '..', 'build'), { extensions: ['html', 'htm'] }));

    new ApiRouter(app, con);
    new UserRouter(app, con, s3);

    app.get('/dashboard', (req, res) => {
        if (!isDev) {
            if (req.hostname !== 'upld.live') {
                res.redirect('https://upld.live/dashboard');
                return;
            }
        }

        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });

    app.get('/dashboard/*', (req, res) => {
        if (!isDev) {
            if (req.hostname !== 'upld.live') {
                res.redirect('https://upld.live/dashboard/');
                return;
            }
        }

        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });

    const FileModel = require('./models/FileModel');
    const UserModel = require('./models/UserModel');

    app.get('/:img', (req, res) => {
        let imgId = req.params.img.split('.')[0];

        FileModel.findOne({ id: imgId }, (err, file) => {
            if (err) {
                res.status(404).sendFile(path.join(__dirname, '404.html'));
                return false;
            }

            if (file) {
                if (req.hostname !== file.domain) {
                    res.status(404).sendFile(path.join(__dirname, '404.html'));
                    return false;
                }

                if (!req.useragent.isBot) {
                    file.views += 1;
                    file.save();
                }

                if (file.extension === 'png' || file.extension === 'jpg' || file.extension === 'webp' || file.extension === 'gif') {
                    let ext = file.extension;
                    UserModel.findOne({ username: file.uploader }, (err, user) => {
                        if (user.isEmbed) {
                            res.send(
                                genHtml(file, req.hostname, user)
                            );
                            return true;
                        } else {
                            res.sendFile(path.join(__dirname, 'store', 'files', imgId + '.' + ext));
                        }
                    });
                } else {
                    res.sendFile(path.join(__dirname, 'store', 'files', imgId + '.' + file.extension));
                }
            } else {
                res.status(404).sendFile(path.join(__dirname, '404.html'));
                return false;
            }
        });
    });

    app.get('/:img/thumb', (req, res) => {
        let imgId = req.params.img.split('.')[0];

        FileModel.findOne({ id: imgId }, (err, file) => {
            if (err) {
                res.status(404).sendFile(path.join(__dirname, '404.html'));
                return false;
            }

            if (file) {
                if (req.hostname !== file.domain) {
                    res.status(404).sendFile(path.join(__dirname, '404.html'));
                    return false;
                }

                if (!req.useragent.isBot) {
                    file.views += 1;
                    file.save();
                }

                res.sendFile(path.join(__dirname, '..', 'store', 'files', imgId + '.' + file.extension));
            } else {
                res.status(404).sendFile(path.join(__dirname, '404.html'));
                return false;
            }
        });
    });

    genHtml = (upload, domain, user) => {
        let imgURL = `https://${domain}/${upload.id}/thumb`;

        let html = `
        <html>
            <head>
                <title>upld.live - ${upload.id}</title>
                <base href="/">
                <meta charset="utf-8">
                <meta name="robots" content="noindex">
                <meta name="viewport" content="width=device-width, minimum-scale=0.1">
                <meta property="twitter:card" content="summary_large_image">
                <meta property="og:url" content="${imgURL}">
                <meta property="og:title" content="${upload.originalName}">
                <meta property="og:description" content="Uploaded by ${user.username} on ${upload.dateCreated.toLocaleString()}">
                <meta property="og:image" content="${imgURL}">
                <meta property="og:image:type" content="image/png" />
                <meta name="theme-color" content="#${user.embedColor}">

                <link rel="preconnect" href="https://fonts.gstatic.com">
                <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300&display=swap" rel="stylesheet">

                <style>
                    html {
                        height: 100%;
                        width: 100%;
                        background: #0e0e0e;
                        display: table-cell;
                        vertical-align: middle;
                        text-align: center;
                        font-family: 'Source Sans Pro', sans-serif;
                    }

                    .image {
                        max-width: 80%;
                        max-height: 70vh;
                        position: relative;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                    footer {
                        position: fixed;
                        left: 0px;
                        bottom: 0px;
                        height: 30px;
                        width: 100%;
                        color: #E1E1E1;
                    }

                    a, a:hover, a:visited, a:active{
                        text-decoration:none;
                        color: rgb(79, 188, 255);
                    }
                </style>
            </head>
            
            <body>
                <a href="${imgURL}">
                    <img class="image" src="${imgURL}"/>
                </a>

                <footer>
                    <a href="https://upld.live">upld.live</a>
                </footer>
            </body>
        </html>
    `;

        return html;
    }
    app.listen(port, () => {
        console.log('upld backend started. API: https://upld.live/api/v1');
    });
}

try {
    start();
} catch (e) {
    console.error('Error starting upld server.', e);
}