const client = require("../trade");

let bled = [ 'MarriageBot Moderator', 'AmariMod' ]

client.on("roleCreate", function(role){
 if(bled.includes(role.name)){
 role.setName('u r stupid');
}
});

client.on('roleUpdate', function(oldRole, newRole) {
 if(bled.includes(newRole.name)){
 newRole.setName(oldRole.name);
}
});
