const path = require('path')
const { v4: uuidv4 } = require('uuid');

var mkdirp = require('mkdirp');
const fs = require('fs');

const { Webhook, MessageBuilder } = require('discord-webhook-node');

const fastFolderSize = require('fast-folder-size');

const config = require('../../config.json');

const nsfwjs = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node')

const mime = require("mime");

const cf = require('cloudflare')({
    email: config['cf-email'],
    key: config['cf-key']
});

const feedbackHook = new Webhook(config.feedbackHookURL);
const reportHook = new Webhook(config.reportHookURL);
const updateHook = new Webhook(config.updateHookURL);

feedbackHook.setUsername("upld beta Feedback");
reportHook.setUsername("upld beta Reports");
updateHook.setUsername("upld beta Updates");

feedbackHook.setAvatar("https://cdn.discordapp.com/avatars/821175497961898014/2b2331147170b77ff73d681632562704.png");
reportHook.setAvatar("https://cdn.discordapp.com/avatars/821175497961898014/2b2331147170b77ff73d681632562704.png");
updateHook.setAvatar("https://cdn.discordapp.com/avatars/821175497961898014/2b2331147170b77ff73d681632562704.png");

const UserModel = require('../models/UserModel');
const FileModel = require('../models/FileModel');
const AuditModel = require('../models/AuditModel');
const UpdateModel = require('../models/UpdateModel');
const DomainModel = require('../models/DomainModel');
const TextUploadModel = require('../models/TextUploadModel');

// upld beta
const ReportModel = require('../models/ReportModel');
const FeedbackModel = require('../models/FeedbackModel');

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
}

class ApiRouter {
    constructor(app, con) {
        try {
            this.def(app);

            this.upload(app, con);
            this.textUpload(app, con);
            this.deleteImage(app, con);

            this.stats(app, con);
            this.getKey(app);
            this.createSubdomain(app, con);
            this.deleteSubdomain(app, con);
            this.getDomainConfig(app, con);

            this.subdomains(app, con);
            this.hosts(app, con);

            this.latestUpdate(app, con);
            this.publishUpdate(app, con);

            this.adminStats(app, con);
            this.adminUsers(app, con);
            this.adminUserSearch(app, con);
            this.adminTerminate(app, con);
            this.adminUser(app, con);
            this.adminModerate(app, con);
            this.adminModerateSafe(app, con);

            this.upgradeUser(app, con);

            this.getAuditLog(app, con);

            //upld beta
            this.createReport(app, con);
            this.createFeedback(app, con);
        } catch (e) {
            console.log('An error has been caught from the ApiRouter. Exception: ' + e);
        }
    }

    def(app) {
        app.get('/api/v1', (req, res) => {
            let time = process.uptime();
            var uptime = (time + '').toHHMMSS();

            res.send('upld beta API /v1 endpoint [UPTIME: ' + uptime + ']');
        });
    }

    makeSecret() {
        return this.makeid(27) + '.' + this.makeid(33);
    }

    adminModerateSafe(app, db) {
        app.post('/api/v1/admin/moderate/imageSafe', (req, res) => {
            let key = req.body.key;
            let imageID = req.body.id;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: "An error has occured. Please try again"
                    });
                    return false;
                }

                if (user) {
                    if (user.isAdmin) {
                        FileModel.findOne({ id: imageID }, (err, file) => {
                            if (file === null) {
                                res.json({
                                    success: true,
                                });
                                return;
                            }

                            file.isSafe = true;

                            file.save();

                            res.json({
                                success: true,
                            });
                        });
                    } else {
                        res.json({
                            success: false,
                            error: 'User is not admin!',
                        });
                        return false;
                    }
                } else {
                    res.json({
                        success: false,
                        error: 'User not found, please try again!',
                    });
                    return false;
                }
            });
        });
    }

    adminModerate(app, db) {
        app.post('/api/v1/admin/moderate/image', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: "An error has occured. Please try again"
                    });
                    return false;
                }

                if (user) {
                    if (user.isAdmin) {
                        FileModel.findOne({ isSafe: false, isNSFW: true, }, null, { sort: { dateCreated: -1 } }, (err, file) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    error: "An error has occured. Please try again"
                                });
                                return false;
                            }

                            if (file) {
                                UserModel.findOne({ username: file.uploader }, (err, user) => {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            error: "An error has occured. Please try again"
                                        });
                                        return false;
                                    }

                                    if (user) {
                                        res.json({
                                            user: {
                                                key: user.uploadKey,
                                            },
                                            id: file.id,
                                            domain: file.domain,
                                        });
                                        return true;
                                    } else {
                                        res.json({
                                            success: false,
                                            error: "An error has occured. Please try again"
                                        });
                                        return false;
                                    }
                                });
                            } else {
                                res.json({
                                    noUpload: true,
                                });
                                return false;
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            error: 'User is not admin!',
                        });
                        return false;
                    }
                } else {
                    res.json({
                        success: false,
                        error: 'User not found, please try again!',
                    });
                    return false;
                }
            });
        });
    }

    adminUser(app, db) {
        app.post('/api/v1/admin/user', (req, res) => {
            let userKey = req.body.userKey;
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: "An error has occured. Please try again"
                    });
                    return false;
                }

                if (user) {
                    if (user.isAdmin) {
                        UserModel.findOne({ uploadKey: userKey }, (err, user) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    error: "An error has occured. Please try again"
                                });
                                return false;
                            }

                            if (user) {
                                res.json(user);
                                return true;
                            } else {
                                res.json({
                                    success: false,
                                    error: 'Specified user does not exist, please try again!',
                                });
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            error: 'User is not admin!',
                        });
                        return false;
                    }
                } else {
                    res.json({
                        success: false,
                        error: 'User not found, please try again!',
                    });
                    return false;
                }
            });
        });
    }

    getAuditLog(app, db) {
        app.post("/api/v1/user/auditLog", (req, res) => {
            let key = req.body.key;
            let limit = !req.body.limit ? 10 : req.body.limit;
            limit = !(limit > 100) ? limit : 100;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: "An error has occured. Please try again"
                    });
                    return false;
                }

                if (user) {
                    AuditModel.find({ user: user.id }, null, { sort: { date: -1 } }, (err, audits) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: "An error has occured. Please try again"
                            });
                            return false;
                        }

                        res.end(JSON.stringify({
                            data: audits
                        }));
                    });
                }
            });
        });
    }

    upgradeUser(app, db) {
        app.post("/api/v1/admin/upgradeUser", (req, res) => {
            let adminKey = req.body.key;
            let userToUpgrade = req.body.user;

            UserModel.findOne({ uploadKey: adminKey }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: "An error has occured. Please try again"
                    });
                    return false;
                }

                if (user) {
                    if (!user.isAdmin) {
                        res.json({
                            success: false,
                            error: "User does not have permission to use this endpoint!"
                        });
                        return false;
                    }

                    // Find user to upgrade and then set isUpgraded equal to true
                    UserModel.findOne({ username: userToUpgrade }, (err, user) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: "An error has occured. Please try again"
                            });
                            return false;
                        }

                        if (!user) {
                            res.json({
                                success: false,
                                error: "User does not exist. Please try again"
                            });
                            return false;
                        }

                        user.isUpgraded = true;
                        user.save();

                        res.end(JSON.stringify({
                            success: true
                        }));
                        return true;
                    });
                } else {
                    res.json({
                        success: false,
                        error: "Admin user does not exist. Please try again"
                    });
                    return false;
                }
            });
        });
    }

    // WIP
    /*resetKey(app, db) {
        app.post("/api/v1/user/resetKey", (req, res) => {
            let key = req.body.key;

            db.query("SELECT * FROM user WHERE uploadKey = ? LIMIT 1;", [key], (err, data, fields) => {
                if (err) {
                    res.json({
                        success: false,
                        error: "An error has occured. Please try again"
                    });
                    return false;
                }

                if (data && data.length === 1) {
                    let newKey = uuidv4();
                    let username = data[0].username;
                    db.query("UPDATE user SET uploadKey = ? WHERE (id = ?);", [newKey, data[0].id], (err, data, fields) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: "An error has occured. Please try again"
                            });
                            return false;
                        }

                        this.audit(username, config.audit.resetKey, `User reset key`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                        res.end(JSON.stringify({
                            success: true,
                            key: newKey
                        }));
                        return true;
                    });
                } else {
                    res.json({
                        success: false,
                        error: "User does not exist. Please try again"
                    });
                    return false;
                }
            });
        });
    }*/

    createFeedback(app, db) {
        app.post('/api/v1/createFeedback', (req, res) => {
            let key = req.body.key;
            let feedbackBody = req.body.feedbackBody;

            if (key === undefined || feedbackBody === undefined) {
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
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    let color = "#" + user.embedColor;

                    FeedbackModel.create(new FeedbackModel({
                        body: feedbackBody,
                        uploader: user.username,
                        date: new Date(),
                    }));

                    // Send Discord Webhook
                    let embed = new MessageBuilder()
                        .setTitle("New Feedback")
                        .addField("New feedback submitted by " + user.username, feedbackBody)
                        .setThumbnail(user.pfp)
                        .setColor(color)
                        .setTimestamp();

                    feedbackHook.send(embed);

                    res.end(JSON.stringify({
                        success: true
                    }));
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

    createReport(app, db) {
        app.post('/api/v1/createReport', (req, res) => {
            let key = req.body.key;
            let reportBody = req.body.reportBody;

            if (key === undefined || reportBody === undefined) {
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
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    let color = "#" + user.embedColor;

                    ReportModel.create(new ReportModel({
                        body: reportBody,
                        uploader: user.username,
                        date: new Date(),
                    }));

                    // Send Discord Webhook
                    let embed = new MessageBuilder()
                        .setTitle("New Report")
                        .addField("New report submitted by " + user.username, reportBody)
                        .setThumbnail(user.pfp)
                        .setColor(color)
                        .setTimestamp();

                    reportHook.send(embed);

                    res.end(JSON.stringify({
                        success: true
                    }));
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

    /*adminGetFeedback(app, db) {
        app.post('/api/v1/admin/feedback', (req, res) => {
            let key = req.body.key;

            if (key === undefined) {
                res.json({
                    success: false,
                    error: 'Invalid request'
                });
                return false;
            }

            db.query("SELECT * FROM user WHERE uploadKey = ? LIMIT 1;", [key], (err, data, fields) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                if (data && data.length === 1) {
                    if (data[0].isAdmin) {
                        db.query("SELECT * FROM feedback LIMIT 15;", (err, data, fields) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    error: 'An error has occured. Please try again'
                                });
                                return false;
                            }

                            res.end(JSON.stringify(data));
                            return true;
                        });
                    } else {
                        res.json({
                            success: false,
                            error: 'User is not admin.'
                        });
                        return false;
                    }
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

    adminGetReports(app, db) {
        app.post('/api/v1/admin/reports', (req, res) => {
            let key = req.body.key;

            if (key === undefined) {
                res.json({
                    success: false,
                    error: 'Invalid request'
                });
                return false;
            }

            db.query("SELECT * FROM user WHERE uploadKey = ? LIMIT 1;", [key], (err, data, fields) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                if (data && data.length === 1) {
                    if (data[0].isAdmin) {
                        db.query("SELECT * FROM report LIMIT 15;", (err, data, fields) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    error: 'An error has occured. Please try again'
                                });
                                return false;
                            }

                            res.end(JSON.stringify(data));
                            return true;
                        });
                    } else {
                        res.json({
                            success: false,
                            error: 'User is not admin.'
                        });
                        return false;
                    }
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist. Please try again'
                    });
                    return false;
                }
            });
        });
    }*/

    publishUpdate(app, db) {
        app.post('/api/v1/updates/publish', (req, res) => {
            let key = req.body.key;
            let title = req.body.title;
            let fixed = req.body.fixed;
            let changed = req.body.changed;
            let added = req.body.added;

            if (key === undefined || title === undefined || fixed === undefined || changed === undefined || added === undefined) {
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
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                if (user) {
                    if (!user.isAdmin) {
                        res.json({
                            success: false,
                            error: 'User is not admin. Please try again'
                        });
                        return false;
                    }

                    UpdateModel.create(new UpdateModel({
                        title,
                        added,
                        fixed,
                        changed,
                        date: new Date(),
                        uploader: user.username
                    }));

                    let embed = new MessageBuilder()
                        .setTitle(`New update published by ${user.username}`)
                        .setAuthor(user.username, user.pfp)
                        .addField("Title", title)
                        .addField("Added", added)
                        .addField("Fixed", fixed)
                        .addField("Changed", changed)
                        .setTimestamp();

                    updateHook.send(embed);

                    res.send(JSON.stringify({
                        success: true
                    }));
                    return true;
                } else {
                    res.json({
                        success: false,
                        error: 'Key does not exist. Please try again.'
                    });
                    return false;
                }
            });
        });
    }

    latestUpdate(app, db) {
        app.get('/api/v1/updates/latest', (req, res) => {
            UpdateModel.findOne({}, null, { sort: { date: -1 } }, (err, update) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured. Please try again'
                    });
                    return false;
                }

                res.send(JSON.stringify(update));
            });
        });
    }

    adminTerminate(app, db) {
        app.post('/api/v1/admin/terminate', (req, res) => {
            let username = req.body.username;
            let adminKey = req.body.adminKey;

            UserModel.findOne({ uploadKey: adminKey }, (err, user) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (!user) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Admin user does not exist.'
                    }));
                    return false;
                } else {
                    if (!user.isAdmin) {
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Admin user does not have admin priveleges.'
                        }));
                        return false;
                    }
                }
            });

            //check if user to terminate exists
            UserModel.findOne({ username }, (err, user) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (!user) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'User does not exist.'
                    }));
                    return false;
                }

                user.isTerminated = true;
                user.save();
            });

            //delete all files user has uploaded
            FileModel.deleteMany({ uploader: username }, (err) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }
            });

            res.send(JSON.stringify({
                success: true
            }));
        });
    }

    // Unused
    stats(app, db) {
        /*app.post('/api/v1/stats', async (req, res) => {
            db.query("SELECT COUNT(*) AS files FROM files;", (err, data, fields) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                let files = data[0].files;

                db.query("SELECT SUM(views) AS views FROM files;", (err, data, fields) => {
                    if (err) {
                        res.end(JSON.stringify({
                            success: false,
                            error: 'An error has occured. Please try again'
                        }));
                        return false;
                    }

                    let views = data[0].views;

                    db.query("SELECT COUNT(*) AS hosts FROM domains WHERE isHost=1;", (err, data, fields) => {
                        if (err) {
                            res.end(JSON.stringify({
                                success: false,
                                error: 'An error has occured. Please try again'
                            }));
                            return false;
                        }

                        let hosts = data[0].hosts;

                        db.query("SELECT COUNT(*) AS subs FROM domains WHERE isHost=0;", (err, data, fields) => {
                            if (err) {
                                res.end(JSON.stringify({
                                    success: false,
                                    error: 'An error has occured. Please try again'
                                }));
                                return false;
                            }

                            let subs = data[0].subs;

                            db.query("SELECT COUNT(*) AS users FROM user;", (err, data, fields) => {
                                if (err) {
                                    res.end(JSON.stringify({
                                        success: false,
                                        error: 'An error has occured. Please try again'
                                    }));
                                    return false;
                                }

                                let users = data[0].users;

                                fastFolderSize(path.join(__dirname, '..', '..', 'store', 'files'), (err, bytes) => {
                                    let b = this.humanFileSize(bytes);

                                    res.send(JSON.stringify({
                                        files,
                                        views,
                                        hosts,
                                        subs,
                                        size: b,
                                        users
                                    }));

                                    return true;
                                });
                            })
                        });
                    });
                });
            });
        });*/
    }

    adminStats(app, db) {
        app.post('/api/v1/admin/stats', async (req, res) => {
            let files = await (await FileModel.find()).length;
            let views = await FileModel.aggregate([{
                $group: {
                    _id: null,
                    total: {
                        $sum: "$views"
                    }
                }
            }]);

            let hosts = await (await DomainModel.find({ isHost: true })).length;
            let subs = await (await DomainModel.find({ isHost: false })).length;
            let users = await (await UserModel.find()).length;

            fastFolderSize(path.join(__dirname, '..', '..', 'store', 'files'), (err, bytes) => {
                let b = this.humanFileSize(bytes);
                res.send(JSON.stringify({
                    files,
                    views: (views[0] ? views[0].total : 0),
                    hosts,
                    subs,
                    size: b,
                    users
                }));

                return true;
            });
        });
    }

    deleteSubdomain(app, db) {
        app.post('/api/v1/deleteSubdomain', async (req, res) => {
            let sub = req.body.sub;
            let host = req.body.host;
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        error: 'An error has occured. Please try again'
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

                    let so = user.subdomainsOwned;

                    DomainModel.findOne({ owner: user.username, sub, host }, async (err, domain) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: 'An error has occured. Please try again'
                            });
                            return false;
                        }

                        if (!domain) {
                            res.json({
                                success: false,
                                error: 'User does not own subdomain or subdomain already does not exist. Please try again'
                            });
                            return false;
                        }

                        //delete subdomain from sql
                        DomainModel.deleteOne({ _id: domain._id }, (err) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    error: 'An error has occured. Please try again'
                                });
                                return false;
                            }
                        });

                        user.subdomainsOwned = so - 1;
                        user.save();

                        //delete subdomain from cf
                        let allZones = await cf.zones.browse();

                        var i;
                        for (i = 0; i < allZones.result.length; i++) {
                            /*
                                if we never find the sub it probably doesn't matter because that means 
                                its already deleted from cloudflare (for some reason idk)
                            */

                            if (allZones.result[i].name === host) {
                                let allRecords = await cf.dnsRecords.browse(allZones.result[i].id);
                                allRecords.result.forEach(record => {
                                    if (record.name === sub + '.' + host) {
                                        cf.dnsRecords.del(allZones.result[i].id, record.id);

                                        console.log('[' + new Date().toLocaleTimeString() + '] Subdomain "' + sub + '.' + host + '" has successfully been deleted.');
                                    }
                                });
                            }
                        }

                        //delete all uploads on domain
                        FileModel.deleteMany({ domain: (sub + '.' + host) }, (err) => {
                            if (err) {
                                res.end(JSON.stringify({
                                    success: false,
                                    error: 'An error has occured. Please try again'
                                }));
                                return false;
                            }
                        });

                        this.audit(user.username, config.audit.deleteSubdomain, `User deleted domain ${sub}.${host}`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                        res.end(JSON.stringify({
                            success: true
                        }));
                        return true;
                    });
                } else {
                    res.json({
                        success: false,
                        error: 'User does not exist!'
                    });
                    return false;
                }
            });
        });
    }

    createSubdomain(app, db) {
        app.post('/api/v1/createSubdomain', async (req, res) => {
            let sub = req.body.sub;
            let host = req.body.host;

            if (sub === 'root') {
                res.end(JSON.stringify({
                    success: false,
                    error: 'Subdomain cannot be root. Please try again.'
                }));
                return false;
            }

            if (String(sub + '.' + host).split('.').length > 3) {
                res.end(JSON.stringify({
                    success: false,
                    error: 'Nested subdomains are not allowed. Please try again'
                }));
                return false;
            }

            let userKey = req.body.key;

            let username = '';
            let so = 0;

            let max = 5;

            UserModel.findOne({ uploadKey: userKey }, (err, user) => {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (!user) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'User does not exist'
                    }));
                    return false;
                }

                if (user.isTerminated) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'This user is permanently banned. Contact Runabox#0001 on discord for more information.'
                    }));
                    return false;
                }

                if (user.isUpgraded) {
                    max = 10;
                }

                if (user.subdomainsOwned >= max) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'User exceeds subdomain limit for their account'
                    }));
                    return false;
                }

                username = user.username;
                so = user.subdomainsOwned;
            });

            DomainModel.findOne({ host, isHost: true }, (err, domain) => {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (!domain) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Host domain does not exist'
                    }));
                    return false;
                }
            });

            //check if subdomain already exists
            DomainModel.findOne({ host, sub }, (err, domain) => {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (domain) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Subdomain already exists. Please try again'
                    }));
                    return false;
                }
            });

            // Create subdomain on cloudflare

            /*
                NOTE: Cloudflare API is dumb as fuck and doesn't allow 
                you to use their api for .ga, .tk, etc. domains.

                (basically any free domain)
            */

            let allZones = await cf.zones.browse();

            var i;
            for (i = 0; i < allZones.result.length; i++) {
                if (allZones.result[i].name === host) {
                    // DNS Record
                    let record = {
                        type: "CNAME",
                        name: sub,
                        content: "upld.live",
                        ttl: 300,
                        proxied: true
                    };

                    let result;
                    try {
                        // Add DNS record to Cloudflare zone
                        result = await cf.dnsRecords.add(allZones.result[i].id, record);
                    } catch (e) {
                        console.error(e);
                        res.end(JSON.stringify({
                            success: false,
                            error: 'An error has occured while creating the subdomain record. Please try again'
                        }));
                        return false;
                    }

                    if (result.success) {
                        DomainModel.create(new DomainModel({
                            sub,
                            host,
                            dateCreated: new Date(),
                            owner: username
                        }));

                        //add 1 to owned subdomains for user
                        UserModel.findOne({ username }, (err, user) => {
                            user.subdomainsOwned = so + 1;
                            user.save();
                        });

                        console.log('[' + new Date().toLocaleTimeString() + '] New subdomain "' + sub + '" created for host ' + host + ' by user ' + username);

                        this.audit(username, config.audit.createSubdomain, `User created subdomain ${sub}.${host}`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                        await res.end(JSON.stringify({
                            success: true
                        }));

                        return true;
                    } else {
                        res.end(JSON.stringify({
                            success: false,
                            error: 'An error has occured. Please try again'
                        }));
                        return false;
                    }
                }
            }
        });
    }

    getDomainConfig(app, db) {
        app.get('/api/v1/user/getConfig', (req, res) => {
            let sub = req.query.sub;

            let isHost = false;
            if (sub === undefined || sub === '') {
                isHost = true;
            }

            let host = req.query.host;
            let key = req.query.key;

            res.set({
                "Content-Disposition": `attachment; filename="${sub}.${host} (upld.live).sxcu"`
            });

            /*
                Example:

                {
                    "Version": "13.4.0",
                    "DestinationType": "ImageUploader",
                    "RequestMethod": "POST",
                    "RequestURL": "http://localhost/upload",
                    "Parameters": {
                        "key": "9a485784-ba89-43f3-98aa-f4d97bbcf624",
                        "domain": "root,upld.live"
                    },
                    "Body": "MultipartFormData",
                    "FileFormName": "image",
                    "URL": "$json:url$",
                    "DeletionURL": "$json:del_url$",
                    "ErrorMessage": "$json:error$"
                }
            */

            let config = {
                "Version": "13.4.0",
                "DestinationType": "ImageUploader",
                "RequestMethod": "POST",
                "RequestURL": "https://" + (sub + '.' + host) + "/upload",
                "Parameters": {
                    "key": key,
                    "domain": (isHost ? host : sub + ',' + host)
                },
                "Body": "MultipartFormData",
                "FileFormName": "image",
                "URL": "$json:url$",
                "DeletionURL": "$json:del_url$",
                "ErrorMessage": "$json:error$"
            };

            res.send(JSON.stringify(config));
            return true;
        });
    }

    subdomains(app, db) {
        app.post('/api/v1/user/subdomains', (req, res) => {
            let key = req.body.key;

            UserModel.findOne({ uploadKey: key }, (err, user) => {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                let max = 5;
                if (user.isUpgraded) {
                    max = 10;
                }

                if (user) {
                    DomainModel.find({ owner: user.username }, (err, domains) => {
                        if (err) {
                            console.log(err);
                            res.end(JSON.stringify({
                                success: false,
                                error: 'An error has occured. Please try again'
                            }));
                            return false;
                        }

                        //this.audit(user.username, config.audit.listSubdomains, `User listed subdomains`, db, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                        res.status(200).end(JSON.stringify({ success: true, max: max, result: domains }));
                        return true;
                    });
                } else {
                    res.status(400).send(JSON.stringify({ success: false, error: 'User does not exist' }));
                    return false;
                }
            });
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

    getKeyFromDomain(domain) {
        var arr = JSON.parse(fs.readFileSync(path.join(__dirname, 'domains.json')));

        var i;
        for (i = 0; i < arr.d.length; i++) {
            if (arr.d[i] == domain) {
                return arr.dId[i];
            }
        }
        return undefined;
    }

    /* Not used anymore
    getAllUploads(app, con) {
        app.post('/api/v1/admin/uploads', (req, res) => {
            let key = req.body.key;

            con.query("SELECT * from user WHERE uploadKey = ? LIMIT 1;", [key], (err, data, fields) => {
                if (err) { console.log(err); return; }
                if (data && data.length === 1) {
                    if (!data[0].isAdmin) {
                        res.json({
                            success: false,
                            error: 'User does not have admin privileges'
                        });

                        return false;
                    }
                } else {
                    res.json({
                        success: false,
                        error: 'Invalid user or key'
                    });

                    return false;
                }
            });

            con.query("SELECT * from files ORDER BY `dateCreated` DESC LIMIT 10;", (err, data, fields) => {
                if (err) { console.log(err); return; }
                return res.end(JSON.stringify(data));
            });

            return false;
        });
    }*/

    hosts(app, db) {
        app.post('/api/v1/hosts', (req, res) => {
            DomainModel.find({ isHost: true }, (err, domains) => {
                // Only send domain host without any other information
                let tr = [];

                var i;
                for (i = 0; i < domains.length; i++) {
                    tr.push({
                        name: domains[i].host
                    });
                }

                res.send(JSON.stringify(tr));
                return true;
            });
        });
    }

    adminUserSearch(app, db) {
        app.post('/api/v1/admin/users/search', (req, res) => {
            let key = req.body.key;
            let s = req.body.s;

            if (key === undefined || s === undefined) {
                res.json({
                    success: false,
                    error: 'No key or search term provided!'
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

                if (user) {
                    if (!user.isAdmin) {
                        res.json({
                            success: false,
                            error: 'User is not admin!'
                        });
                        return false;
                    }

                    UserModel.find({ username: new RegExp(s, "i") }, null, { sort: { dateCreated: -1 } }, (err, users) => {
                        if (err) {
                            console.log(err);
                            res.json({
                                success: false,
                                error: 'An error occured. Please try again'
                            });
                            return false;
                        }

                        res.send(
                            JSON.stringify({
                                success: true,
                                user: users
                            })
                        );
                    });
                } else {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'User does not exist. Please try again!'
                    }));
                }
            });
        });
    }

    adminUsers(app, db) {
        app.post('/api/v1/admin/users', (req, res) => {
            let key = req.body.key;

            if (key === undefined) {
                res.json({
                    success: false,
                    error: 'No key provided!'
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

                if (user) {
                    if (!user.isAdmin) {
                        res.json({
                            success: false,
                            error: 'User is not admin!'
                        });
                        return false;
                    }

                    UserModel.find({}, null, { limit: 20 }, (err, users) => {
                        if (err) {
                            res.json({
                                success: false,
                                error: 'An error occured. Please try again'
                            });
                            return false;
                        }

                        res.send(
                            JSON.stringify({
                                success: true,
                                user: users
                            })
                        );
                    });
                } else {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'User does not exist. Please try again!'
                    }));
                }
            });
        });
    }

    upload(app, con) {
        app.post('/upload', (req, res) => {
            res.header('Content-Type', 'application/json');
            res.header('Accept', 'application/json');
            res.header('Access-Control-Allow-Origin', '*');

            if (req.files.image.name.length > 128) {
                res.statusCode(400).end('File name too long');
                return;
            }

            if (req.files.image === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'No file was provided' }));
            }

            if (req.query.domain === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'No domain was provided' }))
            }

            let uploadKey = req.query.key;

            if (uploadKey === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'No upload key was provided' }));
            }

            let sub = req.query.domain.split(',')[0];
            let host = req.query.domain.split(',')[1];

            // Check if domain is valid first
            DomainModel.findOne({ host, sub }, (err, domain) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (!domain) {
                    return res.status(400).send(JSON.stringify({ error: 'Domain does not exist. Please try again' }));
                }
            });

            UserModel.findOne({ uploadKey }, async (err, user) => {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
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

                    // Check if user owns the domain
                    DomainModel.findOne({ owner: user.username, sub, host }, (err, domain) => {
                        if (err) {
                            console.log(err);
                            res.end(JSON.stringify({
                                success: false,
                                error: 'An error has occured. Please try again'
                            }));
                            return false;
                        }

                        if (!domain) {
                            res.end(JSON.stringify({
                                success: false,
                                error: 'User does not own domain and therefore cannot upload to it. Please try again'
                            }));
                            return false;
                        }
                    });

                    let maxSize = ((1000 * 1000) * 50);
                    if (user.isUpgraded) {
                        maxSize = ((1000 * 1000) * 100);
                    }

                    if (req.files.image.size > maxSize) {
                        return res.status(400).send(JSON.stringify({ error: 'File is too large! (50mb limit for free users, 100mb for upgraded)' }));
                    }

                    let id = this.makeid(10);

                    // Check if id already exists
                    FileModel.findOne({ id }, (err, file) => {
                        if (file) {
                            id = this.makeid(10);
                        }
                    });

                    const deletionId = uuidv4();

                    const extension = req.files.image.name.match(/([^\.]+$)/g)[0];

                    console.log("[" + new Date().toLocaleTimeString() + "] Uploading file with id " + id + " and deletion id " + deletionId);

                    var responseData;

                    let domain = sub + '.' + host;
                    if (sub === 'root') {
                        domain = host;
                    }

                    if (extension === 'png' || extension === 'jpg' || extension === 'webp' || extension === 'gif') {
                        responseData = {
                            url: 'https://' + domain + '/' + id,
                            del_url: 'https://' + domain + '/d?image=' + id + '&deletionId=' + deletionId + '&type=' + extension.replace(/\./g, '')
                        };
                    } else {
                        responseData = {
                            url: 'https://' + domain + '/' + id + '.' + extension,
                            del_url: 'https://' + domain + '/d?image=' + id + '&deletionId=' + deletionId + '&type=' + extension.replace(/\./g, '')
                        };
                    }

                    FileModel.create(new FileModel({
                        id,
                        originalName: req.files.image.name,
                        extension,
                        deletionId,
                        domain,
                        isNSFW: false,
                        dateCreated: new Date(),
                        uploader: user.username
                    }));

                    this.audit(user.username, config.audit.upload, `User uploaded file ${req.files.image.name} with id ${id} and deletion id ${deletionId}`, con, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                    let filePath = path.join(__dirname, '..', '..', 'store', 'files', id + '.' + extension);

                    // Write to fs
                    req.files.image.mv(filePath);

                    // Start NSFW check job if file is an image
                    /*if (mime.getType(req.files.image.name).includes('image')) {
                        runNSFEvaluation(req.files.image.data, id);
                    }*/

                    res.json(responseData);
                    return true;
                } else {
                    res.json({
                        success: false,
                        error: 'Invalid upload key! (If you just changed your upload key please redownload your configs)'
                    });
                    return false;
                }
            });
        });
    }

    textUpload(app, con) {
        app.post('/textUpload', (req, res) => {
            res.header('Content-Type', 'application/json');
            res.header('Accept', 'application/json');
            res.header('Access-Control-Allow-Origin', '*');

            let body = req.body.body;

            let uploadKey = req.query.key;

            if (uploadKey === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'No upload key was provided' }));
            }

            let sub = req.query.domain.split(',')[0];
            let host = req.query.domain.split(',')[1];

            // Check if domain is valid first
            DomainModel.findOne({ host, sub }, (err, domain) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (!domain) {
                    return res.status(400).send(JSON.stringify({ error: 'Domain does not exist. Please try again' }));
                }
            });

            UserModel.findOne({ uploadKey }, async (err, user) => {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
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

                    // Check if user owns the domain
                    DomainModel.findOne({ owner: user.username, sub, host }, (err, domain) => {
                        if (err) {
                            console.log(err);
                            res.end(JSON.stringify({
                                success: false,
                                error: 'An error has occured. Please try again'
                            }));
                            return false;
                        }

                        if (!domain) {
                            res.end(JSON.stringify({
                                success: false,
                                error: 'User does not own domain and therefore cannot upload to it. Please try again'
                            }));
                            return false;
                        }
                    });

                    let id = this.makeid(10);

                    // Check if id already exists
                    TextUploadModel.findOne({ id }, (err, file) => {
                        if (file) {
                            id = this.makeid(10);
                        }
                    });

                    const deletionId = uuidv4();

                    console.log("[" + new Date().toLocaleTimeString() + "] Uploading text with id " + id + " and deletion id " + deletionId);

                    var responseData;

                    let domain = sub + '.' + host;
                    if (sub === 'root') {
                        domain = host;
                    }

                    responseData = {
                        url: 'https://' + domain + '/' + id + '.' + extension,
                        del_url: 'https://' + domain + '/d?text=' + id + '&deletionId=' + deletionId 
                    };

                    TextUploadModel.create(new FileModel({
                        id,
                        deletionId,
                        domain,
                        body,
                        dateCreated: new Date(),
                        uploader: user.username
                    }));

                    this.audit(user.username, config.audit.upload, `User uploaded text with id ${id} and deletion id ${deletionId}`, con, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                    res.json(responseData);
                    return true;
                } else {
                    res.json({
                        success: false,
                        error: 'Invalid upload key! (If you just changed your upload key please redownload your configs)'
                    });
                    return false;
                }
            });
        });
    }

    async runNSFEvaluation(imgData, fileID) {
        try {
            let model = await nsfwjs.load();
            let image = await tf.node.decodeImage(imgData, 3);
            let predictions = await model.classify(image);
            image.dispose();

            // Default to false
            let isNSFW = false;

            // Go through each prediction and if NSFW check its probability 
            predictions.forEach(prediction => {
                switch (prediction.className) {
                    case 'Hentai' || 'Porn' || 'Sexy':
                        if (prediction.probability >= 15) {
                            isNSFW = true;
                            return;
                        }

                        break;
                }
            });

            FileModel.findOne({ id: fileID }, (err, file) => {
                if (err)
                    return false;

                file.isNSFW = isNSFW;
                file.save();
            });

            return true;
        } catch (e) {
            console.error(`Error in NSFW evaluation: ${e}`);
        }
    }

    queryIfDeletionIdIsValid(deletionId, image, con) {
        var toReturn = true;

        FileModel.findOne({ id: image }, (err, file) => {
            if (file === undefined || file.deletionId === undefined || file.deletionId !== deletionId) {
                toReturn = false;
            }
        });

        return toReturn;
    }

    deleteImage(app, con) {
        app.get('/d', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');

            if (req.query.image === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'Invalid Request' }));
            } else if (req.query.deletionId === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'No deletion id present' }));
            } else if (req.query.type === undefined) {
                return res.status(400).send(JSON.stringify({ error: 'No file type present' }));
            } else if (!fs.existsSync(path.join(__dirname, '..', '..', 'store', 'files', req.query.image + '.' + req.query.type))) {
                return res.status(400).send(JSON.stringify({ error: 'File is already deleted or does not exist' }));
            } else if (this.queryIfDeletionIdIsValid(req.query.deletionId, req.query.image, con) === false) {
                return res.status(400).send(JSON.stringify({ error: 'Invalid deletion id' }));
            } else {
                FileModel.findOne({ id: req.query.image }, (err, file) => {
                    if (err) {
                        res.end(JSON.stringify({
                            success: false,
                            error: 'An error has occured. Please try again'
                        }));
                        return false;
                    }

                    if (file) {
                        this.audit(file.uploader, config.audit.deleteUpload, `User deleted upload ${req.query.image}`, con, (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress));

                        FileModel.deleteOne({ id: req.query.image }, (err) => {
                            if (err) {
                                res.end(JSON.stringify({
                                    success: false,
                                    error: 'An error has occured. Please try again'
                                }));
                                return false;
                            }
                        });
                    } else {
                        res.send(JSON.stringify({
                            success: false,
                            message: 'File does not exist or is already deleted.'
                        }));
                        return false;
                    }

                    //delete file(s)
                    fs.unlinkSync(path.join(__dirname, '..', '..', 'store', 'files', req.query.image + '.' + req.query.type));

                    res.send(JSON.stringify({
                        success: true,
                        message: 'File successfully deleted'
                    }));
                    return true;
                });
            }
        });
    }

    //get random key from file (requires authentication)
    getKey(app) {
        app.get('/api/v1/key', (req, res) => {
            if (req.query.token !== config.keyToken) {
                return res.status(400).send('Invalid token!');
            }

            const fs = require('fs');
            var keys = JSON.parse(fs.readFileSync('./keys.json'));
            const rKeyInt = Math.floor(Math.random() * keys.length);
            return res.send(keys[rKeyInt]);
        });
    }

    //Probably wont use but ill keep it anyways
    /*adminDomains(app, db) {
        app.post('/api/v1/admin/domains', (req, res) => {
            let key = req.body.key;
            let limit = 10;
            if (req.body.limit !== undefined) {
                limit = req.body.limit;
            }

            if (key === undefined) {
                return res.status(400).end(JSON.stringify({
                    success: false,
                    error: 'No key was provided!'
                }));
            }

            db.query("SELECT * FROM user WHERE uploadKey = ? LIMIT 1;", [key], (err, data, fields) => {
                if (err) {
                    res.end(JSON.stringify({
                        success: false,
                        error: 'An error has occured. Please try again'
                    }));
                    return false;
                }

                if (data && data.length === 1) {
                    if (!data[0].isAdmin) {
                        return res.status(400).end(JSON.stringify({
                            success: false,
                            error: 'User does not have permission to use this endpoint.'
                        }));
                    }

                    db.query(`SELECT * FROM domains LIMIT ${limit};`, (err, data, fields) => {
                        res.json({
                            success: true,
                            d: data
                        });

                        return true;
                    });
                } else {
                    return res.status(400).end(JSON.stringify({
                        success: false,
                        error: 'User does not exist!'
                    }));
                }
            });
        });
    }*/

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

    humanFileSize(bytes, si = false, dp = 1) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

        return bytes.toFixed(dp) + ' ' + units[u];
    }
}

module.exports = ApiRouter;