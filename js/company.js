// TODO: Have this create different types of companies based on the size and other demographics of the city
// TODO: Add special generator for News companies (like stores and corps)
Game.CompanyGenerator = function() {
	this._totalJobs = Game.getTotalEntities();
	this._usedCorpNames = [];
	this._usedStoreNames = [];
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
		'Enigma'
	];
	this._corpIndustries = [
		'R & D',
		'Technology',
		'Industries',
		'Instruments',
		'Telecommunications',
		'Solutions',
		'Security',
		'Defense',
		'Designs'
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
};
Game.CompanyGenerator.prototype.getTotalJobs = function(amount) {
	return this._totalJobs;
};
Game.CompanyGenerator.prototype.decreaseTotalJobs = function(amount) {
	this._totalJobs -= amount;
};
Game.CompanyGenerator.prototype.addUsedCorpName = function(corpName) {
	this._usedCorpNames.push(corpName);
};
Game.CompanyGenerator.prototype.getUsedCorpNames = function() {
	return this._usedCorpNames;
};
Game.CompanyGenerator.prototype.addUsedStoreName = function(corpName) {
	this._usedStoreNames.push(corpName);
};
Game.CompanyGenerator.prototype.getUsedStoreNames = function() {
	return this._usedStoreNames;
};
Game.CompanyGenerator.prototype._generateCorpName = function() {
	var prefixChance = Math.round(Math.random()),
		storeName = this._storeNames.random(),
		storePrefix = prefixChance ? this._storePrefixes.random() : '';

	var finalName = storeName;
	if(prefixChance)
		finalName = storePrefix + ' ' + finalName;

	return finalName;
};
Game.CompanyGenerator.prototype._generateStoreName = function() {
	var industryChance = Math.round(Math.random()),
		typeChance = Math.round(Math.random()),
		corpName = this._corpNames.random(),
		corpIndustry = industryChance ? this._corpIndustries.random() : '',
		corpType = typeChance ? this._corpTypes.random() : '';

	var finalName = corpName;
	if(industryChance)
		finalName += ' ' + corpIndustry;
	if(typeChance)
		finalName += ' ' + corpType;

	return finalName;
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
				entity.setJobLocation(jobLocation);

				// Remove this location from the available locations
				this.jobLocations.splice(jobIndex, 1);

				// Set the entity's title
				entity.setJobTitle(this.titles.random());

				// Add to the employee roster
				employees.push(entity);
				this.occupiedPositions++;
			}
		},
		removeEmployee: function(i) {
			var entity = employees[i],
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
			return positions - occupiedPositions;
		},
		addJobLocation: function(location) {
			if(this.jobLocations.indexOf(location) < 0)
				this.jobLocations.push(location);
		},
		getJobLocations: function() {
			return this.jobLocations;
		}
	};
	if(type === 'corp' && this.getTotalJobs() >= 10) {
		var usedCorpNames = this.getUsedCorpNames();
		// Set number of job positions
		var positions = Game.getRandomInRange(10, Math.min(100, this.getTotalJobs()));
		this.decreaseTotalJobs(positions);

		// Generate name
		var corpName, corpTries = 0;
		do {
			corpName = this._generateCorpName();
			corpTries++;
		} while(usedCorpNames.indexOf(corpName) >= 0 && corpTries < 100);

		if(corpTries <= 100) 
			return false;
		else {
			this.addUsedCorpName(corpName);

			company.positions = positions;
			company.name = corpName;
			company.titles = this._corpTitles;
			return company;
		}
	} else if(type === 'store' && this.getTotalJobs() >= 4) {
		var usedStoreNames = this.getUsedStoreNames();
		// Set number of job positions
		var storePositions = Game.getRandomInRange(4, Math.min(20, this.getTotalJobs()));
		this.decreaseTotalJobs(storePositions);

		// Generate name
		var storeName, storeTries = 0;
		do {
			storeName = this._generateStoreName();
			storeTries++;
		} while(usedStoreNames.indexOf(storeName) >= 0 && storeTries < 100);

		if(storeTries <= 100) 
			return false;
		else {
			this.addUsedStoreName(storeName);

			company.positions = storePositions;
			company.name = storeName;
			company.titles = this._storeTitles;
			return company;
		}
	}
};