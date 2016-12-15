var people = require('./people.json');
let fs = require('fs');

var db = {
	getPeople: function(){
		return people;
	},

	savePeople: ()=> {
        fs.writeFile('./people.json', JSON.stringify(people), (err) => {
           if (err){
            console.log('The Database did NOT update.');
            console.log('The Database is updated!');
        }
    });
    }

};

module.exports = db;