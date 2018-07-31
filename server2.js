var restify = require('restify');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var json2xls = require('json2xls');
var fs = require('fs');


var transporter = nodemailer.createTransport({
    host: 'xxx.xx.xx.xx',
    port: 587,
    secure: false,
    tls: { rejectUnauthorized: false }
});


var db_config = {
    host: 'xxx.xx.xx.xx',
    user: 'user1',
    password: 'pass2',
    database: 'db3'
};


var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function(err) {
        console.log('db error tmstmp ' + Date().toString(), err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();


var port = 8088;
var server = restify.createServer({
    name: "ServidorContacto"
});



server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.listen(port, function() {
    console.log('%s activo en %s ', server.name, server.url);
});


var PATH = 'forms';

/*ENDPOINTs*/
server.post({ path: PATH + '/contactos', version: '0.0.1' }, contactos);
server.post({ path: PATH + '/suscripcion', version: '0.0.1' }, suscripcion);
server.post({ path: PATH + '/landing', version: '0.0.1' }, landing);
server.post({ path: PATH + '/landingdev', version: '0.0.1' }, landingdev);
server.get({ path: PATH + '/exceldb', version: '0.0.1' }, exceldb);
server.get({ path: PATH + '/excelgolf', version: '0.0.1' }, excelgolf);
server.get({ path: PATH + '/home', version: '0.0.1' }, Home);




function contactos(req, res, next) {
    var user = {};
    user.nombre = req.params.nombre;
    user.apellido = req.params.apellido;
    user.email = req.params.email;
    user.telefono = req.params.telefono;
    user.dirig = req.params.dirig;
    user.mensaje = req.params.mensaje;
    user.idform = req.params.idform;
    user.fecha = req.params.fecha;


    var sql = "CALL sp_contacto(?,?,?,?,?,?,?,?)";

    res.setHeader('Access-Control-Allow-Origin', '*');

    connection.query(sql, [user.nombre, user.apellido, user.email, user.telefono, user.dirig, user.mensaje, user.idform, user.fecha],
        function(error, success) {
            if (error) console.log(error);
            console.log('tmstmp ' + Date().toString(), success);
            res.send(200, success.insertId);
        }
    );
}



function suscripcion(req, res, next) {
    var user = {};
    user.nombre = req.params.nombre;
    user.apellido = req.params.apellido;
    user.email = req.params.email;
    user.telefono = req.params.telefono;
    user.celular = req.params.celular;
    user.localidad = req.params.localidad;
    user.producto = req.params.producto;
    user.acepta = req.params.acepta;
    user.recibe = req.params.recibe;
    user.novedad = req.params.novedad;
    user.mensaje = req.params.mensaje;
    user.idform = req.params.idform;
    user.fecha = req.params.fecha;

    console.log(user.producto);


    var sql = "CALL sp_suscripcion(?,?,?,?,?,?,?,?,?,?,?,?,?)";

    res.setHeader('Access-Control-Allow-Origin', '*');

    connection.query(sql, [user.nombre, user.apellido, user.email,
            user.telefono, user.celular, user.localidad, user.producto, user.acepta,
            user.recibe, user.novedad, user.mensaje, user.idform, user.fecha
        ],
        function(error, success) {
            if (error) console.log(error);
            console.log(success);
            res.send(200, success.insertId);
        }
    );
}

function landing(req, res, next) {
    var user = {};
    user.nombre = req.params.nombre;
    user.apellido = req.params.apellido;
    user.email = req.params.email;
    user.telefono = req.params.telefono;
    user.celular = "";
    user.idform = req.params.idform;
    user.fecha = "1991-01-01";
    user.fecnac = req.params.fecnac;
    user.sexo = req.params.sexo;
    user.empresa = req.params.empresa;
    user.cargo = req.params.cargo;
    user.handicap = req.params.handicap;
    user.talle = req.params.talle;
    user.matricula = req.params.matricula;

    user.utmsource = req.params.utmsource != null ? req.params.utmsource : "";
    user.utmmedium = req.params.utmmedium != null ? req.params.utmmedium : "";
    user.utmcampaign = req.params.utmcampaign != null ? req.params.utmcampaign : "";

    var newMsg = 'Msj para enviar';


    console.log(user.producto);

    var mailOptions = {
        from: 'my@email.com.ar',
        to: (user.idform == 8 ? user.email : 'otro@mail.com'),
        subject: (user.idform == 8 ? 'Gracias por inscribirte!' : 'Leads Landing Generica'),
        html: (user.idform == 8 ? newMsg : 'otro msj')
    };
    console.log("HOLA" + user.utmcampaign);
    if (user.utmcampaign != "otra") {
        transporter.sendMail(mailOptions, function(error, info) {
            console.log(user.utmcampaign);
            console.log(info.response);
        });
    }

    var sql = "CALL sp_landing(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    res.setHeader('Access-Control-Allow-Origin', '*');

    connection.query(sql, [user.nombre, user.apellido, user.email,
            user.telefono, user.celular, user.idform, user.fecha, user.fecnac, user.sexo, user.empresa, user.cargo, user.handicap, user.talle, user.matricula, user.utmsource, user.utmmedium, user.utmcampaign
        ],
        function(error, success) {
            if (error) console.log(error);
            console.log(success);
            res.send(200, success.insertId);
        }
    );
}


function exceldb(req, res, next) {
    var test = { hola: "hola" };
    console.log(req.headers);

    connection.query('select * from test', function(error, results, fields) {
        //		var file = fs.readFileSync(__dirname + '/data.xlsx', 'binary');
        var xls = json2xls(results);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=datos.xlsx");
        res.setHeader('Content-Length', xls.length);
        res.write(xls, 'binary');
        res.send();
        if (error) throw error;
        return next();

    });
}

function excelgolf(req, res, next) {
    var test = { hola: "hola" };
    console.log(req.headers);

    connection.query('select * from nose', function(error, results, fields) {
        //		var file = fs.readFileSync(__dirname + '/data.xlsx', 'binary');
        var xls = json2xls(results);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=datos_golf.xlsx");
        res.setHeader('Content-Length', xls.length);
        res.write(xls, 'binary');
        res.send();
        if (error) throw error;
        return next();

    });
}


function landingdev(req, res, next) {
    var user = {};
    user.nombre = req.params.nombre;
    user.apellido = req.params.apellido;
    user.email = req.params.email;
    user.telefono = req.params.telefono;
    user.celular = "";
    user.idform = req.params.idform;
    user.fecha = "1991-01-01";
    user.fecnac = req.params.fecnac;
    user.sexo = req.params.sexo;
    user.empresa = req.params.empresa;
    user.cargo = req.params.cargo;
    user.handicap = req.params.handicap;

    user.utmsource = req.params.utmsource != null ? req.params.utmsource : "";
    user.utmmedium = req.params.utmmedium != null ? req.params.utmmedium : "";
    user.utmcampaign = req.params.utmcampaign != null ? req.params.utmcampaign : "";

    console.log(user.producto);

    var mailOptions = {
        from: 'my@email.com.ar',
        to: (user.idform == 8 ? user.email : 'otro@mail.com'),
        subject: (user.idform == 8 ? 'Gracias por inscribirte!' : 'Leads Landing Generica'),
        html: (user.idform == 8 ? newMsg : 'otro msj')
    };
    console.log("HOLA" + user.utmcampaign);
    if (user.utmcampaign != "Multiled") {
        transporter.sendMail(mailOptions, function(error, info) {
            console.log(user.utmcampaign);
            console.log(info.response);
        });
    }

    console.log("HOLA" + user.utmcampaign);

    var sql = "CALL sp_landingdev(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    res.setHeader('Access-Control-Allow-Origin', '*');

    connection.query(sql, [user.nombre, user.apellido, user.email,
            user.telefono, user.celular, user.idform, user.fecha, user.fecnac, user.sexo, user.empresa, user.cargo, user.handicap, user.utmsource, user.utmmedium, user.utmcampaign
        ],
        function(error, success) {
            if (error) console.log(error);
            console.log(success);
            res.send(200, success.insertId);
        }
    );
}


function Home(req, res, next) {
    console.log("hola?");
    res.send(200, 'Hola 1122');
    return next();
}

server.get({ path: '/', version: '0.0.1' }, Home);