var ovh = require('ovh')({
    endpoint: 'ovh-eu',
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    consumerKey: process.env.CONSUMER_KEY
});

var serviceName = process.env.CDN_SERVICE_NAME;

var entrypoint = function(uri) {
    return '/cdn/dedicated/' + serviceName + '/' + uri;
};

var die = function(err) {
        console.error("ERROR");
        console.error(err);
        process.exit(1);
};

var callOrDie = function(cb) {
    return function(err) {
        if (err)
            die(err);
        cb.apply(this, arguments);
    };
};

var checkLogin = function(cb) {
    ovh.request('GET', '/me', callOrDie(cb));
};

var listDomains = function(cb) {
    ovh.request('GET', entrypoint('domains'), callOrDie(cb));
};

var addDomain = function(domain, cb) {
    ovh.request('POST', entrypoint('domains'), {
        domain: domain
    }, callOrDie(cb));
};

var addDomainBackend = function(domain, ip, cb) {
    ovh.request('POST', entrypoint('domains/' + domain + '/backends'), {
        ip: ip
    }, callOrDie(cb));
};

var domain = process.argv[2];
var ip = process.argv[3] || process.env.DEFAULT_BACKEND_IP;

if (!domain || !ip) {
    console.log();
    console.log("### Usage");
    console.log();
    console.log("    node index.js <domain> <ip>");
    console.log();
    console.log("### Config");
    console.log();
    console.log("export APP_KEY=xxxxxxxxxxxxxxxx");
    console.log("export APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    console.log("export CONSUMER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    console.log("export CDN_SERVICE_NAME=cdn-xx.xxx.xxx.xx-xxxx");
    console.log("export DEFAULT_BACKEND_IP=xxx.xxx.xxx.xxx");
    console.log();
    console.log("### Authentication");
    console.log();
    console.log("How to create the above? See http://ovh.github.io/node-ovh/");
    console.log();
    console.log("If consumer key expires, generate one with ./credentials.js");
    console.log();
    process.exit(1);
}

checkLogin(function(err) {
    listDomains(function(err, domains) {
        if (domains.indexOf(domain) >= 0)
            die("Domain already exists");
        addDomain(domain, function(err, out ) {
            console.dir(out);
            addDomainBackend(domain, ip, function(err, out) {
                console.dir(out);
                console.log("done");
            });
        });
    });
});
