const bcrypt = require('bcrypt');
const errMsg = 'An error occured, please try again';

const config = require("../../config.json");

const UserModel = require('../models/UserModel');
const FileModel = require('../models/FileModel');
const AuditModel = require('../models/AuditModel');

class UserRouter {
    constructor(app, db, s3) {
        try {
            this.login(app, db);
            this.logout(app, db);
            this.isLoggedIn(app, db);
            this.createUser(app, db);
            this.isUserUpgraded(app, db);
            this.getUploads(app, db);
            this.uploadProfilePicture(app, db, s3);
            // this.changePassword(app, db);

            this.userStats(app, db);
            this.mostViewedUpload(app, db);

            this.toggleEmbed(app, db);
            this.isEmbed(app, db);

            this.changeColor(app, db);
            this.getColor(app, db);

            this.getRecentAudits(app, db);
        } catch (e) {
            console.log('An error has been caught from the UserRouter. Exception: ' + e);
        }
    }

    getRecentAudits(app, db) {
        app.post('/api/v1/user/recentAudits', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    AuditModel.find({ user: user._id }, null, { sort: { date: -1 }, limit: 30 }, (err, audits) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: 'An error occured. Please try again'
                            });
                            return false;
                        }

                        if (audits) {
                            res.json(audits);
                            return true;
                        } else {
                            res.json({
                                noAudits: true,
                            });
                            return false;
                        }
                    });
                } else {
                    return res.json({
                        success: false,
                        error: 'User does not exist, please try again!'
                    });
                }
            });
        });
    }

    mostViewedUpload(app, db) {
        app.post('/api/v1/user/vUpload', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    let username = user.username;

                    FileModel.findOne({ uploader: username }, null, { sort: { views: -1 } }, (err, file) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: 'An error occured. Please try again'
                            });
                            return false;
                        }

                        if (file === undefined || file === null) {
                            res.send(JSON.stringify({
                                noUpload: true
                            }));
                            return false;
                        }

                        res.send(JSON.stringify(file));
                        return true;
                    });
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist. Please try again'
                    });
                    return false;
                }
            });
        });
    }

    isEmbed(app, db) {
        app.post('/api/v1/user/isEmbed', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured please try again later'
                    });
                    return false;
                }

                if (user) {
                    let isEmbed = user.isEmbed;

                    res.end(JSON.stringify({
                        success: true,
                        isEmbed
                    }));
                    return true;
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist please try again.'
                    });
                    return false;
                }
            });
        });
    }

    toggleEmbed(app, db) {
        app.post('/api/v1/user/toggleEmbed', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured please try again later'
                    });
                    return false;
                }

                if (user) {
                    let isEmbed = !user.isEmbed;
                    let username = user.username;

                    user.isEmbed = isEmbed;
                    user.save();
                    this.audit(username, config.audit.toggleEmbed, `User ${isEmbed ? "is now embedding images" : "is no longer embedding images"}`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                    res.end(JSON.stringify({
                        success: true,
                        isEmbed
                    }));
                    return true;
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist please try again.'
                    });
                    return false;
                }
            });
        });
    }

    changeColor(app, db) {
        app.post('/api/v1/user/changeColor', (req, res) => {
            let color = req.body.color;
            let key = req.body.key;

            if (key === undefined || color === undefined) {
                res.json({
                    success: false,
                    error: 'Invalid Request'
                });
                return false;
            }

            if (color.match(/([a-fA-F0-9])/g).length !== 6) {
                res.json({
                    success: false,
                    error: 'Hex code is invalid. Please try again'
                });
                return false;
            }

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    user.embedColor = color;
                    user.save();

                    this.audit(user.username, config.audit.changeColor, `User changed their color to ${color}`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                    res.end(JSON.stringify({
                        success: true,
                        color
                    }));
                    return true;
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist. Please try again'
                    });
                    return false;
                }
            });
        });
    }

    getColor(app, db) {
        app.post('/api/v1/user/getColor', (req, res) => {
            let key = req.body.key;

            if (key === undefined) {
                res.json({
                    success: false,
                    error: 'Invalid request'
                });
                return false;
            }

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error occured. Please try again'
                    });
                    return false;
                }

                if (!user) {
                    res.json({
                        success: false,
                        error: 'User doesnt exist, please try again.'
                    });
                    return false;
                }

                res.end(JSON.stringify({
                    success: true,
                    color: user.embedColor
                }));
                return true;
            });
        });
    }

    userStats(app, db) {
        app.post('/api/v1/user/stats', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    if (user.isTerminated) {
                        res.end(JSON.stringify({
                            success: false,
                            error: 'This user is permanently banned. Contact Runabox#0001 on discord for more information.'
                        }));
                        return false;
                    }

                    let username = user.username;

                    FileModel.find({ uploader: username }, (err, files) => {
                        if (err)
                            return res.json({ success: false, error: errMsg });

                        if (files === undefined) {
                            return res.json({ success: false, error: 'User has no files!' })
                        }

                        let amountOfFiles = files.length;
                        let views = 0;
                        files.forEach(file => {
                            views += file.views;
                        });

                        let lastUpload = files.length === 0 ? undefined : files[files.length - 1].dateCreated;

                        res.send(JSON.stringify({
                            success: true,
                            files: amountOfFiles,
                            views,
                            lastUpload
                        }));
                    });
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist. Please try again'
                    });
                    return false;
                }
            });
        });
    }

    createUser(app, db) {
        app.post('/api/v1/user/create', async (req, res) => {
            let username = req.body.username;
            let pswrd = req.body.password;
            let email = req.body.email;
            let secretKey = this.makeSecret();
            let userAgent = req.get('User-Agent');
            let ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress);

            /*
                Check if the username provided already exists in the db
            */
            let b = false;
            await UserModel.findOne({ username }, (err, user) => {
                if (user && user !== (undefined || null)) {
                    b = true;
                }
            });

            if (b) {
                res.json({
                    success: false,
                    error: 'There is already a user with that username. Please try again!',
                });
                return false;
            }

            /*
                Check the keys.json file to see if the key provided in 
                request is valid and exists.
            */
            const fs = require('fs');
            var keys = JSON.parse(fs.readFileSync('./keys.json'));

            if (!keys.includes(req.body.key)) {
                return res.send(JSON.stringify({
                    success: false,
                    error: 'Key provided is invalid. Please try again'
                }));
            }

            /*
                Delete the key provided from the file to prevent use again
            */
            delete keys[req.body.key];
            fs.writeFileSync('./keys.json', JSON.stringify(keys), (err) => {
                if (err) {
                    res.json({
                        success: false,
                        error: errMsg
                    });
                    return false;
                }
            });

            if (username === undefined || pswrd === undefined) {
                return res.end(JSON.stringify({
                    success: false,
                    error: 'No username or password was provided. Please try again'
                }));
            }

            if (email === undefined) {
                return res.end(JSON.stringify({
                    success: false,
                    error: 'No email was provided. Please try again'
                }));
            }

            let password = bcrypt.hashSync(pswrd, 9);

            UserModel.create(new UserModel({
                username,
                password,
                dateCreated: new Date(),
                email,
                userAgent,
                uploadKey: req.body.key,
                ip,
                secretKey
            }));

            res.send(JSON.stringify({ success: true }));
            return true;
        });
    }

    /*
    changePassword(app, db) {
        app.post('/api/v1/user/changePassword', (req, res) => {
            let username = req.body.username;
            let currentPassword = req.body.password;
            let newPassword = req.body.newPassword;

            db.query("SELECT * FROM user WHERE username = ?", [username], (err, data, fields) => {
                if (err) {
                    res.json({
                        success: false,
                        error: errMsg
                    });
                    return false;
                }

                if (data && data.length === 1) {
                    bcrypt.compare(currentPassword, data[0].password, (bcryptErr, verified) => {
                        if (!verified) {
                            res.json({
                                success: false,
                                error: 'Incorrect password. Please try again.'
                            });
                            return false;
                        }
                    });

                    let password = bcrypt.hashSync(newPassword, 9);

                    db.query("UPDATE user SET `password`='" + password + "' WHERE (`id`='" + data[0].id + "');", (err, data, fields) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: errMsg
                            });
                            return false;
                        }

                        res.end(JSON.stringify({
                            success: true
                        }));
                        return true;
                    });
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist. Please try again'
                    });
                    return false;
                }
            });
        });
    }
    */

    getUploads(app, db) {
        app.post('/api/v1/user/uploads', (req, res) => {
            /*
                Here we store all the required values into variables
            */
            let username = req.body.username;
            let uploadKey = req.body.key;

            //Default the limit to 10 if there is no limit provided
            let limit = 10;
            if (req.body.limit !== undefined) {
                limit = req.body.limit;
            }

            if (username === undefined || uploadKey === undefined) {
                /*
                    If there is no username or key provided we will return.
                */
                res.send(JSON.stringify({
                    success: false,
                    error: 'Invalid request'
                }));
                return false;
            }

            /*
                Make MySQL request checking if the user actually exists
            */
            UserModel.findOne({ username }, (err, user) => {
                if (user) {
                    if (user.uploadKey !== uploadKey) {
                        /*
                            If the user exists but the upload key is invalid we return.
                        */

                        res.send(JSON.stringify({
                            success: false,
                            error: 'Upload key is invalid'
                        }));
                        return false;
                    }

                    /*
                        Get all files 
                    */

                    FileModel.find({ uploader: username }, {}, { skip: 0, limit, sort: { dateCreated: -1 } }, (err, files) => {
                        if (err) {
                            res.end(JSON.stringify({ success: false, error: 'An error has occured. Please try again' }));
                            console.log(err);
                            return false;
                        }

                        res.send(JSON.stringify(files));
                        return true;
                    });
                } else {
                    /*  
                        If the user doesn't exist we return.
                    */
                    res.send(JSON.stringify({
                        success: false,
                        error: 'User does not exist'
                    }));
                    return false;
                }
            });
        });
    }

    login(app, db) {
        app.post('/api/v1/user/login', (req, res) => {
            let username = req.body.username;
            let password = req.body.password;
            let ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress);
            let userAgent = req.get('User-Agent');

            if (username.length > 45 || password.length > 45) {
                res.json({
                    success: false,
                    error: errMsg
                });
                return;
            }

            UserModel.findOne({ username }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: errMsg
                    });
                    return;
                }

                if (user) {
                    bcrypt.compare(password, user.password, (bcryptErr, verified) => {
                        if (verified) {
                            req.session.userID = user.id;
                            console.log(req.session);

                            user.userAgent = userAgent;
                            user.ip = ip;

                            user.save();

                            if (user.isTerminated) {
                                res.json({
                                    success: false,
                                    error: 'This user is permanently banned. Contact Runabox#0001 on discord for more information.'
                                });
                                return false;
                            }

                            this.audit(user.username, config.audit.login, `User logged in`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                            if (user.isAdmin) {
                                res.json({
                                    success: true,
                                    username: user.username,
                                    key: user.uploadKey,
                                    secretKey: user.secretKey,
                                    isAdmin: user.isAdmin,
                                    pfp: user.pfp
                                });

                                return true;
                            }

                            res.json({
                                success: true,
                                username: user.username,
                                key: user.uploadKey,
                                pfp: user.pfp
                            });

                            return;
                        } else {
                            res.json({
                                success: false,
                                error: 'Invalid password'
                            });
                        }
                    });
                } else {
                    res.json({
                        success: false,
                        error: 'User not found. Please try again'
                    });
                }
            });
        });
    }

    logout(app, db) {
        app.post('/api/v1/user/logout', (req, res) => {
            if (req.session.userID) {
                req.session.destroy();
                res.json({
                    success: true
                });

                return true;
            } else {
                res.json({
                    success: false
                });

                return false;
            }
        });
    }

    isLoggedIn(app, db) {
        app.post('/api/v1/user/loggedIn', (req, res) => {
            if (req.session.userID) {
                UserModel.findOne({ _id: req.session.userID }, (err, user) => {
                    if (err) {
                        res.json({
                            success: false,
                            error: errMsg
                        });
                        return;
                    }

                    if (user) {
                        if (user.isTerminated) {
                            res.json({
                                success: false,
                                error: 'This user is permanently banned. Contact Runabox#0001 on discord for more information.'
                            });
                            return false;
                        }

                        if (user.isAdmin) {
                            res.json({
                                success: true,
                                username: user.username,
                                key: user.uploadKey,
                                isAdmin: user.isAdmin,
                                pfp: user.pfp
                            });

                            return true;
                        }

                        res.json({
                            success: true,
                            username: user.username,
                            key: user.uploadKey,
                            pfp: user.pfp
                        });

                        return true;
                    } else {
                        res.json({
                            success: false
                        });
                    }
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    }

    isUserUpgraded(app, db) {
        app.post('/api/v1/user/upgraded', (req, res) => {
            UserModel.findOne({ username: req.body.username }, (err, user) => {
                if (user) {
                    res.send(JSON.stringify({
                        success: true,
                        isUpgraded: user.isUpgraded
                    }));

                    return true;
                } else {
                    res.send(JSON.stringify({
                        success: false,
                        error: 'User does not exist'
                    }));

                    return true;
                }
            });
        });
    }

    uploadProfilePicture(app, db, s3) {
        app.post('/api/v1/update/pfp', (req, res) => {
            if (req.files.image === undefined) {
                res.end(JSON.stringify({ success: false, error: 'No image provided' }));
                return;
            }

            if (req.query.key === undefined) {
                res.end(JSON.stringify({ success: false, error: 'No key/token provided' }));
                return;
            }

            if (req.files.image.size > (10 * 1024 * 1024)) {
                res.end(JSON.stringify({ success: false, error: 'Image is over 5 mb' }));
                return;
            }

            UserModel.findOne({ uploadKey: req.query.key }, (err, user) => {
                if (err) {
                    res.end(JSON.stringify({ success: false, error: 'An error has occured. Please try again.' }));
                    return;
                }

                let s = req.files.image.name.split('.');
                let ext = s[s.length - 1];

                if (user) {
                    if (user.isTerminated) {
                        res.end(JSON.stringify({
                            success: false,
                            error: 'This user is permanently banned. Contact Runabox#0001 on discord for more information.'
                        }));
                        return false;
                    }

                    let userId = user.id;
                    let url = 'https://cdn.upld.live/pfp/' + userId + '.' + ext;

                    var params = {
                        Bucket: "cdn.upld.live",
                        Key: 'pfp/' + userId + '.' + ext,
                        Body: req.files.image.data,
                        ACL: 'public-read'
                    };

                    s3.deleteObject({ Bucket: "cdn.upld.live", Key: 'pfp/' + userId + '.' + ext }, (err, data) => {
                        if (err) {
                            res.end(JSON.stringify({ success: false, error: 'An error has occured. Please try again.' }));
                            return;
                        }
                    });

                    s3.upload(params, (err, data) => {
                        if (err) {
                            res.end(JSON.stringify({ success: false, error: 'An error has occured. Please try again.' }));
                            return;
                        }
                    });

                    user.pfp = url;
                    user.save();

                    this.audit(user.username, config.audit.changePfp, `User changed profile picture`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                    res.send(JSON.stringify({
                        success: true,
                        url: url
                    }));

                    return true;
                } else {
                    res.end(JSON.stringify({ success: false, error: 'User does not exist. Please try again' }));
                    return;
                }
            });
        });
    }

    audit(username, action, description, db, ip) {
        UserModel.findOne({ username }, (err, user) => {
            if (err) {
                console.log(err);
                return;
            }

            if (user) {
                let id = user._id;
                let aString = "";

                switch (action) {
                    case config.audit.upload:
                        aString = "Upload";
                        break;
                    case config.audit.deleteImage:
                        aString = "Delete Upload";
                        break;
                    case config.audit.createSubdomain:
                        aString = "Create Subdomain";
                        break;
                    case config.audit.deleteSubdomain:
                        aString = "Delete Subdomain";
                        break;
                    case config.audit.listSubdomains:
                        aString = "List Subdomains";
                        break;
                    case config.audit.resetKey:
                        aString = "Reset Key";
                        break;
                    case config.audit.login:
                        aString = "New Login";
                        break;
                    case config.audit.logout:
                        aString = "Logout";
                        break;
                    case config.audit.listUploads:
                        aString = "List Uploads";
                        break;
                    case config.audit.changePfp:
                        aString = "Change Profile Picture";
                        break;
                    case config.audit.toggleEmbed:
                        aString = "Toggle Embedding Images";
                        break;
                    case config.audit.changeColor:
                        aString = "Change Embed Color";
                        break;
                }

                AuditModel.create(new AuditModel({
                    user: id,
                    date: new Date(),
                    action,
                    aString,
                    description,
                    ip
                }));
            }
        });
    }

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    makeSecret() {
        return this.makeid(27) + '.' + this.makeid(33);
    }
}

module.exports = UserRouter;