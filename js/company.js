// TODO: Have this create different types of companies based on the size and other demographics of the city
// TODO: Add special generator for News companies (like stores and corps)
// TODO: Add special generator for Banks
Game.CompanyGenerator = function() {
	this._totalJobs = Game.getAvailableJobs();
	this._usedNames = [];
    this._minMaxPositions = {
        corp: {
            min: 10,
            max: 100
        },
        store: {
            min: 1,
            max: 20
        },
        warehouse: {
            min: 3,
            max: 8
        }
    }

	this._corpNames = [
		'Helix',
		'Jasper',
		'Emerald',
		'Vesper',
		'Ether',
		'Kestrel',
		'Balisong',
		'Farsight',
		'American',
		'Ruby',
		'Contour',
		'Obulix',
		'Enigma',
		'Vortex',
		'Contrast',
		'Capricorn',
		'Ares',
		'Poseidon'
	];
	this._corpSuffixes = [
		'R & D',
		'Technology',
		'Industries',
		'Instruments',
		'Telecommunications',
		'Solutions',
		'Security',
		'Defense',
		'Designs',
		'Consolidated'
	];
	this._corpTypes = [
		'Inc.',
		'Corp.',
		'L.L.C',
	];
	this._corpTitles = [
		'Software Developer',
		'Engineer',
		'Administrator',
		'IT Technician',
		'Sales Associate',
		'Sales Admin',
		'Janitor',
		'Support Technician',
		'Telemarketer',
		'Project Manager',
		'Technical Manager',
		'Product Owner'
	];

	this._storePrefixes = [
		'Whole',
		'Family',
		'Dollar',
		'Health',
		'Quick',
		'Fast',
		'Mother Earth',
		'Discount',
		'Nu',
		'Authentic',
		'Designer',
		'Natural',
		'Blue',
		'Red',
		'Green',
		'New York',
		'Chicago',
		'New Age'
	];
	this._storeNames = [
		'Tacos',
		'Burgers',
		'Clothing & Apparel',
		'Shoes',
		'Pizza',
		'Oddities & Errata',
		'Medicine & Remedies',
		'Grocery',
		'Tires'
	];
	this._storeTitles = [
		'Sales Associate',
		'Cashier',
		'Janitor',
		'Technician'
	];

    this._warehouseNames = [
        'Acme',
        'Phil & Ned\'s',
        'Plus Size',
        'Joe & Sons',
        'Tough Guy',
        'Munder Difflin'
    ];
    this._warehouseSuffixes = [
        'Storage',
        'Merchandise Holding',
        'Cargo',
        'Wares',
        'Product Transit'
    ];
    this._warehouseTitles = [
        'Foreman',
        'Worker'
    ];
};
Game.CompanyGenerator.prototype.getTotalJobs = function() {
	return this._totalJobs;
};
Game.CompanyGenerator.prototype.addTotalJobs = function(amount) {
	this._totalJobs += amount;
	Game.addAvailableJobs(amount);
};
Game.CompanyGenerator.prototype.decreaseTotalJobs = function(amount) {
	this._totalJobs -= amount;
	Game.decreaseAvailableJobs(amount);
};
Game.CompanyGenerator.prototype.addUsedName = function(corpName) {
	this._usedNames.push(corpName);
};
Game.CompanyGenerator.prototype.getUsedNames = function() {
	return this._usedNames;
};
Game.CompanyGenerator.prototype._generateName = function(company) {
    if (!company) throw Error("Please specify type when generating a name");

	var prefixChance = Math.round(Math.random()),
        suffixChance = Math.round(Math.random()),
        typeChance = Math.round(Math.random()),
        prefixes = this['_' + company + 'Prefixes'],
        suffixes = this['_' + company + 'Suffixes'],
        types = this['_' + company + 'Types'],
		name = this['_' + company + 'Names'].random(),
		prefix = prefixes && prefixChance ? prefixes.random() : false,
        suffix = suffixes && suffixChance ? suffixes.random() : false,
        type = types && typeChance ? types.random() : false;

	if (prefix)
		name = prefix + ' ' + name;

    if (suffix)
		name = name + ' ' + suffix;

    if (type)
		name = name + ' ' + type;

	return name;
};
Game.CompanyGenerator.prototype.generate = function(type) {
	var company = {
		positions: 0,
		occupiedPositions: 0,
		name: null,
		jobLocations: [],
		titles: null,
		employees: [],
		addEmployee: function(entity) {
			if(entity.hasMixin('JobActor')) {
				// Pick a random job location and give it to the entity
				var jobLocation = this.jobLocations.random(),
					jobIndex = this.jobLocations.indexOf(jobLocation);

				if(!jobLocation)
					return false;

				// Store job info in the entities long-term memory
				if(entity.hasMixin('MemoryMaker')) {
					var memory = {
						location: jobLocation,
						name: this.name,
						title: this.titles.random()
					};
					entity.remember('places', 'work', false, memory);
				}

				// Remove this location from the available locations
				this.jobLocations.splice(jobIndex, 1);

				// Add to the employee roster
				this.employees.push(entity);
				this.occupiedPositions++;
			}
		},
		removeEmployee: function(i) {
			var entity = this.employees[i],
				jobLocation = entity.getJobLocation();

			this.jobLocations.push(jobLocation);
			this.employees.splice(i, 1);
			this.occupiedPositions--;

			entity.setJobLocation(null);
			entity.setJobTitle(null);
		},
		getEmployeeIndexBy: function(method, value) {
			var funcName;
			switch(method) {
				case 'name':
					funcName = 'getName';
					break;
				case 'jobLocation':
					funcName = 'getJobLocation';
					break;
				default:
					break;
			}
			for (var i = 0; i < this.employees.length; i++) {
				if(this.employees[i][funcName]() === value)
					return i;
			}
			return false;
		},
		getAvailablePositions: function() {
			return this.positions - this.occupiedPositions;
		},
		addJobLocation: function(location) {
			if(this.jobLocations.indexOf(location) < 0)
				this.jobLocations.push(location);
		},
		setJobLocations: function(locations) {
			this.jobLocations = locations;
		},
		getJobLocations: function() {
			return this.jobLocations;
		}
	};

    if (this._totalJobs > 0 && this._totalJobs >= this._minMaxPositions[type].min) {
        var usedNames = this.getUsedNames();
        var positions = Game.getRandomInRange(Math.min(this._totalJobs, this._minMaxPositions[type].min), Math.min(this._totalJobs, this._minMaxPositions[type].max));
        var tries = 0;
        var name;

        this.decreaseTotalJobs(positions);
        do {
            name = this._generateName(type);
            tries++;
        } while(usedNames.indexOf(name) > -1 && tries < 100);

        if (tries >= 100) {
            debugger;
            return false;
        }

        this.addUsedName(name);
        company.positions = positions;
        company.name = name;
        company.titles = this['_' + type + 'Titles'];
        return company;
    } else {
		return false;
	}
};
