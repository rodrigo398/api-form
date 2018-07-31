var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'ECC API de Contactos',
  description: 'Servicio de API de Contactos en Node.',
  script: 'C:\\nodejsProjects\\contactAPI\\server2.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();


// Listen for the "uninstall" event so we know when it's done. 
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});
 
// Uninstall the service. 
// svc.uninstall();